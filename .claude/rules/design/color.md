---
paths:
  - "src/**/*.{tsx,jsx}"
---

# Design rules: Colour

Applying colour. The tokens themselves (palette, roles, values) belong to the `design-system` skill.

## Before writing

- DESIGN.md: Colors (the role → use table) and Do's and Don'ts.
- The semantic layer in `src/app/globals.css` (`:root`, `.dark`, `@theme inline`): which tokens and pairs exist. The page is light; a block with the `dark` class gets the dark values of the same tokens.
- Know the token for each role the target needs: page, card, main action, secondary action, muted text, borders, each status; and where the brand colour is allowed.

A colour need no token covers is a `design-system` decision: say so (`[→ design-system]`) instead of reaching for a palette shade.

## How to check

Every rule against every target file; contrast measured on the rendered page for anything code cannot settle (text over images, opacity, overlapping surfaces).

**Severity here:** P0 unreadable or meaning lost (contrast, colour as the only signal); P1 colour a visitor sees misused (brand colour misplaced, status colour as decoration, a missing foreground); P2 a palette or raw colour that renders right.

Token names are shadcn's plus the families DESIGN.md defines (`x`, `x-foreground`, `x-subtle`, `x-subtle-foreground`, `x-strong`).

## Tokens

**C1 · P2 — Components use semantic tokens.** `bg-card`, `text-muted-foreground`, `border-border`. An opacity modifier on a token is the same token (`text-inverse-foreground/70`, `bg-primary/10`, `border-inverse-foreground/30`) and is allowed wherever the result passes contrast (C9, C10). A palette shade (`bg-neutral-100`) only for a one-off the design calls for; a raw value (`bg-[#e5e5e0]`, `style={{color: "#333"}}`) never.

**C2 · P1 — Surfaces and foregrounds come in pairs.** A component that sets a surface sets its foreground too (`bg-primary text-primary-foreground`), and one that sets a foreground sets the surface it was checked against — or inherits a surface from a parent that does. Skip it when the inherited colour already is the partner. Check each primitive on every surface DESIGN.md defines (background, subtle, card, inverse, and inside a `.dark` block): an outline control that sets only `bg-background` or only `text-foreground` breaks on the inverse band.

**C3 · P2 — States derive from the token.** Hover and pressed use the token's strong step or an opacity modifier on it (`hover:bg-primary-strong`, `hover:bg-secondary/80`), not a new palette shade per component.

**C4 · P2 — No dark-mode overrides by hand.** Tokens switch with the theme: a dark block is an element with the `dark` class, and everything in it reads the dark values of the same tokens. `dark:` colour classes are a sign a token is missing. CSS that reads a colour reads the semantic variable (`var(--border)`), not the mapped one (`var(--color-border)`), which keeps its light value inside `.dark`.

## Roles

**C5 · P1 — The brand colour has a job.** It marks the main action, the current or active state and the brand mark — the places DESIGN.md lists — and nothing else: not decorative fills, not large backgrounds, not body links unless DESIGN.md says so. One primary action per view.

**C6 · P1 — Status colours mean status.** `error`, `success`, `warning`, `info` (and `destructive`) appear only when they report a state or an action's consequence — never as decoration or category colours.

**C7 · P1 — Large areas are subtle.** Tinted backgrounds, banners and highlighted rows use `-subtle` surfaces with `-subtle-foreground` text. Saturated fills stay on small things: buttons, badges, indicators.

**C8 · P2 — Few hues per screen.** Neutrals, the brand colour and status colours. A second accent only where DESIGN.md defines one.

## Contrast and meaning

**C9 · P0 — Text contrast.** 4.5:1 against its actual background; 3:1 for 24px+ or 18.66px+ bold. Measure the rendered pair — opacity, overlays and images change it; from code, compute it through the token chain and say so. Disabled controls are exempt (WCAG 1.4.3).

**C10 · P0 — Non-text contrast.** Parts needed to see or use a control — an input's boundary, a checkbox, an icon that carries meaning, a chart line — reach 3:1 against what is next to them (WCAG 1.4.11). A control set apart by its fill rather than a border needs the fill at 3:1 instead. The focus indicator belongs to S8.

**C11 · P0 — Colour is never the only signal.** Errors also have text, status also has a label or icon, links in text also have an underline, chart series also have labels or patterns, the selected or current item also has weight, an indicator or a check. (The matching ARIA attribute is S9.)

**C12 · P1 — Text on images is protected.** A scrim, gradient or solid band behind it keeps C9 at every crop and screen size.

**C13 · P1 — Secondary text derives from its surface.** On light surfaces secondary text is `text-muted-foreground`; on a coloured or inverse surface it is that surface's foreground with an opacity modifier (`text-inverse-foreground/70`), measured at 4.5:1 against what is behind it. Never a palette grey, never the `opacity-*` utility on the element (it fades icons and children too) — that is for disabled states only.
