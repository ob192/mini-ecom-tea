---
paths:
  - "src/**/*.{tsx,jsx}"
---

# Design rules: Overlays

UI that opens above the page: dialog, alert dialog, sheet, drawer, popover, tooltip, menu.

## Before writing

- The overlay primitives in `src/shared/components/ui` (`Sheet`, …) and the library under them. A missing one is added once as a primitive; propose it to the user first.
- DESIGN.md: Elevation & Depth, Shapes.
- Pick the overlay by O1, or none when the content belongs on the page.

## How to check

For each overlay in the target: in code, focus moved and restored, `inert` or a trap, an Esc handler, scroll lock. When the page runs, open each one with the keyboard and by touch at 375px, Tab through it, close it with Esc, and see where focus lands.

**Severity here:** P0 users trapped, lost or unable to close (no focus management, no Esc, no title for screen readers, content unreachable on phones); P1 wrong overlay or broken pattern; P2 a hand-built overlay that behaves right, polish.

Component names are shadcn's; without shadcn they mean the equivalent in the project's library (MUI `Dialog` with `aria-labelledby`, Headless UI, native `<dialog>`).

## Choosing

**O1 · P1 — The overlay fits the task.**

| Task | Overlay |
|---|---|
| A focused task with input that returns to the page | `Dialog` |
| Details, filters or a menu at the side | `Sheet` |
| A panel on phones | `Drawer` (bottom) |
| Small content or actions on click | `Popover`, `DropdownMenu` |
| A short supplementary hint on hover or focus | `Tooltip` |
| Site navigation on phones | full-screen or side `Sheet` (trigger and routing: NV9) |
| Confirming a destructive action | `AlertDialog` (its copy and default focus: FB8) |

Long or multi-step flows, primary content and anything users want to link to belong on a page, not in an overlay.

**O2 · P1 — Overlays are not interruptions.** Nothing opens by itself on load or on scroll (promos, newsletter prompts); consent banners do not block the page.

## Behaviour

**O3 · P0 — Focus is managed.** On open, focus moves into the overlay; a modal overlay keeps focus contained while open and makes the page behind `inert`; on close, focus returns to the trigger.

**O4 · P0 — Every modal has a name.** `DialogTitle`, `SheetTitle`, `DrawerTitle` (visually hidden with `sr-only` when the design has none), or `aria-labelledby`/`aria-label` in other libraries; plus a description when the title alone does not say what to do.

**O5 · P1 — It closes the expected ways.** Esc, a visible close button with an accessible name (its touch size is `design-mobile` M1), and a click on the backdrop for non-destructive overlays. Closing an overlay with unsaved input asks first. Closing on navigation is NV9.

**O6 · P1 — One modal at a time.** No dialog opened from a dialog; use steps inside one. Overlay primitives stack themselves; the z-index scale for anything hand-built is L22.

**O7 · P1 — The page behind stays put.** Scroll is locked without the page jumping when the scrollbar disappears (`scrollbar-gutter: stable`) and without scroll chaining (`overscroll-contain`); a partial overlay dims the page with the system's scrim — when DESIGN.md defines none, report `[doc]`.

## Size and layout

**O8 · P1 — Sized to content, scrolls inside.** A centred dialog takes its width from a few steps (`max-w-sm` … `max-w-2xl`) and caps its height (`max-h-[85dvh]`) with the body scrolling and the header and footer fixed. Full-screen panels scroll their body the same way.

**O9 · P1 — Phones get a phone layout.** A dialog becomes full-width or a bottom drawer on phones and its actions stack full width. Safe areas and the on-screen keyboard are `design-mobile` M4, M7.

**O10 · P1 — Actions are consistent.** Footer actions in one order across the site, one primary, destructive actions in the destructive variant with a label that names the action.

## Small overlays

**O11 · P1 — Tooltips only supplement.** Short text that adds to something already labelled; shown on focus as well as hover, after a short delay; never the only way to get information (touch has no hover), never on a disabled control without a focusable wrapper.

**O12 · P1 — Menus and popovers are anchored and operable.** Positioned at their trigger, which carries `aria-expanded`; items in their groups; arrow keys move, Enter selects, Esc closes; choosing an item closes the menu.

**O13 · P2 — Motion matches origin.** Open and close in 150–250ms — scaling from the trigger, sliding from the edge they come from, or a fade for full-screen panels — and respecting `prefers-reduced-motion`.

**O14 · P2 — No hand-built modals.** An overlay is built on the project's primitive. When there is none, the light option is native `<dialog>` with `showModal()` (top layer, `inert` page, Esc for free) wrapped once as a primitive — not a fixed `div` with its own focus and z-index logic.
