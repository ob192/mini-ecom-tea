# Explorations

How to build `/playground/<topic>`: a page that shows 2–5 variants of one thing so the user can choose.

## Files

```
src/app/playground/<topic>/page.tsx                               page: guard, stacked variants
src/widgets/playground/playground-<topic>/ui/Playground<Topic>*.tsx one file per variant, plus shared pieces
public/playground/<topic>/                                        media made for the exploration
```

Nothing outside these paths changes for an exploration, except a new primitive or token the user agreed to.

## Variants

- **Two to five, each a distinct idea** — a different structure, hierarchy or mood, not the same layout in another colour. Name each by its idea ("Waves", "Dark band", "Editorial split"), not only a letter.
- **Full, real renders.** Each variant renders at full page width as it would ship — header and section together when the topic is a hero — with real copy written into the markup and the project's primitives and tokens.
- **Responsive.** Each variant works at 375, 768, 1023 and 1440 — designed for tablets, not a phone layout stretched to 1023; check 320 for overflow.
- **Honest about what is missing.** A variant that needs a token, primitive or asset the project lacks shows it (a placeholder, a note) and names it in its notes.

## The page

- **Stacked, a screen apart.** Every variant on one page, top to bottom, each at full width. Between two variants, an empty block one viewport tall (`h-svh`), so each is judged as a first screen with nothing of its neighbour in view. No switcher or sticky bar over the variants.
- **A label above each.** Two small lines in the page's own container: the number and name ("2. Червоні плитки"), then the idea and trade-off in one sentence. The user names a variant by its number.
- **Out of production.** The same guard and `noindex` as the reference page.

## Showing

Open the page, run `design-audit` on every variant and screenshot it at 375, 768, 1023 and 1440, and send the user the link with the numbered list of ideas. The question is concrete: which variant, or which parts of which to combine.

## Cleaning

- **Before a new exploration:** list `src/app/playground/*/` and `src/widgets/playground/*` (other than `playground-reference`) and `public/playground/*`; delete what was decided or abandoned, saying what you deleted.
- **After a choice:** move the chosen variant to its real component, move kept assets to their real public path, delete the rest of the exploration.
