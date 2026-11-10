---
name: design-playground
description: The project's dev-only /playground — a living design-system reference built from the real tokens and components, plus exploration pages that stack 2–5 variants of a section or component on one page for the user to choose from. Use to create or update the reference page, to show options before a design decision (other design skills send you here), or to clean up explorations once the user has chosen.
---

# Playground

A dev-only area of the site where design is seen, not described. Two kinds of page live there:

- **The reference** (`/playground`) — the design system rendered from its real tokens and primitives: colours as pairs with contrast, type, radii, every primitive with its variants and states. It is always current.
- **Explorations** (`/playground/<topic>`) — 2–5 variants of one thing (a hero, a card, a pricing block), rendered with the project's real components and copy, for the user to pick from. They are temporary.

Everything here is built from the project's own tokens and primitives. A variant that needs a new token or primitive says so on the page; the decision goes through the `design-system` skill.

## 1. Orient

1. Find the playground: `app/playground/**` (App Router; this repo has no Pages Router). Note the router, how the page is kept out of production, and the explorations that exist.
2. Read DESIGN.md, the tokens in the project's CSS file, and the primitives in the `ui` directory (the `ui` alias in `components.json`, else `components/ui`).
3. Pick the mode: **create** (no playground), **update** (tokens or primitives changed, or the reference misses something), **explore** (a decision needs options), **clean** (an exploration was decided or abandoned).

Done when you can state the playground's path and guard, the explorations that exist with their status, and the mode.

## 2. Create or update the reference

Read [references/reference-page.md](references/reference-page.md) and follow it. The page renders only from real classes and primitives — a swatch is `bg-card`, a button is `<Button>` — so it breaks when the system does.

Done when every token group and every primitive in the `ui` directory appears on the page, colour pairs show measured contrast, and the page returns 404 in a production build.

## 3. Explore

Read [references/explorations.md](references/explorations.md) and follow it.

1. **Clean first.** List existing explorations. Delete the ones already decided or abandoned (after saying which); keep an undecided one only if the user wants it kept.
2. **Brief.** One line per variant: the idea, what it trades off. Agree the brief with the user when the variants are not obvious from the request.
3. **Build** the exploration page: variants stacked a screen apart, each a full, real render.
4. **Check.** Run the `design-audit` skill on each variant at 375, 768, 1023 and 1440 — the last width before each breakpoint is where a layout built for phones or desktop falls apart. Fix P0 and P1 before showing; a variant whose idea cannot hold at some width says so in its label.
5. **Show.** Screenshot each variant at the same widths and give the user the link with the numbered one-line ideas. Ask which to keep, or what to combine.

Done when every variant renders at 375, 768, 1023 and 1440 without horizontal scroll and without a P0 or P1 from design-audit, uses only tokens and primitives (or names the token it proposes), and the user has the link.

## 4. Clean

When the user picks a variant: move its code to its real place (a section component) as it is — copy still written in the markup; extracting it into content files is a separate step the user asks for — move kept assets out of `public/playground/`, record any new decision in DESIGN.md (through `design-system` when it is a token), and delete the exploration page, its components and its assets. When an exploration is abandoned, delete it the same way.

Done when nothing of the exploration is left under the playground paths and the chosen code builds in its real place.

## Ground rules

- Dev-only: every playground page returns 404 in production and carries `noindex`.
- Real content in the site's language, written straight into the variant's markup — the brand's copy, real prices — never lorem ipsum, and no content files, config lookups or `.map` over arrays of copy while the design is open. Awkward cases (long text, empty, error) belong on the page too.
- Generated media (images, video) for an exploration goes to `public/playground/<topic>/`. Generating it through a paid API needs the user's go-ahead on the cost.
