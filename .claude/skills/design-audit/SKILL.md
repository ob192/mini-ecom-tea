---
name: design-audit
description: Design audit of a rendered page or block in a Next.js + shadcn/ui + Tailwind v4 site — looks at it the way a designer does (screenshots at phone, tablet and desktop widths, first read, balance, scale of imagery, proportions and padding, rhythm, contrast on the real pixels behind text), then checks the code against the design linter and the rules in .claude/rules/design/ and returns one deduplicated report. Quick mode (two widths, visual rules) closes any UI change; full mode before shipping a section. Use when asked whether a page or block looks right, to review UI code against the design rules, before shipping a section, or after building one.
---

# Design audit

Code rules catch what is wrong in the markup; they do not see that a car is too small, a band too tall or a subtitle grey on red. This skill judges the **rendered result** first, then runs the rules, and reports both as one list.

## Modes

- **Quick** — the check that closes any UI change (`.claude/rules/design/common.md`, "Done when"). Widths 375×812 and 1440×900, plus both sides of every breakpoint the change touches. Steps 1–2 without the contrast measurement (step 2.4) unless text sits on an image, gradient or glow; in step 3 only the linter. Report P0 and P1 only.
- **Full** — before shipping a section, or when the user asks for an audit or a review. Every step at every width.

Without a word from the user: quick after building, full when asked.

## 1. Scope and bench

1. The target: a URL and, for a block, a CSS selector (`section:first-of-type`), and the source files that render it. Read DESIGN.md (all of it — the audit compares against every section).
2. A browser that runs the page. The built-in pane works when it is visible; a hidden pane runs as a background tab and the page may never hydrate — then use Playwright (`mcp__playwright__*`). Check that the page is interactive before judging it: a button has a `__reactProps…` key, or `window.next.router.isReady` is true. Playwright writes files only under its output folder — pass `.playwright-mcp/<name>.png`, not a bare name; that folder belongs to the Playwright server and may sit outside the project, so give absolute paths in the report.
3. Widths (full mode): the list in [references/review.md](references/review.md) ("Widths"), with real heights — 320×640 (overflow), 375×812, 768×1024, 1023×768, 1024×768, 1440×900, 1920×1080 — with the breakpoint pair moved to wherever the target changes layout; plus 1680×1050 when something bleeds past the container. The last width before each breakpoint is not optional: a phone layout stretched across a tablet only shows there.
4. Hide anything that is not part of the page as shipped before screenshots — an exploration's label, a cookie bar above the target, the Next dev indicator over it (`nextjs-portal`): `el.style.display = "none"`. Above the target, its height shifts the first screen and the band's proportions; over it, it covers content.
Done when the page renders and responds at every width, and you know which DESIGN.md sections apply.

## 2. Look

For each width, top of the page first:

1. Screenshot the viewport and the target. Save them (Playwright allows paths under its output folder).
2. Write the **first read** in three lines: what the eye lands on first, second, third — and the one thing that feels off. Do this before measuring; it is the user's experience.
3. Run [scripts/measure.js](scripts/measure.js) in the page — it survives resizes, not navigation. Evaluate the file's text, or serve the folder (`python3 -m http.server 8765 --bind 127.0.0.1 --directory <this skill>/scripts`, in the background) and add `<script src="http://127.0.0.1:8765/measure.js">` to the page; a script tag needs no CORS. Take a screenshot first: a background pane reports zero-sized boxes until it paints. Then `measure("<selector>")` — for a hero, the band itself (`section`), so its bottom edge is the band's:
   - boxes, font sizes, rendered line counts, characters per line, gaps between siblings of every stacked flex/grid, gutters (negative when content runs past the edge), boxes whose content overflows, image scale and bleed, what is on the first screen. `servedScale` is the file the browser picked; check the original image's width too.
   - `composition` — the numbers the composition rules are judged by. The content box leaves out the site header.
     - `textShare`, `mediaShare` (visible width over the content box's) and `textBox` (V2, V3);
     - `largestEmpty`, the biggest rectangle with nothing in it, as a share of the content box (V3);
     - `padding`, from the header to the content and from the content to the band's bottom (V4);
     - `overlays`, cards laid over the media, with how much of it they cover and their `clearance` to the nearest text (V16);
     - `pastContainer`, media and overlays beyond the container's inner edge, and whether they reach the screen edge (V6);
     - `straddle`, cards or images over the band's bottom edge, with the share above it (V15).
4. Measure contrast of every text over a gradient, image or glow on real pixels. Take a second screenshot with only the text made invisible — background art, lines and grain stay:
   ```js
   document.querySelectorAll("<selector> *").forEach((e) => { e.style.color = "transparent"; e.style.webkitTextFillColor = "transparent" })
   ```
   then `python3 scripts/contrast-at.py <png> <x> <y> <w> <h> <rgba from measure> --bg <text-free png>`. The box in screenshot coordinates is (`rx` + the target's left, `ry` + its top − `scrollY`) × `devicePixelRatio`. Pick each text by its place in the target, not by `href` — a header link and a hero button can share one. Judge on p5.
5. Go through every rule in [references/visual.md](references/visual.md) with these numbers.

Done when every width has a first read, measurements and a verdict on each visual rule.

## 3. Rules

1. Run the linter on the target's source files: `node .claude/scripts/design-lint.mjs <files>`. Its findings go into the report as they are; do not re-derive them by reading.
2. Full mode: check the source files against every rules file in `.claude/rules/design/` that applies — `layout`, `typography`, `color`, `icons` for almost any block; `forms`, `states`, `feedback`, `navigation`, `overlays`, `tables` when the target has them. Each file's "How to check" says what to do on the rendered page. For phones, run the `design-mobile` criteria (`../design-mobile/references/criteria.md`) and its `scripts/audit-page.js`, served and loaded the same way as `measure.js`.

One defect is reported once, by its owner ([references/review.md](references/review.md), "Who owns which check"). A visual finding and a rule finding about the same thing are one finding: keep the visual one and cite the rule.

Done when the linter ran and, in full mode, every rule of every applicable file is accounted for.

## 4. Report

Follow the shared protocol in [references/review.md](references/review.md), with:

- **First read** per width, three lines each, at the top.
- **Visual findings** (`[V4 · P1]`) before rule findings, each with the width, the measured numbers ("text column 488px, car 351px tall vs text 412px") and a concrete fix (classes or values).
- **System fixes first**: a fix in DESIGN.md, a token or a primitive outranks a local one.
- Screenshot paths for the widths that show each problem.
- A miss that DESIGN.md itself causes (its type steps break a visual rule) is a `[conflict]` between the rule and DESIGN.md — the user decides which wins.

Change nothing until the user picks what to fix. After fixing, re-shoot the same widths and show before and after side by side; a finding is closed when the numbers changed, not when the code did.
