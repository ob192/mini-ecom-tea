---
name: design-system
description: Design system of a Next.js + shadcn/ui + Tailwind v4 project — the token layers in its CSS file plus DESIGN.md. Use to set one up, to add or change a token (colour, radius, shadow, font, type step), or to audit tokens for drift, classes that compile to nothing, and contrast.
---

# Design system

The design system lives in two places: the Tailwind CSS file holds the **values** (tokens), `DESIGN.md` holds the **decisions** (roles, usage rules, observed practice). This skill sets it up, extends it, or audits it.

It adapts to the project. What the project already does — its token names, colour format, file layout, spacing rhythm — is the **observed practice**, and it wins over any default in these docs unless the user chooses to change it.

## 1. Orient (every mode)

1. Find the CSS file: `tailwind.css` in `components.json`, else the file with `@import "tailwindcss"`.
2. Read it and `DESIGN.md` if present.
3. Run the audit script from this skill's directory: `node scripts/audit.mjs <project dir>` (add `--json` for machine output). Its report is the baseline for every mode.
4. Pick the mode: **setup** (no semantic layer or no DESIGN.md, or the user asks for one), **extend** (a token to add or change), **audit** (a check). An open request ("look at our design system") starts as audit; offer the other modes after the report.

Done when you can state: the CSS file, which layers exist (palette / semantic / mapping / dark), how dark mode is switched, and the mode.

## 2. Setup

Read [references/setup.md](references/setup.md) and follow it: observe → interview → show → write → verify. Token layout is in [references/token-architecture.md](references/token-architecture.md), the DESIGN.md format in [references/design-md.md](references/design-md.md).

## 3. Extend

Read [references/token-architecture.md](references/token-architecture.md), then:

1. Confirm the token is earned: the user asked for it, or one value repeats 3+ times with the same intent (the audit's `arbitrary-repeats` lists candidates). Otherwise point to the existing token that fits.
2. Make the whole change in one edit, through every layer the project has: palette step in `@theme` (only for a new value) → semantic variable in `:root`, and in `.dark` when dark exists, written as `var(--color-…)` → mapping in `@theme inline`. Follow the project's naming family (`x` / `x-foreground` / `x-subtle` …).
3. A new `--text-*` key also goes into the project's tailwind-merge config (`extendTailwindMerge`, theme `text`), or `cn()` will drop it next to a colour class.
4. Record the token's role in DESIGN.md.

A new font family, or a step whose leading looks loose or cramped: fit line height and tracking to the font with [references/leading.md](references/leading.md) first.
5. Re-run the audit. Done when the new token has no findings and every class that uses it compiles.

## 4. Audit

Read [references/audit.md](references/audit.md). Run the script, then the judgement pass, then report by severity P0–P3. Change nothing until the user picks what to fix; fix in batches and re-run the audit after each batch.

## Ground rules

- One CSS file holds every token. No `tailwind.config.*`, no second token file in JS; code that needs a value in JS (a media query in a hook) keeps a commented copy of that one value.
- Match the project's format: hex vs OKLCH, `:is` vs `:where` in the dark variant, comment style, token names. Convert or rename only when the user chooses to.
- When code and DESIGN.md disagree, ask which is right; resolve nothing silently.
- Density, section spacing and other layout rhythm are observed practice recorded in DESIGN.md, not tokens.
