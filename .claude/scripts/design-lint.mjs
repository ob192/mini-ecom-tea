#!/usr/bin/env node
// Design linter: the rules in .claude/rules/design/ that a search can settle.
//
//   node .claude/scripts/design-lint.mjs [files…]   lint these files (default: every .tsx/.jsx under the UI roots)
//   node .claude/scripts/design-lint.mjs --hook     PostToolUse hook: lint the edited file, exit 2 on findings
//
// Keep a finding on purpose with `design-lint-ignore <ID> — <reason>` in a comment on its line or the line above.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const CSS = join(ROOT, "app/globals.css");
// This repo is root-level App Router: no `src/`, UI lives in app/, components/ and context/.
const UI_ROOTS = ["app", "components", "context"];
// Code that is not held to the rules yet.
const LEGACY = [];
// Specimen pages show palette shades on purpose (design-audit review.md, "Specimen pages").
const SPECIMEN = ["app/playground/", "components/playground/"];
const ICON_SET = "lucide-react";
const PRIMITIVES = "components/ui/";

// Palette families: `--color-<family>-<step>` in the CSS file. Their shades belong in tokens, not components.
function paletteFamilies() {
	if (!existsSync(CSS)) return [];
	const css = readFileSync(CSS, "utf8");
	const families = new Set([...css.matchAll(/--color-([a-z]+(?:-[a-z]+)*)-\d{2,3}\s*:/g)].map((m) => m[1]));
	return [...families];
}

const COLOR_UTIL = "bg|text|border(?:-[trblxy])?|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|divide|shadow|caret|accent|placeholder";
const families = paletteFamilies();
const SPACING_UTIL = "p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|top|right|bottom|left|inset|inset-x|inset-y";
const V = "(?:[a-z0-9-]+:)*"; // variant prefixes: md:, hover:, group-hover:, …

/** Line-based checks: [id, severity, regex, message]. */
const LINE_CHECKS = [
	families.length && [
		"C1", "P2",
		new RegExp(`(?<![\\w-])${V}-?(?:${COLOR_UTIL})-(?:${families.join("|")})-\\d{2,3}(?:\\/\\d+)?(?![\\w-])`, "g"),
		"palette shade in a component. Fix: the semantic token for the role (`bg-primary`, `text-muted-foreground`, `bg-error-subtle`); a role no token covers is a design-system decision",
	],
	[
		"C1", "P2",
		new RegExp(`(?<![\\w-])${V}(?:${COLOR_UTIL})-(?:white|black)(?:\\/\\d+)?(?![\\w-])`, "g"),
		"raw white/black. Fix: the token for the role (`bg-background`, `text-inverse-foreground`, …)",
	],
	[
		"C1", "P2",
		new RegExp(`(?<![\\w-])${V}(?:${COLOR_UTIL})-\\[(?:#|rgb|hsl|oklch|color-mix)`, "g"),
		"raw colour value in a class. Fix: a semantic token",
	],
	["C4", "P2", /(?<![\w-])dark:(?:bg|text|border|ring|fill|stroke|from|via|to)-/g, "dark: colour override. Fix: tokens switch with the theme; a missing one is a design-system decision"],
	["T1", "P2", new RegExp(`(?<![\\w-])${V}text-\\[\\d`, "g"), "arbitrary font size. Fix: a step of the type scale (`text-sm` … `text-9xl`)"],
	["T6", "P2", new RegExp(`(?<![\\w-])${V}leading-\\[`, "g"), "arbitrary line height. Fix: the step carries its leading; a loose or cramped step is a token fix"],
	["L1", "P2", new RegExp(`(?<![\\w-])${V}-?(?:${SPACING_UTIL})-\\[\\d[\\d.]*(?:px|rem|em)\\]`, "g"), "arbitrary spacing. Fix: a numeric step (`gap-3`, `p-6`) or a DESIGN.md recipe"],
	["L21", "P2", /(?<![\w-])w-(\d+(?:\.\d+)?|px|full)\s+(?:[^"'`]*\s)?h-\1(?![\w.-])/g, "w-N h-N. Fix: `size-N`"],
	["L21", "P2", /(?<![\w-])h-(\d+(?:\.\d+)?|px|full)\s+(?:[^"'`]*\s)?w-\1(?![\w.-])/g, "h-N w-N. Fix: `size-N`"],
	["L22", "P2", new RegExp(`(?<![\\w-])${V}-?z-\\[`, "g"), "arbitrary z-index. Fix: a step of the small scale (`z-10`, `z-20`, `z-50`)"],
	["M5", "P1", new RegExp(`(?<![\\w-])${V}(?:min-h|h|max-h)-screen(?![\\w-])`, "g"), "100vh on phones hides content under the browser bars. Fix: `*-dvh` / `*-svh` (design-mobile M5)"],
];

/** Tag-based checks run on whole JSX opening tags. */
function tagChecks(file, src, report) {
	const tagRe = /<(div|span|li|p|section|article|img|a)\b/g;
	for (const m of src.matchAll(tagRe)) {
		const tag = readTag(src, m.index);
		const name = m[1];
		if (/\sonClick=/.test(tag) && !/\shref=/.test(tag)) {
			if (name === "a") report("NV5", "P0", m.index, "`<a onClick>` without href. Fix: a `<button type=\"button\">` for an action, or an href for a link");
			else if (name !== "img" && !/\srole=["'](?:button|link)/.test(tag))
				report("NV5", "P0", m.index, `clickable <${name}>. Fix: a \`<button type="button">\` for an action, a link for navigation`);
		}
	}
	for (const m of src.matchAll(/<([a-z][a-z0-9]*)\b/g)) {
		const tag = readTag(src, m.index);
		const space = tag.match(new RegExp(`(?<![\\w-])${V}space-[xy]-[\\w.]+`));
		if (!space || tag.endsWith("/>")) continue;
		if (childTags(readBody(src, m.index + tag.length, m[1])).some((t) => /(?<![\w-])(?:hidden|sr-only)(?![\w-])/.test(t)))
			report("L3", "P2", m.index + space.index, `\`${space[0]}\` over a child that can be hidden — space-x/space-y leaves the visible child above it with a trailing margin. Fix: \`flex flex-col gap-*\` (\`flex gap-*\` for space-x)`);
	}
	if (!file.startsWith(PRIMITIVES)) {
		for (const m of src.matchAll(/(?<![\w-])fixed\s+(?:[^"'`]*\s)?inset-0(?![\w-])/g))
			report("O14", "P2", m.index, "hand-built overlay. Fix: build it on a primitive (`Sheet`, a `Dialog`); a missing one is added once to src/shared/components/ui");
	}
}

/** The opening tag starting at `i`, skipping `>` inside braces and strings. */
function readTag(src, i) {
	let depth = 0, quote = null;
	for (let j = i + 1; j < src.length && j < i + 4000; j++) {
		const c = src[j];
		if (quote) { if (c === quote && src[j - 1] !== "\\") quote = null; continue; }
		if (c === '"' || c === "'" || c === "`") quote = c;
		else if (c === "{") depth++;
		else if (c === "}") depth--;
		else if (c === ">" && depth === 0) return src.slice(i, j + 1);
	}
	return src.slice(i, i + 4000);
}

/** The children of a `<name>` element whose opening tag ends at `from`, up to its matching closing tag. */
function readBody(src, from, name) {
	const re = new RegExp(`<(/?)${name}\\b`, "g");
	re.lastIndex = from;
	let depth = 1;
	for (let m; (m = re.exec(src)); ) {
		if (m[1]) depth--;
		else if (!readTag(src, m.index).endsWith("/>")) depth++;
		if (depth === 0) return src.slice(from, m.index);
	}
	return src.slice(from);
}

/** The opening tags of the direct children in a JSX body; fragments are transparent. */
function childTags(body) {
	const tags = [], re = /<(\/?)([A-Za-z][\w.]*)?/g;
	let depth = 0;
	for (let m; (m = re.exec(body)); ) {
		if (!m[2]) continue;
		if (m[1]) { depth--; continue; }
		const tag = readTag(body, m.index);
		re.lastIndex = m.index + tag.length;
		if (depth === 0) tags.push(tag);
		if (!tag.endsWith("/>")) depth++;
	}
	return tags;
}

function importChecks(src, report) {
	for (const m of src.matchAll(/from\s+["']((?:react-icons\/[a-z0-9]+)|lucide-react|@heroicons\/[^"']+|@tabler\/icons-react|@phosphor-icons\/[^"']+)["']/g)) {
		if (m[1] !== ICON_SET)
			report("I1", "P1", m.index, `icon from \`${m[1]}\`. Fix: the project's set, \`${ICON_SET}\``);
	}
}

function lintFile(abs) {
	const file = relative(ROOT, abs);
	if (LEGACY.some((p) => file.startsWith(p))) return [];
	const src = readFileSync(abs, "utf8");
	const lines = src.split("\n");
	const starts = [0];
	for (let i = 0; i < src.length; i++) if (src[i] === "\n") starts.push(i + 1);
	const lineAt = (idx) => {
		let lo = 0, hi = starts.length - 1;
		while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; }
		return lo + 1;
	};
	const ignored = (line, id) => [lines[line - 1], lines[line - 2]].some((l) => l && new RegExp(`design-lint-ignore\\b[^\\n]*\\b${id}\\b`).test(l));
	const found = new Map();
	const specimen = SPECIMEN.some((p) => file.startsWith(p));
	const report = (id, sev, idx, msg) => {
		const line = lineAt(idx);
		if (ignored(line, id) || (specimen && id === "C1")) return;
		const key = `${line}:${id}:${msg}`;
		if (!found.has(key)) found.set(key, { file, line, id, sev, msg });
	};
	lines.forEach((text, i) => {
		if (/^\s*(\/\/|\*|\/\*)/.test(text)) return;
		for (const check of LINE_CHECKS) {
			if (!check) continue;
			const [id, sev, re, msg] = check;
			for (const m of text.matchAll(re)) {
				const cls = /\s/.test(m[0].trim()) ? m[0].trim() : text.slice(m.index).match(/^\s*[^\s"'`]+/)[0].trim();
				report(id, sev, starts[i] + m.index, `\`${cls}\` — ${msg}`);
			}
		}
	});
	tagChecks(file, src, report);
	importChecks(src, report);
	return [...found.values()];
}

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) walk(p, out);
		else if (/\.(tsx|jsx)$/.test(name)) out.push(p);
	}
	return out;
}

function format(findings) {
	const order = { P0: 0, P1: 1, P2: 2 };
	return findings
		.sort((a, b) => order[a.sev] - order[b.sev] || a.file.localeCompare(b.file) || a.line - b.line)
		.map((f) => `[${f.id} · ${f.sev}] ${f.file}:${f.line} — ${f.msg}`)
		.join("\n");
}

const args = process.argv.slice(2);
if (args[0] === "--hook") {
	let input = {};
	try { input = JSON.parse(readFileSync(0, "utf8")); } catch { process.exit(0); }
	const path = input.tool_input?.file_path;
	if (!path || !/\.(tsx|jsx)$/.test(path)) process.exit(0);
	const abs = resolve(path);
	const rel = relative(ROOT, abs);
	if (!UI_ROOTS.some((r) => rel === r || rel.startsWith(`${r}/`)) || !existsSync(abs)) process.exit(0);
	const findings = lintFile(abs);
	if (!findings.length) process.exit(0);
	process.stderr.write(
		`design-lint: ${findings.length} finding(s) in ${relative(ROOT, abs)} (rules: .claude/rules/design/). Fix them, or keep one on purpose with \`design-lint-ignore <ID> — <reason>\` on the line above and name it in your summary.\n${format(findings)}\n`,
	);
	process.exit(2);
}

const files = args.length
	? args.map((a) => resolve(a))
	: UI_ROOTS.flatMap((r) => (existsSync(join(ROOT, r)) ? walk(join(ROOT, r)) : []));
const findings = files.filter((f) => existsSync(f) && /\.(tsx|jsx)$/.test(f)).flatMap(lintFile);
if (findings.length) {
	console.log(format(findings));
	const bySev = findings.reduce((acc, f) => ((acc[f.sev] = (acc[f.sev] || 0) + 1), acc), {});
	console.log(`\n${findings.length} finding(s): ${Object.entries(bySev).map(([s, n]) => `${s} ${n}`).join(", ")}`);
	process.exit(1);
}
console.log("design-lint: clean");
