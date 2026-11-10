---
paths:
  - "{app,components,context}/**/*.{tsx,jsx}"
---

# Design rules: Layout

How things sit on the page: spacing, containers, grids, nesting of surfaces, alignment, responsive behaviour.

## Before writing

- DESIGN.md: Layout, Elevation & Depth, Shapes; the primitives in `components/ui`; the page sections in `components/`.
- Know the container recipe, section spacing, card padding, the surface steps and the breakpoints, each from DESIGN.md, a primitive or a screen, or "not decided". A value they do not cover is a decision: pick the nearest existing step and say so, or ask the user when it will repeat.
- When a section has real alternatives (two or three ways to arrange it), show them with the `design-playground` skill before choosing.
- A change made for one width (a phone fix) is looked at across its whole range (L29).

## How to check

Every rule against every target file, and the rendered page at the widths in the review protocol (`.claude/skills/design-audit/references/review.md`, "Widths"). Type, colour or form problems you notice go to their owner as `[→ T2]` and the like.

**Severity here:** P0 broken for users (page overflow, overlap, unreachable content); P1 a visitor sees it (inconsistent rhythm, nesting, misaligned edges); P2 an off-scale value or a pattern that renders right.

DESIGN.md sets the actual values.

## Spacing and rhythm

**L1 · P2 — Spacing comes from the scale and the recipe.** Numeric Tailwind steps (`gap-3`, `p-6`, `py-24`), and where DESIGN.md names a value for a role — card padding, container, section spacing — exactly that value: `p-5` on a card whose recipe is `p-4`/`p-6` is off-recipe even though it is on the scale. An arbitrary value (`gap-[18px]`) only for one-off art direction, never for a value that repeats.

**L2 · P1 — Proximity shows grouping.** Space inside a group is smaller than space between groups. A ladder that works with a 4px base:

| Between | Typical |
|---|---|
| inside a control or chip (icon ↔ label) | `gap-1.5`–`gap-2` |
| label ↔ control ↔ hint; title ↔ text in a card | `gap-1`–`gap-3` |
| items of a list, fields of a form, cards in a grid | `gap-3`–`gap-6` |
| blocks inside a section (heading ↔ content) | `gap-8`–`gap-12` |
| sections | `py-16`–`py-24` |

Use the project's steps from DESIGN.md where they exist. Inside controls the gap follows the control's size (an `xs` badge may use `gap-1`).

**L3 · P2 — Parents space their children.** `flex`/`grid` with `gap-*`, or `space-x-*`/`space-y-*` for a plain stack whose children are always shown. When a child can be hidden by a class (`hidden`, `md:hidden`, `sr-only`), the parent is `flex`/`flex-col` with `gap-*`: `space-*` puts a margin on every child but the last, so a hidden last child leaves the visible one above it with a trailing margin, while `gap` skips hidden children. No margins between siblings; `mt-*` only for a single optical offset.

**L4 · P1 — One container.** Every section uses the container recipe from DESIGN.md (`mx-auto max-w-* px-*`). A full-bleed band puts the same container inside it.

**L5 · P1 — Same kind, same rhythm.** Sections of one kind share their vertical padding; cards of one kind share their padding and inner gap; comparable screens share density.

## Surfaces and nesting

**L6 · P1 — No card in a card.** A block inside a card is grouped by spacing, a separator, or one inset on a different surface (`bg-background` inside `bg-card`, `bg-card` inside `bg-subtle`). Never the same surface again with its own padding and radius.

**L7 · P1 — Each nesting level steps the surface.** `background → subtle → card`, or back to `background` for an inset. At most two levels of framed surfaces on one screen.

**L8 · P1 — Depth follows DESIGN.md Elevation.** By default a surface is set apart by its colour or by a border, not both, and shadows stay on overlays. Controls are exempt: an input's or outline button's border is its affordance, not depth.

**L9 · P2 — Radii nest.** An inner element's radius is smaller than its container's. When the padding between them is small (8px or less), make the curves concentric: inner = outer − padding (`rounded-2xl p-2` holds `rounded-md`). With generous padding any clearly smaller step reads right (`rounded-4xl p-6` holds `rounded-2xl`).

## Alignment

**L10 · P1 — Shared edges.** Content in a column starts at one left edge; text inside a card aligns to the card's padding; headings, text and buttons of a section align to each other.

**L11 — Icon alignment.** Owned by I13: report `[→ I13]`.

**L12 · P1 — One focal point.** A section has one largest heading and at most one primary action. Secondary actions sit next to it with a lower weight variant.

## Responsive

**L13 · P0 — Mobile first, no page scroll sideways.** Base classes describe 375px; breakpoint prefixes add. Check every target at the widths in the review protocol (`.claude/skills/design-audit/references/review.md`, "Widths") — tablets, and the last width before each breakpoint, are where layouts break, not phones. The page never scrolls horizontally at 320px. A deliberate scroll region inside the page (a wide table, a carousel) is fine when it looks scrollable.

**L14 · P1 — Content grids collapse.** Cards with text run one column on phones and gain columns from `sm`/`md`/`lg` up (`grid gap-4 sm:grid-cols-2 lg:grid-cols-3`). Tiles of small fixed content (swatches, thumbnails, icons, stats) may keep 2–4 columns on phones. Column count follows content width, not a fixed pixel width.

**L15 · P1 — Rows stack on phones.** Side-by-side controls (input + button, two buttons) become `flex-col` below `sm` when a child would go under its useful width — an input under about 200px, a button label that truncates. A row of tags or chips wraps (`flex flex-wrap gap-2`), never a clipped single line.

**L16 · P1 — Flexible text children.** A text child of a flex row gets `min-w-0` so it can truncate or wrap; long tokens (URLs, emails) get `break-words`.

**L17 — Readable measure.** Owned by T7: report `[→ T7]`. Wide containers hold wide things, not long lines.

**L18 — Viewport heights.** Owned by `design-mobile` M5: report `[→ M5]`.

**L19 · P1 — No layout shift.** Images, embeds and async content reserve their space (`aspect-*`, fixed-height skeletons). Content rendered only on the client (a `useEffect` or `useSyncExternalStore` value that is empty on the server) renders a placeholder of the same size on the server. Fonts load through next/font.

**L20 · P1 — Fixed UI leaves room.** A fixed bottom bar pads the page by its height so the last content is reachable. Anchor offsets are NV8; safe areas are `design-mobile` M7.

**L21 · P2 — `size-*` for squares.** `size-10`, not `w-10 h-10`.

**L22 · P2 — Layering from a small scale.** z-index only from a few steps (`z-10`, `z-20`, `z-50`); overlay components manage their own.

**L23 · P1 — Content-sized things keep their width.** Badges, buttons and chips size to their content. In a `flex-col` parent they stretch to full width unless the parent has `items-start` or the child `self-start`; full width is a choice (`w-full` on a phone CTA), not an accident.

## Breakpoints and sizing

**L24 · P2 — Tailwind's breakpoints, one meaning each.** `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536, unless DESIGN.md defines others. In practice: base = phones, `md` = tablet portrait, `lg` = tablet landscape and small laptops, `xl` = desktop. A layout change sits on the breakpoint whose devices need it; custom breakpoints (992, 1200) leave tablets in the phone layout.

**L25 · P1 — Gutters grow with the screen.** The container's side padding steps up by width class — DESIGN.md sets the values (typically 16–24px on phones, 24–32px on tablets, 32–48px on desktop) — and the header, every band and the footer share that one container.

**L26 · P1 — Columns split where both fit.** Two columns only from the width where each keeps its useful size: text keeps its headline on the intended number of lines (about 28rem and up), media stays at least as tall as the text beside it. Below that, stack — usually up to `lg`.

**L27 · P1 — Size from content, not from the viewport.** Media takes its size from its column or container and has a cap (`max-w-*`); never an unbounded `vw` width, which makes the image — and the band around it — grow on wide screens. A band's height comes from its content and padding: no `vh` heights, nothing that grows with the screen. Check 1920: the band must look like it does at 1440, with more margin around it.

**L28 · P1 — Stacked bands stay compact on phones.** When columns stack, the media follows the actions closely — it may tuck slightly behind them (actions stay above it) — so the band is not a tall run of text, gap, then picture. This is the phone recipe (below `md`); tablets are L29.

**L29 · P1 — Every layout holds across its whole range.** A layout lives from one breakpoint to the next and is designed for both ends of that range, not stretched from its narrow end. Anything sized or placed for a phone — a `max-w-*` cap on media, a fixed offset, a `translate` that pushes media off the edge — is re-set at `md` so it grows with the column. A stacked hero on a tablet (768–1023) is its own composition:
- the media scales with the column: about two thirds of the content width or more, centred or anchored to one side with a deliberate bleed — not a phone-sized picture in a corner;
- the text and the media share the width: when the text column stops at its measure, the media fills beside or under it so no region larger than a third of the band holds nothing;
- elements that straddle the band's edge (cards half over it) do so on purpose at every width in the range.

Check it at the last width before the breakpoint (1023 for a layout that stacks up to `lg`): that is where a stretched phone layout shows.
