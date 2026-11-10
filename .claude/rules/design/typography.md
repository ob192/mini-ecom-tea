---
paths:
  - "src/**/*.{tsx,jsx}"
---

# Design rules: Typography

Setting text with the type scale. The scale itself (steps, values, fitting leading to a font) belongs to the `design-system` skill.

## Before writing

- DESIGN.md: Typography (the role → step table, weights, case) and Colors (text tokens); the `--text-*` tokens in `src/app/globals.css`.
- Know the step, weight and case for each role the target uses: page title, section heading, block and card title, body, meta, label. A role DESIGN.md does not map is a decision: take the nearest step and say so, or ask the user when it will repeat.
- Controls (button, badge, input) set their own type; their instances are not reviewed one by one.

## How to check

Every rule against every target file, and the rendered page: wrapping and sizes at 375, line counts and measure at 768 and at the last width before the layout splits (1023).

**Severity here:** P0 unreadable or inaccessible (too small on phones, broken heading order); P1 a visitor sees the hierarchy break (wrong step or weight for the role); P2 an off-scale value that renders right, polish.

DESIGN.md sets the actual steps, weights and case.

Two words used below:
- **meta** — secondary information in sentence form: captions, hints, descriptions, timestamps, "4,9 ★ · 300 reviews". Usually `text-sm`.
- **label** — one to three words that name or tag something: badges, eyebrows above headings, table headers, tags. Usually `text-xs`.

## Scale and roles

**T1 · P2 — Sizes come from the scale.** `text-xs` … `text-9xl` as the project defines them. No `text-[15px]`. A size the scale lacks is a design-system decision (`[→ design-system]`), not a one-off.

**T2 · P1 — A role always uses its step.** Page title, section heading, block and card title, body, meta and label each map to one step in DESIGN.md Typography. Two section headings on one site never differ in size. A role DESIGN.md does not map is a `[doc]` finding, not a violation.

**T3 · P1 — Weight and case per DESIGN.md.** Weight is a `font-*` class and case is `uppercase`, set per step or role as DESIGN.md says. Controls (button, badge, input) take weight from their primitive. Where the code is consistent and DESIGN.md silent, report `[doc]`. Emphasis inside running text is `font-medium`/`font-semibold`, not a size change.

**T4 · P1 — Hierarchy is visible.** Adjacent levels differ by at least two steps, or one step plus a clear weight change. A heading never looks like body text; meta never looks like body text.

## Readability

**T5 · P0 — Readable sizes.** Reading copy is `text-base` (16px) or larger on phones. Meta is `text-sm`; labels and legal lines may be `text-xs`; paragraphs never are. (Input font size and iOS zoom belong to `design-mobile`.)

**T6 · P2 — Leading comes with the step.** Each step carries its line height and tracking in its token, fitted to the font as `.claude/skills/design-system/references/leading.md` describes: 1.5 or more for reading text, tighter as headings grow, and never under the font's touch point for headings that wrap. In markup, override only for long-form copy (`leading-relaxed`), never with an arbitrary `leading-[22px]`; a `leading-*` on short text that the step already sets is noise. A heading whose lines touch or float apart is a token fix (`[→ design-system]`).

**T7 · P2 — Readable measure and wrapping.** Paragraphs stay within 65–75 characters (`max-w-prose`, `max-w-2xl`). Headings get `text-balance`, paragraphs `text-pretty`; no hardcoded `<br>` to shape a heading.

**T8 — Contrast.** Owned by C9: report `[→ C9]`.

**T9 — Secondary text colour.** Owned by C13: report `[→ C13]`.

**T10 · P2 — Tracking only where it belongs.** Display steps carry their tracking in the token; small uppercase labels get `tracking-wide`; body text gets none.

## Content

**T11 · P2 — Numbers.** Prices, counts and tables that align or update use `tabular-nums`. Numbers, prices and dates are formatted for the site's locale (`Intl.NumberFormat`, `toLocaleDateString`), never with `toFixed` or concatenation.

**T12 · P1 — Truncation keeps meaning.** `truncate` or `line-clamp-*` only for non-essential text, and the full text stays reachable (a detail view; a `title` attribute alone does not work on touch). Headings and essential text wrap.

**T13 · P1 — One line in a button or badge.** Their labels are `whitespace-nowrap`; a long label is shortened, never wrapped inside the control.

**T14 · P1 — Links look like links.** A link inside running text is underlined, or differs from the body text by 3:1 and underlines on hover. This covers a link-styled button placed inside a sentence; a standalone link-style button only needs a visible hover and focus.

## Semantics

**T15 · P0 — Heading levels follow structure.** One `h1` per page, `h2` for sections, `h3` inside them, no skipped levels. The visual step is independent of the tag: an `h2` may be `text-xl`. Text that only looks big (a price, a slogan) is not a heading.

**T16 · P1 — Families as DESIGN.md names them.** Fonts come through next/font with a fallback (no layout shift). Each family in use — including a monospace for code — is named in DESIGN.md; an unnamed one is a `[doc]` finding.
