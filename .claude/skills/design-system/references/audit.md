# Audit

## Script

`node scripts/audit.mjs <project dir> [--css <file>] [--json]` — read-only, under a second on a large app. It loads the project's own Tailwind, so "compiles to nothing" means exactly that for the version the project builds with. If it cannot load Tailwind (dependencies not installed), it says so in Notes and skips class checks.

| Id | Severity | Finds | Known false positives |
|---|---|---|---|
| `unknown-class` | P0 | a class that compiles to no CSS (`ring-focus` with no `--color-focus`) | a class defined in plain CSS outside Tailwind, or a JS string that only looks like a class |
| `undefined-var` | P0 | `var(--x)` where `--x` is never declared | variables set at runtime by a library or inline style the script did not recognise |
| `dark-inactive` | P1 / P2 | a `.dark` block or `dark:` classes with nothing that adds `.dark` | a switch implemented in a way the script does not recognise |
| `dark-parity` | P1 | colour tokens in `:root` with no dark value | — |
| `contrast` | P1 | an `x-foreground` on `x` pair, or `muted-foreground` on a surface, under 4.5:1 | a pair used only for large text (3:1 is enough) or decoration |
| `docs-drift` | P1 | CLAUDE.md, AGENTS.md, DESIGN.md or rules naming a token or class that does not exist | an example of what not to write |
| `undefined-var` with fallback, `dark-same-value` | P2 | tokens identical in both modes | brand colours that deliberately stay the same |
| `arbitrary-repeats` | P2 | an arbitrary value used 3+ times | values with different intents that happen to match |
| `raw-color` | P2 | a hardcoded colour in a class | brand artwork, third-party marks |
| `palette-classes` | P2 | palette-shade colour classes outside `components/ui` | a shade the design calls for once |
| `dark-overrides` | P2 | `dark:` colour classes — a semantic token switches by itself | — |
| `js-config`, `stray-config` | P2 / P3 | a JS Tailwind config still loaded or left behind | — |
| `unused-theme-tokens`, `unused-semantic-tokens`, `unused-palette-shades` | P3 | tokens nothing uses | tokens used only in a file type the script does not scan |

## Judgement pass

After the script, look at what it cannot decide:

- For each P0/P1 finding, confirm it is real (open the location) and note the fix: which existing token replaces a dead class, which value fixes a contrast pair while keeping the look.
- For `arbitrary-repeats`: does each repeated value share one intent? Same intent → token candidate (name it by role); different intents → leave.
- For `palette-classes`: which semantic token each common palette class maps to. A missing role is a token candidate.
- Scale health: steps out of order (a 500 darker than 600), near-duplicate steps, two scales doing one job.
- Consistency with DESIGN.md: practice that drifted from what it records (a section gap or a control height that differs between screens).

## Report

Group by severity, P0 first. Each line: what is wrong, where (file:line or count), the proposed fix. Keep **measured** findings (from the script) apart from **judgement** findings. Keep P3 short.

End with the choice for the user: which groups to fix now. Fix in batches, re-run the audit after each batch, and show the before/after counts.
