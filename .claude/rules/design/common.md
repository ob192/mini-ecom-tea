---
paths:
  - "{app,components,context}/**/*.{tsx,jsx}"
---

# Design rules: common

The files in this folder are the project's design rules for UI code, one per topic: colour (C), feedback (FB), forms (F), icons (I), layout (L), navigation (NV), overlays (O), states (S), tables (TB), typography (T). Mobile criteria (M1–M8) live in the `design-mobile` skill, the rendered-composition rules (V1–V16) in `design-audit`, the accessibility criteria no topic rule covers (A1–A14) in `design-a11y`. Rule IDs are unique, so a reference is just the ID: `[→ S8]`.

## Sources, in order

1. **DESIGN.md** (repo root) — the decisions: colour roles, type steps, layout recipe, motion, voice. It wins over a default in these rules; when the two disagree, ask the user which is right (`[conflict]`).
2. **Primitives** in `components/ui`.
3. **Screens that follow the system**: the page sections and interactive pieces in `components/` (structure: `CLAUDE.md`).

A colour, size or value no token covers is a `design-system` decision; do not reach for a raw value. A missing primitive is built once in `components/ui`; propose it to the user first.

## Done when

UI work is not done until both hold:

1. **The linter is clean.** `node .claude/scripts/design-lint.mjs <changed files>` reports nothing. A hook runs it after every edit of a `.tsx`/`.jsx` file under `app/`, `components/` or `context/`. A finding you keep on purpose gets `// design-lint-ignore <ID> — <reason>` (in JSX `{/* … */}`) on its line or the line above, and the reason goes into your summary.
2. **You looked at it.** The `design-audit` skill in quick mode (375 and 1440, visual rules) leaves no P0 or P1. A layout change is also looked at on both sides of every breakpoint it touches (L29). A change to a primitive, an overlay or a form also passes `design-a11y` in quick mode.

Every rule in these files is satisfied, or its exception is named in your summary.

## Severity

- **P0** — blocks or misleads a visitor: they cannot read, reach, operate or understand it; data is lost; a keyboard or screen-reader user is stuck.
- **P1** — a visitor sees it or is slowed by it: it looks broken or inconsistent, or is harder to read, use or find.
- **P2** — the visitor does not see it: system hygiene (the class is off-system but renders right) and polish. Most P2s are what the linter catches.

A rule's severity is a default. Raise it when the harm is worse in context, lower it when context removes part of the harm, and say why. An accessibility failure that blocks a user is never lowered.
