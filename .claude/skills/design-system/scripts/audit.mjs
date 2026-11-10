#!/usr/bin/env node
/**
 * Design-system audit for a Tailwind v4 project.
 *
 *   node audit.mjs [projectDir] [--css path/to/file.css] [--json]
 *
 * Read-only. Needs no dependencies of its own: it loads the project's own Tailwind
 * (`@tailwindcss/node`) so "does this class compile?" is answered by the exact version
 * the project builds with. Findings are graded P0 (silently broken) to P3 (cleanup).
 */
import fs from "node:fs"
import path from "node:path"
import {createRequire} from "node:module"
import {pathToFileURL} from "node:url"
import {execSync} from "node:child_process"

// ── arguments ────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const flag = (name) => {
	const i = argv.indexOf(name)
	if (i === -1) return undefined
	const value = argv[i + 1]
	argv.splice(i, 2)
	return value
}
const asJson = argv.includes("--json")
if (asJson) argv.splice(argv.indexOf("--json"), 1)
const cssArg = flag("--css")
const root = path.resolve(argv[0] ?? ".")

// Tailwind theme namespaces, longest first where one prefixes another.
const NAMESPACES = ["--color-", "--radius-", "--shadow-", "--text-", "--font-weight-", "--font-", "--spacing-", "--breakpoint-", "--container-", "--leading-", "--tracking-", "--animate-", "--ease-", "--blur-"]
const IGNORED_DIRS =new Set(["node_modules", ".next", ".git", "dist", "build", "out", "coverage", ".turbo", ".vercel", "worktrees"])
const SOURCE_EXT = /\.(tsx|ts|jsx|js|mjs|mdx)$/
const findings = []
const notes = []
const add = (severity, id, title, extra = {}) => findings.push({severity, id, title, ...extra})
const rel = (file) => path.relative(root, file) || file

// ── files ────────────────────────────────────────────────────────────────────

function walk(dir, test, out = []) {
	for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
		if (entry.name.startsWith(".") && entry.name !== ".claude" && entry.name !== ".cursor") continue
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			if (!IGNORED_DIRS.has(entry.name)) walk(full, test, out)
		} else if (test(full)) out.push(full)
	}
	return out
}

function findCssFile() {
	if (cssArg) return path.resolve(root, cssArg)
	const componentsJson = path.join(root, "components.json")
	if (fs.existsSync(componentsJson)) {
		const css = JSON.parse(fs.readFileSync(componentsJson, "utf8"))?.tailwind?.css
		if (css) return path.join(root, css)
	}
	const candidates = walk(root, (f) => f.endsWith(".css")).filter((f) =>
		/@import\s+["']tailwindcss["']/.test(fs.readFileSync(f, "utf8")),
	)
	return candidates[0]
}

const cssFile = findCssFile()
if (!cssFile || !fs.existsSync(cssFile)) {
	console.error(`No Tailwind v4 CSS file found under ${root} (looked for components.json → tailwind.css, then @import "tailwindcss"). Pass --css.`)
	process.exit(2)
}
const cssText = fs.readFileSync(cssFile, "utf8")
const sourceFiles = walk(root, (f) => SOURCE_EXT.test(f))

let gitRoot = root
try {
	gitRoot = execSync("git rev-parse --show-toplevel", {cwd: root, stdio: ["ignore", "pipe", "ignore"]}).toString().trim()
} catch {}

// ── CSS parsing ──────────────────────────────────────────────────────────────

const lineAt = (text, index) => text.slice(0, index).split("\n").length

/** Every custom-property declaration with the chain of block preludes around it. */
function parseDeclarations(text) {
	const clean = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
	const out = []
	const stack = []
	let buf = ""
	let bufStart = 0
	const flush = () => {
		const m = buf.match(/^\s*(--[\w-]*\*?)\s*:\s*([\s\S]*)$/)
		if (m) out.push({context: [...stack], name: m[1], value: m[2].trim(), line: lineAt(clean, bufStart + buf.search(/\S/))})
	}
	for (let i = 0; i < clean.length; i++) {
		const ch = clean[i]
		if (ch === "{" || ch === "}" || ch === ";") {
			if (ch === "{") stack.push(buf.trim())
			else {
				flush()
				if (ch === "}") stack.pop()
			}
			buf = ""
			bufStart = i + 1
		} else buf += ch
	}
	return out
}

const inTheme = (d) => d.context.some((p) => p.startsWith("@theme"))
const isDark = (d) => d.context.some((p) => /\.dark\b|data-theme=["']?dark|prefers-color-scheme:\s*dark/.test(p))
const isRoot = (d) => !inTheme(d) && !isDark(d) && d.context.some((p) => /(^|,)\s*:root\b/.test(p))

const projectDecls = parseDeclarations(cssText)
const require = createRequire(path.join(root, "package.json"))

let defaultTheme = []
try {
	defaultTheme = parseDeclarations(fs.readFileSync(require.resolve("tailwindcss/theme.css"), "utf8"))
} catch {
	notes.push("Could not read tailwindcss/theme.css; Tailwind's default tokens are treated as unknown.")
}

// `--color-*: initial` in the project's @theme drops that whole default namespace.
const resetNamespaces = projectDecls.filter((d) => inTheme(d) && /\*$/.test(d.name) && d.value === "initial").map((d) => d.name.slice(0, -1))
if (projectDecls.some((d) => inTheme(d) && d.name === "--*" && d.value === "initial")) resetNamespaces.push("--")
const keptDefaults = defaultTheme.filter((d) => !d.name.endsWith("*") && !resetNamespaces.some((ns) => d.name.startsWith(ns)))

// ── Tailwind design system ───────────────────────────────────────────────────

let ds = null
let twVersion = "?"
try {
	twVersion = JSON.parse(fs.readFileSync(require.resolve("tailwindcss/package.json"), "utf8")).version
	const tw = await import(pathToFileURL(require.resolve("@tailwindcss/node")).href)
	ds = await tw.__unstable__loadDesignSystem(cssText, {base: path.dirname(cssFile)})
} catch (error) {
	notes.push(`Could not load the project's Tailwind (${error.message.split("\n")[0]}). Class checks skipped; install dependencies and re-run.`)
}

const parse = (token) => (ds ? [...ds.parseCandidate(token)] : [])
const compiles = (token) => (ds ? ds.candidatesToCss([token])[0] !== null : true)

// ── class candidates in source ───────────────────────────────────────────────

/**
 * Tokens that look like class names: string literals split on whitespace, with file and line.
 * `strict` marks tokens that are surely meant as classes: from a string of several class-like
 * tokens, a token with a variant, or a lone token right after `className`/`cn(`/`cva(`… A lone
 * token anywhere else ("content-type", "top-right", "inline-start") is usually data.
 */
function* stringTokens(file) {
	const text = fs.readFileSync(file, "utf8")
	const literal = /"((?:\\.|[^"\\\n])*)"|'((?:\\.|[^'\\\n])*)'|`((?:\\.|[^`\\])*)`/g
	for (const m of text.matchAll(literal)) {
		if (/^\s*:(?!:)/.test(text.slice(m.index + m[0].length, m.index + m[0].length + 3))) continue // object key
		const body = (m[1] ?? m[2] ?? m[3] ?? "").replace(/\$\{[^}]*\}/g, " ")
		const parts = body.split(/(\s+)/)
		const classy = parts.filter((p) => looksLikeClass(p)).length
		const lineStart = text.lastIndexOf("\n", m.index) + 1
		const before = text.slice(Math.max(lineStart, m.index - 60), m.index)
		const classContext = /(className|class)\s*[=:]\s*\{?\s*$|\b(cn|clsx|cva|cx|twMerge|twJoin|tv)\s*\([^)]*$/.test(before)
		let offset = m.index + 1
		for (const part of parts) {
			if (part && !/^\s+$/.test(part)) yield {token: part, file, line: lineAt(text, offset), strict: classy > 1 || part.includes(":") || classContext}
			offset += part.length
		}
	}
}

// CSS property names show up in style objects and docs; as classes they never compile.
const CSS_PROPERTIES = new Set(
	"background-color border-color border-width border-radius box-shadow font-family font-size font-weight line-height letter-spacing text-decoration text-decoration-line text-align text-transform z-index min-h min-w max-h max-w min-width min-height max-width max-height content-type content-length".split(" "),
)
const looksLikeClass = (t) =>
	t.length > 2 &&
	t.length < 120 &&
	/[-:]/.test(t) &&
	!/^(https?:|\/|@|#|\.\.?\/|--|-[a-z]$)/i.test(t) &&
	!/\.[a-z]{2,}$/i.test(t) &&
	!/[{}<>"'=;,]/.test(t) &&
	!CSS_PROPERTIES.has(t)

const used = [] // valid candidates: {token, file, line, candidate}
const unknown = new Map() // token -> locations
for (const file of sourceFiles) {
	for (const hit of stringTokens(file)) {
		if (!looksLikeClass(hit.token)) continue
		const parsed = parse(hit.token)
		if (!parsed.length) continue
		if (compiles(hit.token)) used.push({...hit, candidate: parsed[0]})
		else if (hit.strict) unknown.set(hit.token, [...(unknown.get(hit.token) ?? []), hit])
	}
}

// ── declared custom properties ───────────────────────────────────────────────

const runtimeDeclared = new Set()
for (const file of sourceFiles) {
	const text = fs.readFileSync(file, "utf8")
	// style={{"--x": …}}, `[--x:…]` classes, next/font `variable: "--x"`, CSS-in-JS `--x: …;`
	for (const m of text.matchAll(/["'`](--[\w-]+)["'`]\s*:|\[(--[\w-]+):|variable:\s*["'`](--[\w-]+)["'`]|(?<![\w(-])(--[\w-]+)\s*:\s*[^;\n]*;/g))
		runtimeDeclared.add(m[1] ?? m[2] ?? m[3] ?? m[4])
}
const declared = new Set([...projectDecls.map((d) => d.name), ...keptDefaults.map((d) => d.name), ...runtimeDeclared])
// Set at runtime by Tailwind, Next.js and headless UI libraries.
const isInternal = (name) => /^--(tw|next|radix|base-ui|vaul|sonner|bn)-/.test(name)

// P0 — var() pointing at nothing
const varRefs = []
const cssClean = cssText.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
for (const m of cssClean.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) varRefs.push({name: m[1], fallback: !!m[2], file: cssFile, line: lineAt(cssClean, m.index)})
for (const u of used) for (const m of u.token.matchAll(/\((--[\w-]+)\)|var\((--[\w-]+)/g)) varRefs.push({name: m[1] ?? m[2], fallback: false, file: u.file, line: u.line})
const undefinedRefs = varRefs.filter((r) => !declared.has(r.name) && !isInternal(r.name))
const byName = groupBy(undefinedRefs, (r) => r.name)
for (const [name, refs] of byName) {
	const hard = refs.filter((r) => !r.fallback)
	add(hard.length ? "P0" : "P2", "undefined-var", `\`${name}\` is referenced but never declared${hard.length ? "" : " (every use has a fallback)"}`, {locations: refs})
}

// P0 — classes that compile to nothing
for (const [token, locations] of unknown) add("P0", "unknown-class", `\`${token}\` compiles to no CSS`, {locations, count: locations.length})

// ── dark mode ────────────────────────────────────────────────────────────────

const colorLike = (v) => /var\(--color-|#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|oklab\(|color-mix\(/i.test(v)
const rootVars = new Map(projectDecls.filter(isRoot).map((d) => [d.name, d]))
const darkVars = new Map(projectDecls.filter(isDark).map((d) => [d.name, d]))
const darkClasses = used.filter((u) => u.candidate.variants?.some((v) => v.root === "dark"))
const darkEvidence = sourceFiles.some((f) => {
	const t = fs.readFileSync(f, "utf8")
	return /attribute\s*=\s*\{?\s*["'`]class["'`]|classList\.(add|toggle)\(\s*["'`]dark["'`]|className=\{?["'`][^"'`]*\bdark\b|setTheme\(|["'`]dark["'`]\s*:\s*["'`]dark/.test(t)
})
const darkSelectorIsMedia = /@custom-variant\s+dark[^;]*prefers-color-scheme/.test(cssText) || !/@custom-variant\s+dark/.test(cssText)

if (darkVars.size) {
	const missing = [...rootVars.values()].filter((d) => colorLike(d.value) && !darkVars.has(d.name)).map((d) => d.name)
	const same = [...darkVars.values()].filter((d) => rootVars.get(d.name)?.value === d.value && colorLike(d.value)).map((d) => d.name)
	if (missing.length) add("P1", "dark-parity", `${missing.length} colour tokens in :root have no dark value`, {names: missing})
	if (same.length) add("P2", "dark-same-value", `${same.length} tokens have the same value in light and dark`, {names: same})
}
if ((darkVars.size || darkClasses.length) && !darkEvidence && !/prefers-color-scheme:\s*dark/.test(cssText) && !darkSelectorIsMedia)
	add(
		darkVars.size ? "P1" : "P2",
		"dark-inactive",
		`Nothing in the code switches on \`.dark\`, so ${[darkVars.size && "the dark tokens", darkClasses.length && `${darkClasses.length} \`dark:\` classes`].filter(Boolean).join(" and ")} never apply`,
	)

// ── contrast ─────────────────────────────────────────────────────────────────

const themeDecls = new Map([...keptDefaults, ...projectDecls.filter(inTheme)].map((d) => [d.name, d.value]))
function resolve(value, mode, depth = 0) {
	if (depth > 12 || value == null) return null
	const v = value.trim()
	const m = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/)
	if (m) {
		const next = (mode === "dark" ? darkVars.get(m[1])?.value : undefined) ?? rootVars.get(m[1])?.value ?? themeDecls.get(m[1]) ?? m[2]
		return resolve(next, mode, depth + 1)
	}
	return parseColor(v)
}

const pairs = new Map()
for (const name of rootVars.keys()) if (rootVars.has(`${name}-foreground`)) pairs.set(`${name}-foreground|${name}`, [`${name}-foreground`, name])
for (const surface of ["--background", "--card", "--muted", "--popover"])
	if (rootVars.has(surface) && rootVars.has("--muted-foreground")) pairs.set(`--muted-foreground|${surface}`, ["--muted-foreground", surface])
const modes = darkVars.size ? ["light", "dark"] : ["light"]
for (const mode of modes) {
	for (const [fg, bg] of pairs.values()) {
		const a = resolve(`var(${fg})`, mode)
		const b = resolve(`var(${bg})`, mode)
		if (!a || !b) continue
		const ratio = contrast(a, b)
		if (ratio < 4.5) add("P1", "contrast", `${mode}: \`${fg.slice(2)}\` on \`${bg.slice(2)}\` is ${ratio.toFixed(2)}:1 (text needs 4.5:1)`)
	}
}

// ── practice in feature code ─────────────────────────────────────────────────

const COLOR_ROOTS = new Set(["bg", "text", "border", "border-t", "border-r", "border-b", "border-l", "border-x", "border-y", "border-s", "border-e", "ring", "ring-offset", "outline", "fill", "stroke", "decoration", "divide", "placeholder", "caret", "accent", "shadow", "inset-shadow", "inset-ring", "from", "via", "to"])
const isUiPrimitive = (file) => /[\\/]components[\\/]ui[\\/]/.test(file)
const strip = (token) => token.replace(/^.*:/, "").replace(/!$/, "").replace(/^!/, "")

const arbitrary = groupBy(
	used.filter((u) => u.candidate.kind === "functional" && u.candidate.value?.kind === "arbitrary"),
	(u) => strip(u.token),
)
const repeated = [...arbitrary].filter(([, list]) => list.length >= 3).sort((a, b) => b[1].length - a[1].length)
if (repeated.length)
	add("P2", "arbitrary-repeats", `${repeated.length} arbitrary values repeat 3+ times — each is a token candidate if the intent is the same`, {
		items: repeated.slice(0, 20).map(([k, list]) => ({value: k, count: list.length, files: new Set(list.map((l) => l.file)).size})),
	})

const rawColors = used.filter((u) => COLOR_ROOTS.has(u.candidate.root) && u.candidate.value?.kind === "arbitrary" && /#[0-9a-f]{3,8}|rgba?\(|oklch\(|hsla?\(/i.test(u.candidate.value.value))
if (rawColors.length) add("P2", "raw-color", `${rawColors.length} classes hardcode a colour value`, {locations: rawColors})

const palette = used.filter((u) => !isUiPrimitive(u.file) && COLOR_ROOTS.has(u.candidate.root) && u.candidate.value?.kind === "named" && /-\d{2,3}$/.test(u.candidate.value.value))
const semantic = used.filter((u) => COLOR_ROOTS.has(u.candidate.root) && u.candidate.value?.kind === "named" && !/-\d{2,3}$/.test(u.candidate.value.value) && !["white", "black", "transparent", "current", "inherit"].includes(u.candidate.value.value))
if (palette.length)
	add("P2", "palette-classes", `${palette.length} palette-shade colour classes outside components/ui (vs ${semantic.length} semantic)`, {
		files: topFiles(palette),
	})
const darkColorOverrides = darkClasses.filter((u) => COLOR_ROOTS.has(u.candidate.root))
if (darkColorOverrides.length) add("P2", "dark-overrides", `${darkColorOverrides.length} \`dark:\` colour overrides — a semantic token switches by itself`, {files: topFiles(darkColorOverrides)})

// ── docs that name things that don't exist ───────────────────────────────────

const docRoots = [...new Set([root, gitRoot])]
const docFiles = docRoots.flatMap((dir) => [
	...["CLAUDE.md", "AGENTS.md", "DESIGN.md"].map((f) => path.join(dir, f)).filter((f) => fs.existsSync(f)),
	...[".claude/rules", ".claude/design", ".cursor/rules"].map((d) => path.join(dir, d)).filter((d) => fs.existsSync(d)).flatMap((d) => walk(d, (f) => /\.mdc?$/.test(f))),
])
for (const file of [...new Set(docFiles.map((f) => path.resolve(f)))]) {
	const text = fs.readFileSync(file, "utf8")
	const docVars = new Set([...text.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]))
	// Single-token code spans only: multi-word spans are commands (`npm i --prefix …`) or prose.
	for (const m of text.matchAll(/`([^`\s]+)`/g)) {
		const token = m[1].replace(/[.,;)]+$/, "")
		const line = lineAt(text, m.index)
		const tokenLike = NAMESPACES.some((ns) => token.startsWith(ns)) || /-(foreground|subtle|strong|stroke)$/.test(token) || docVars.has(token)
		// A bare token name in a token table (`border-strong` for `--border-strong`) is not a class.
		if (declared.has(`--${token}`)) continue
		if (/^--[\w-]+$/.test(token) && tokenLike && !declared.has(token) && !isInternal(token)) add("P1", "docs-drift", `${rel(file)}:${line} names \`${token}\`, which is not declared`)
		else if (looksLikeClass(token) && parse(token).length && !compiles(token)) add("P1", "docs-drift", `${rel(file)}:${line} names class \`${token}\`, which compiles to nothing`)
	}
}

// ── orphans ──────────────────────────────────────────────────────────────────

// Tailwind's own defaults reference some tokens (`--default-font-family: var(--font-sans)`).
const referencedVars = new Set([...varRefs.map((r) => r.name), ...defaultTheme.flatMap((d) => [...d.value.matchAll(/(?:var|--theme)\(\s*(--[\w-]+)/g)].map((m) => m[1]))])
for (const file of sourceFiles) for (const m of fs.readFileSync(file, "utf8").matchAll(/var\(\s*(--[\w-]+)/g)) referencedVars.add(m[1])
const usedKeys = new Set()
for (const u of used) {
	if (u.candidate.value?.kind === "named") usedKeys.add(u.candidate.value.value)
	for (const v of u.candidate.variants ?? []) if (v.root) usedKeys.add(v.root)
	if (u.candidate.kind === "static") usedKeys.add(u.candidate.root)
}
const orphanTheme = projectDecls
	.filter((d) => inTheme(d) && !d.context.some((p) => /@theme\s+inline/.test(p)) && !d.name.endsWith("*") && !d.name.includes("--", 2))
	.filter((d) => {
		const ns = NAMESPACES.find((n) => d.name.startsWith(n))
		return ns && !usedKeys.has(d.name.slice(ns.length)) && !referencedVars.has(d.name)
	})
	.map((d) => d.name)
const orphanSemantic = [...rootVars.keys()].filter((n) => !referencedVars.has(n))
const orphanShades = orphanTheme.filter((n) => /^--color-[a-z]+-\d+$/.test(n))
const orphanOther = orphanTheme.filter((n) => !orphanShades.includes(n))
if (orphanOther.length) add("P3", "unused-theme-tokens", `${orphanOther.length} theme tokens are never used by a class or var()`, {names: orphanOther})
if (orphanShades.length) add("P3", "unused-palette-shades", `${orphanShades.length} palette shades are never used (harmless: Tailwind emits only what is used)`)
if (orphanSemantic.length) add("P3", "unused-semantic-tokens", `${orphanSemantic.length} :root tokens are never referenced`, {names: orphanSemantic})

// ── structure ────────────────────────────────────────────────────────────────

const strayConfig = fs.readdirSync(root).filter((f) => /^tailwind\.config\.(js|cjs|mjs|ts)$/.test(f))
if (/@config\s/.test(cssText)) add("P2", "js-config", "The CSS still loads a JS config with `@config`; tokens belong in `@theme`")
else if (strayConfig.length) add("P3", "stray-config", `\`${strayConfig[0]}\` exists but nothing loads it`)

const layers = {
	palette: projectDecls.some((d) => inTheme(d) && /^--color-[\w-]+-\d{2,3}$/.test(d.name)),
	semantic: rootVars.size > 0,
	mapping: projectDecls.some((d) => d.context.some((p) => /@theme\s+inline/.test(p)) && /^--color-/.test(d.name)),
	dark: darkVars.size > 0,
}

// ── output ───────────────────────────────────────────────────────────────────

const summary = {
	project: root,
	css: rel(cssFile),
	tailwind: twVersion,
	sourceFiles: sourceFiles.length,
	layers,
	classes: {valid: used.length, semanticColor: semantic.length, paletteColor: palette.length, arbitrary: [...arbitrary.values()].reduce((n, l) => n + l.length, 0)},
}

if (asJson) {
	console.log(JSON.stringify({summary, findings: findings.map(serialize), notes}, null, 2))
} else {
	const out = []
	out.push(`# Design-system audit — ${path.basename(root)}`)
	out.push("")
	out.push(`CSS \`${summary.css}\` · Tailwind ${twVersion} · ${sourceFiles.length} source files`)
	out.push(`Layers: palette ${yes(layers.palette)} · semantic :root ${yes(layers.semantic)} · @theme inline mapping ${yes(layers.mapping)} · dark ${yes(layers.dark)}`)
	out.push(`Colour classes: ${semantic.length} semantic, ${palette.length} palette shades (outside ui/) · ${summary.classes.arbitrary} arbitrary values`)
	for (const severity of ["P0", "P1", "P2", "P3"]) {
		const list = findings.filter((f) => f.severity === severity)
		if (!list.length) continue
		out.push("", `## ${severity} — ${{P0: "silently broken", P1: "wrong for users", P2: "drift", P3: "cleanup"}[severity]}`)
		for (const f of list) {
			out.push(`- [${f.id}] ${f.title}`)
			if (f.locations) out.push(`  ${f.locations.slice(0, 4).map((l) => `${rel(l.file)}:${l.line}`).join(", ")}${f.locations.length > 4 ? `, +${f.locations.length - 4}` : ""}`)
			if (f.names) out.push(`  ${f.names.slice(0, 15).join(" ")}${f.names.length > 15 ? ` +${f.names.length - 15}` : ""}`)
			if (f.items) for (const i of f.items) out.push(`  \`${i.value}\` ×${i.count} in ${i.files} files`)
			if (f.files) out.push(`  ${f.files.map(([file, n]) => `${file} (${n})`).join(", ")}`)
		}
	}
	if (!findings.length) out.push("", "No findings.")
	if (notes.length) out.push("", "## Notes", ...notes.map((n) => `- ${n}`))
	console.log(out.join("\n"))
}

// ── helpers ──────────────────────────────────────────────────────────────────

function groupBy(list, key) {
	const map = new Map()
	for (const item of list) map.set(key(item), [...(map.get(key(item)) ?? []), item])
	return map
}

function topFiles(list) {
	return [...groupBy(list, (u) => rel(u.file))].sort((a, b) => b[1].length - a[1].length).slice(0, 5).map(([file, l]) => [file, l.length])
}

function serialize(f) {
	return {...f, locations: f.locations?.map((l) => ({file: rel(l.file), line: l.line}))}
}

function yes(value) {
	return value ? "yes" : "no"
}

/** sRGB channels in 0..1 for hex, rgb(), hsl(), oklch(); null for anything else. */
function parseColor(value) {
	const v = value.trim().toLowerCase()
	if (v === "white") return [1, 1, 1]
	if (v === "black") return [0, 0, 0]
	let m = v.match(/^#([0-9a-f]{3,8})$/)
	if (m) {
		let h = m[1]
		if (h.length <= 4) h = [...h].map((c) => c + c).join("")
		return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
	}
	m = v.match(/^rgba?\(\s*([\d.]+)%?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?/)
	if (m) return m.slice(1, 4).map((n) => Number(n) / 255)
	m = v.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/)
	if (m) {
		const [h, s, l] = [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100]
		const k = (n) => (n + h / 30) % 12
		const a = s * Math.min(l, 1 - l)
		return [0, 8, 4].map((n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))
	}
	m = v.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/)
	if (m) {
		const L = Number(m[1]) / (m[2] ? 100 : 1)
		const C = Number(m[3])
		const H = (Number(m[4]) * Math.PI) / 180
		const a = C * Math.cos(H)
		const b = C * Math.sin(H)
		const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
		const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
		const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
		const lin = [4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s]
		return lin.map((c) => {
			const x = Math.min(1, Math.max(0, c))
			return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
		})
	}
	return null
}

function contrast(a, b) {
	const lum = (rgb) => {
		const [r, g, bl] = rgb.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
		return 0.2126 * r + 0.7152 * g + 0.0722 * bl
	}
	const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
	return (x + 0.05) / (y + 0.05)
}
