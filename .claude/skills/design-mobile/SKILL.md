---
name: design-mobile
description: Mobile usability of a Next.js + shadcn/ui + Tailwind v4 site, measured in the browser at 375px — touch target size and spacing, thumb reach, inputs and the on-screen keyboard, zoom and horizontal scroll, fixed and sticky elements, safe areas, hover-only actions, gestures. Use to check the phone version, when buttons are hard to hit, before shipping UI used on phones, or when building UI for touch.
---

# Mobile

Finds where on a phone it is hard to hit, reach, type or read. It measures the rendered page, not the markup: a target's real size depends on padding, line height and parent, which classes do not tell. Thresholds, sources and how to read each measured field are in [references/criteria.md](references/criteria.md) — read it in full before step 3 of Review; every finding is judged by it.

DESIGN.md wins over a default here unless the user chooses to change it. Levels in criteria.md map to the shared report: **Блокер = P0**, **Серьёзно = P1**, **Улучшение = P2**. Rule IDs are the criteria sections: **M1** target size and spacing, **M2** reach, **M3** gestures and pointer, **M4** inputs and keyboard, **M5** zoom, viewport and width, **M6** hover and tap feedback, **M7** fixed elements and safe areas, **M8** readability — `[M1 · P1]`.

This skill owns touch target size, safe areas, the on-screen keyboard, viewport units and input zoom; the design rules in `.claude/rules/design/` point here. It measures at 375 and 320 only — other widths belong to `design-audit`. Two measured groups belong to other skills and are reported with their IDs: `nonSemantic` (clickable `div`s) as NV5, horizontal scroll as L13 (`.claude/rules/design/`).

## Build

Read criteria.md sections 1–8 and apply them as you write: touch targets through `pointer-coarse:` on primitives, 16px inputs with the right `type`/`inputMode`/`autoComplete`, `dvh` and safe areas for fixed UI, nothing that appears only on hover. Then measure what you built with Review step 3.

## Review

### 1. Scope

From the request: routes, a component, or the whole site. Without one, the main path a visitor takes from the home page to the main action (a sign-up, a purchase). Routes come from the `pages` or `app` directory; ids for dynamic segments come from following links, never invented.

Each screen is its base state **plus** everything that opens on it: menus, tabs, filters, dialogs, forms. Small targets live mostly in overlays. Shared header overlays (menu, search) are measured once.

Done when there is a list "screen → states" with no "etc.".

### 2. Bench

- The dev server through `preview_start`; reuse one that runs.
- Width through `resize_window` with `preset: "mobile"` (375×812). After each `navigate`, check that `viewport` in the script's output matches.
- Pages behind sign-in: work under an existing session only; never type passwords. A screen you cannot reach is reported as not checked.
- **Read only.** Submit, save or delete nothing. Typing into search and filters is fine.

### 3. Measure

Read [scripts/audit-page.js](scripts/audit-page.js) and pass its full text to the browser's JavaScript tool once after each page load. It defines `window.__mux` and measures the current state. For other states of the same page, call `await __mux()`; for a custom panel without dialog or menu roles, `await __mux({root: "<css selector>"})`.

Before measuring a base state, scroll to the top (`scrollTo(0, 0)`): `firstScreen` and `pinned` depend on scroll position. If the output has a `warning` (0 targets), the scope is wrong — close overlays or pass `{root}`. To save tokens, change the viewport with `resize_window` and re-run `await __mux()` without reloading, and read `summary` first, opening `targetGroups` only where it fails.

On every state of every screen: one measurement at 375×812 (criteria.md, "Как читать замер") and one screenshot for what the script cannot see (criteria.md, "Ручная проверка"). Also 320×640 for the base states of the main screens — horizontal scroll there is P0.

Done when every state from step 1 is measured, or the report says why not.

### 4. Cause in code

Trace each group from the measurement to a file and line, then up to the **source of the size**: a class at the use site, a `size` prop, or the primitive itself. One fix in a primitive fixes dozens of places — such findings go first. Then search the code for what one render does not show (criteria.md, "Поиск по коду").

Done when every finding has `file:line` and its size source.

### 5. Report

Follow the shared review protocol in [../design-audit/references/review.md](../design-audit/references/review.md), with these additions: a summary table "screen, state → failing groups, horizontal scroll at 320 yes/no"; **system fixes** (primitive changes and how many places each fixes) before individual findings; each finding with what was measured, the criterion from criteria.md, `file:line` and a concrete fix (a class, prop or value); **false positives** the script flagged and why; **not checked** — screens without access and what an emulator cannot show (iOS input zoom, real safe areas, the real keyboard).

Change nothing until the user says yes. After fixes, repeat step 3 on the same screens: a fix is done when its group is gone from `targetGroups`, not when a class changed.
