---
paths:
  - "{app,components,context}/**/*.{tsx,jsx}"
---

# Design rules: Icons

Icons: library, size, meaning, names.

## Before writing

- The library is a **set**, the import subpath: here `lucide-react` (Lucide). Pick icons by meaning; when no icon fits a concept clearly, use text.
- lucide-react renders `aria-hidden="true"` on its `<svg>` by default, so a decorative icon needs nothing; an icon that carries meaning on its own turns it off (`aria-hidden={false}`) and takes a label.
- How the primitives in `components/ui` size icons inside them (`[&_svg]:size-4`, `data-icon`).
- DESIGN.md: Icons. When it lacks a decision, write one `[doc]` line with the library and sizes the primitives use, instead of a finding per size.

## How to check

Every rule against every target file; on the rendered page, the accessible names of icon-only controls.

**Severity here:** P0 a control nobody can identify (icon-only without a name, icon as the only signal); P1 a visitor sees the mismatch (second library, wrong size, inconsistent meaning); P2 size classes inside primitives, polish.


## Source

**I1 · P1 — One library.** Every icon comes from the project's library through its usual import path. No second library, no emoji as icons, no hand-copied SVG of an icon the library has. Brand logos and illustrations are not icons and live as assets.

**I2 · P2 — Icons are components.** A prop that takes an icon takes the component (`icon={CheckIcon}`) or an element (`icon={<CheckIcon />}`), never a string key into a lookup map; import each icon by name so unused ones are not bundled.

## Size and style

**I3 · P1 — Sizes follow the text.** A small set tied to the type next to the icon: 14px beside `text-xs` (with `gap-1`), 16px beside `text-sm`/`text-base`, 20px beside `text-lg`, in large controls and as the glyph of an icon-only button, 24px standalone outside controls. Set with `size-*`, not `w-* h-*`.

**I4 · P2 — Primitives size their icons.** Inside `Button`, `Badge`, `Alert`, menu items and other primitives, the primitive sets the icon size (`[&_svg]:size-4`, `data-icon`); the icon carries no size class.

**I5 · P1 — One stroke and style.** The library's default stroke everywhere; outline icons throughout, with a filled variant only to show a state (an active tab, a liked item).

**I6 · P2 — Colour follows the text.** Icons use `currentColor`; a muted icon sits next to muted text. A coloured icon carries meaning (status) and follows the colour rules.

## Meaning and accessibility

**I7 · P0 — Icon-only controls have a name.** `aria-label` or `sr-only` text on the button or link, wherever it sits (toolbars, table rows, cards). Icon-only is for the universal actions in I10; anything else gets a visible label, or a tooltip when the project has a `Tooltip` primitive — a `title` attribute does not count.

**I8 · P1 — Decorative icons are hidden.** An icon next to a text label is `aria-hidden`; lucide-react sets it on every `<svg>` it renders, so nothing is needed at the use site — verify it on the rendered `<svg>` rather than trusting it. An icon that carries meaning on its own (a status icon without text) turns it off (`aria-hidden={false}`), takes `role="img"` and a label.

**I9 · P1 — One icon, one meaning.** The same icon means the same thing across the site, and one action always uses the same icon. Use the conventional ones: × to close, chevron to expand, trash to delete, arrow-up-right for external links.

**I10 · P2 — Words for uncommon actions.** Icon-only is reserved for universal actions: close, search, menu, more, play, add, and delete or edit inside a row of items. Other actions get a visible label, with or without an icon.

**I11 — Touch targets.** Owned by `design-mobile` M1: report `[→ M1]`.

## Placement

**I12 · P2 — Leading or trailing by role.** The icon goes before the label for objects and actions (phone, download), after it for direction (arrow right, external link). The gap follows I3.

**I13 · P2 — Optical alignment.** One-line rows `items-center`; a leading icon beside multi-line text `items-start` with the icon nudged to the first line. A disclosure chevron rotates with its state.
