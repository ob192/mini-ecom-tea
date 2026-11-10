---
name: design-a11y
description: Accessibility (WCAG 2.2 AA) of a Next.js + shadcn/ui + Tailwind v4 site, checked on the running page — an axe-core scan, a keyboard walk that records focus order, focus visibility and focus hidden behind fixed bars, the accessibility tree, text zoom and text spacing, and moving content — with every finding graded by severity and by what proves it. Use for an accessibility or a11y audit, a WCAG check, keyboard or screen-reader problems, before shipping a section or a form, or after changing a primitive or an overlay.
---

# Accessibility

The design rules already state most accessibility requirements: contrast and colour (C9–C11), focus and states (S8, S9), labels and errors (F1, F5, F8), overlays (O3–O5), keyboard navigation and landmarks (NV13, NV14), headings (T15), icon names (I7); `design-mobile` owns target size and zoom (M1, M5). They say what must hold. This skill checks it on the rendered page, where most accessibility failures only show, and owns the criteria no rule covers (A1–A14 in [references/criteria.md](references/criteria.md)). Read criteria.md in full before step 3; it maps every WCAG 2.2 A/AA criterion to the check that settles it.

A finding owned by a rule keeps that rule's ID and adds the criterion and the evidence: `[S8 · P0 · ● 2.4.7]`. Severity follows the shared protocol; evidence is:

- **●** verified — the scan, the walk or the tree shows it; the report cites what was observed.
- **◐** flagged — evidence is there, a person decides (reading order, alt text quality, a clamp under text spacing).
- **○** needs assistive technology — a screen reader or a person who uses one; handed off, never emulated.

A clean scan is not a pass: an engine settles roughly a third of the criteria. Say what was not checked.

## Modes

- **Quick** — a changed component or one page: steps 2–4 on its states at 1440 and 375. Report P0 and P1.
- **Full** — a flow or the site: every step on every sampled state.

Without a word from the user: quick after a UI change, full when asked for an audit.

## 1. Scope and sample

From the request. A full audit of the site samples, each in its base state plus what opens on it:

| Page | States |
|---|---|
| Home `/` (sections in `components`) | the mobile menu (`Sheet`) open; the sign-up form empty, with errors, sent (on dev only) |
| Privacy `/privacy` | the mobile menu open |

The site is Ukrainian only (`<html lang="uk">`). `/playground` is a specimen page: check it only when asked.

Done when there is a list "page → states" with no "etc.".

## 2. Bench

- The dev server through `preview_start` (`dev`); reuse one that runs. Production only read-only.
- **Read only.** Never submit the checkout on production — it posts a real order to the shop's Telegram chat through `app/api/order/route.ts`; never type real personal data. Typing test values to trigger validation is fine.
- Serve the scripts and axe-core locally — axe-core comes with `eslint-plugin-jsx-a11y` under `node_modules/axe-core` (npm hoists it; pnpm keeps it under `node_modules/.pnpm/axe-core@*/node_modules/axe-core`), nothing is downloaded:
  ```bash
  A11Y=<scratchpad>/a11y-serve; mkdir -p $A11Y
  AXE=$(ls -d node_modules/axe-core node_modules/.pnpm/axe-core@*/node_modules/axe-core 2>/dev/null | head -1)
  ln -sf <this skill>/scripts/*.js "$AXE/axe.min.js" $A11Y/
  python3 -m http.server 8766 --bind 127.0.0.1 --directory $A11Y   # in the background
  ```
  After each page load, load them in the browser's JavaScript tool (a script tag needs no CORS):
  ```js
  for (const f of ["axe.min.js", "axe.js", "keyboard.js", "adapt.js"]) await new Promise((ok, fail) => { const s = document.createElement("script"); s.src = `http://127.0.0.1:8766/${f}`; s.onload = ok; s.onerror = () => fail(new Error(f)); document.head.appendChild(s) })
  ```
  Stop the server when done.
- The built-in browser works while its pane is visible; a hidden pane may never hydrate — take a screenshot first, or use Playwright (`mcp__playwright__*`). Viewport through `resize_window`: 1440×900 and the `mobile` preset (375×812).

Done when the page loads, the scripts load, and `__kbd.reset()` returns a tabbable count above zero.

## 3. Engine scan

`await __axe()` on each state; `await __axe({root: "[role=dialog]"})` for an open overlay. Violations with a criterion are ●; `incomplete` is ◐ — mostly contrast over images and gradients, which `design-audit` measures on the pixels (`scripts/contrast-at.py`); `best-practice` items are P2 unless criteria.md maps them higher. Map each to its owner with the table in criteria.md.

Done when every state has a scan and every violation has an owner.

## 4. Keyboard walk

1. `__kbd.reset()` on the state, then press Tab with the browser tool (`key`, `repeat`) the number it returns plus two, at most 100 per press; then `__kbd.report()`. Long pages: walk in parts, reading the report between them. After opening an overlay or when a banner appears, `__kbd.reset()` again: an element it has not seen unfocused reports `unknown`.
2. Operate each widget the walk reaches the way a keyboard user would: Enter and Space on buttons and links, arrows in menus, radio groups, tabs, the gallery and carousels; Esc in overlays; Shift+Tab out of a dialog (O3 says where focus must go). Check the result in the tree (step 5) or a screenshot.
3. Read the report against criteria.md ("Reading the output"): `noIndicator` and `weakIndicator` go to S8, `covered` to A6, `jumps` and `notReached` to A5, `invisible` to A5 or NV14, `skipLinkFirst: false` to NV14.

Done when every state was walked to its end (`leftDocument` > 0 or every tabbable reached) and every widget was operated.

## 5. Accessibility tree

`read_page` (filter `all`) on each state. Check what the scan cannot judge: landmarks (one `main`, `banner`, `navigation` with distinct names, `contentinfo`), the heading outline, that each control's name contains its visible label (A8), states on custom widgets — expanded, selected, checked, pressed, the current value of a quantity (A7), image names that say what the image shows (A1), live regions present before their content changes (FB11). Text in the tree that is not on screen, or on screen and not in the tree, is a finding.

Done when every state's tree was read against criteria.md.

## 6. Adaptation and motion

- `await __adapt("text200")` and `await __adapt("spacing")` at 1440 and 375: `newlyClipped` is text the change cut off (A10); `horizontalScroll` at 375 goes to L13. Pass `{keep: true}` and take a screenshot when a finding needs one, then `await __adapt("reset")`.
- `await __adapt("motion")`, then watch the page for ten seconds: anything that moves, advances or updates on its own for more than five seconds needs a pause (A9). Search the code for what the script cannot see:
  ```bash
  grep -rnE 'setInterval|[Aa]utoplay|animate-(spin|ping|pulse|bounce)|animation:' src --include='*.tsx' --include='*.css'
  grep -rnE 'motion-(safe|reduce):|prefers-reduced-motion' src
  ```
- 320×640 for overflow — owned by `design-mobile` and L13; report it there once.

Done when each sampled page ran all three modes and the motion search is read.

## 7. Cause in code

Trace each finding to a file and line, then up to the source: a class at the use site, a primitive in `components/ui`, a token in `app/globals.css`, or the content (text and images in `src/content`). One fix in a primitive or a token clears dozens of findings — those go first.

Done when every finding has `file:line` or names its data source.

## 8. Report

Follow the shared protocol in [../design-audit/references/review.md](../design-audit/references/review.md), with:

- at the top: scope, the sample, the evidence legend, and a table "page, state → P0 / P1 counts";
- **system fixes** (a token, a primitive) before single findings, with how many places each clears;
- each finding as `[ID · P0 · ● 2.4.7] where — what was observed. Fix: change.`;
- **Handoff (○)**: what only a screen reader shows, on which flow, with which pair (VoiceOver with Safari on iOS and macOS, NVDA with Firefox or Chrome on Windows, TalkBack with Chrome on Android);
- **Not checked**: pages and states outside the sample, criteria not exercised.

Change nothing until the user picks what to fix. After fixing, repeat steps 3–6 on the same states: a finding is closed when the scan rule or the walk field is gone, not when the code changed.
