---
paths:
  - "{app,components,context}/**/*.{tsx,jsx}"
---

# Design rules: Navigation

How people move around the site: header, mobile menu, links and buttons, anchors, tabs, footer, keyboard.

## Before writing

- The navigation pieces: header, footer, mobile menu, and the primitives in `components/ui` (`Sheet`, …).
- DESIGN.md; the routes in `app/` and which ones the navigation reaches.
- Navigation is shared: change it in its component, never per page.

## How to check

Every rule against every target file. When the page runs: Tab from the top of the page through the header, open and close the mobile menu at 375px with keyboard and touch, follow anchors, use Back.

**Severity here:** P0 places users cannot reach or leave (keyboard trap, menu that will not close, broken Back, a `div` that acts as a link); P1 a broken common pattern; P2 polish.

Component names are shadcn's; without shadcn they mean the equivalent in the project's library or markup.

## Structure

**NV1 · P1 — Few top-level items, plain labels.** Five to seven at most, named with the nouns users would use. A label matches its destination; the same label always leads to the same place.

**NV2 · P1 — The current location is marked.** `aria-current="page"` on the active link, shown by more than colour (weight, underline, indicator). On a one-page site whose navigation is anchors only, marking the current section is optional (`N/A`).

**NV3 · P1 — The header is consistent.** Logo links home; the main call to action is visible at every width; the same header on every page. Sticky only when it helps, kept compact. Check it at every breakpoint where its layout changes: the call to action must not disappear between two of them.

**NV4 · P1 — The footer carries the rest.** Secondary links, contacts and legal, in groups that stack on phones.

## Elements

**NV5 · P0 — Links navigate, buttons act.** Anything that changes the URL is a link (`<a href>`, Next `Link`); anything that does something on the page is a `<button>`. No `div` or `span` with `onClick`.

**NV6 · P1 — Tabs switch views, links switch pages.** `Tabs` (with `TabsList` and `TabsTrigger`) for views of one context; moving between pages uses links, even when they look like tabs, with `aria-current`.

**NV7 · P2 — Breadcrumbs for depth.** On hierarchies three or more levels deep; the last crumb is the current page, not a link.

**NV8 · P1 — In-page anchors land properly.** Every `#anchor` link has a target with that `id` on the page — a button to a missing section goes nowhere. `scroll-padding-top` on `html`, equal to the sticky header's height, offsets every anchor and keeps focused elements clear of the header (WCAG 2.4.11); `scroll-mt-*` only for a section that needs a different offset. Smooth scrolling respects `prefers-reduced-motion`; the hash updates so the position can be shared and Back returns to it; focus moves to the target section.

## Mobile

**NV9 · P1 — The mobile menu opens and closes like a dialog.** A menu button with a name, `aria-expanded` and `aria-controls` (pointing at the panel's id) opens a modal panel — the project's `Sheet`/`Drawer` or equivalent. Choosing a link closes it, and so does any route change. The panel holds the links and a close button, not a second copy of the header. Its dialog behaviour (focus, Esc, inert page, scroll lock) is O3–O7.

**NV10 · P1 — Key actions stay in reach.** On phones the main call to action stays one tap away (in the header or a bottom bar); a bottom bar holds at most five items. (Its safe-area padding is `design-mobile` M7.)

## State and history

**NV11 · P1 — State lives in the URL.** Filters, tabs that matter, search queries and pagination are reflected in the URL, so links can be shared and Back returns to the same view.

**NV12 · P1 — Lists show where you are.** Pagination shows the range ("1–20 of 134"); "load more" keeps scroll position on Back.

## Keyboard

**NV13 · P0 — Navigation works from the keyboard.** Every item is reachable by Tab in visual order; a disclosure opens with Enter or Space and closes with Esc, returning focus to its trigger. Site navigation is links in a disclosure, not `role="menu"`; arrow keys belong to real menus (O12). The focus ring itself is S8.

**NV14 · P1 — A skip link and clean landmarks.** A "skip to content" link is the first focusable element and targets `<main id>`; the page has one `header` (banner), one `main`, and each `nav` has a distinct label.

**NV15 · P2 — New tabs are announced.** External links open in the same tab unless leaving would lose work; a link that opens a new tab says so visibly or in `sr-only` text, and has `rel="noopener"`.
