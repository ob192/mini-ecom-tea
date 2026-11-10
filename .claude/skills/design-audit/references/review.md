# Reviewing against design rules

Shared by every review against the design rules: `design-audit`, `design-mobile`, `design-a11y` and the audit mode of `design-system`. The rules live in `.claude/rules/design/` (one file per topic), the mobile criteria in `design-mobile`, the visual rules in `design-audit`; this file is how a review weighs sources, splits work between rules, checks the page and reports.

## Sources, in order

1. **DESIGN.md** — decisions.
2. **The project's primitives** (the `ui` alias in `components.json`, else `components/ui`) — decisions made in code.
3. **Screens that already follow the system.**

Code that DESIGN.md calls legacy is not practice. The file under review is not evidence for itself: when nothing but DESIGN.md and the primitives follows the system yet, those two are the whole practice. Values DESIGN.md marks as provisional still count; note when a finding rests on one.

- **[conflict]** — two sources disagree (DESIGN.md names one focus style, a primitive uses another). Report both sides and ask which is right.
- **[doc]** — the code does something consistently that DESIGN.md does not cover, or DESIGN.md lacks a section a rule needs (voice, icons, scrim). Report the line to add, which the `design-system` skill writes, instead of a code violation.

## Who owns which check

One defect is reported once, by its owner. Another rule that meets it writes one line `[→ ID]` without a fix, and never with a different severity.

| Check | Owner |
|---|---|
| Text and non-text contrast (icons, charts, control boundaries); colour as the only signal; which token secondary text uses | colour (C) |
| Focus indicator on every control, invalid fields included; hover, pressed, disabled, selected states | states (S) |
| Which states a view has (loading, empty, error, success) and how they look; pending on a control | states (S) |
| Field anatomy, field errors' placement and wiring, input types, submit wiring | forms (F) |
| Message channel, copy, live regions, where focus goes after content is replaced | feedback (FB) |
| Overlay behaviour: focus trap and restore, title, Esc, scroll lock — for any overlay, mobile menus included | overlays (O) |
| Menu triggers, current location, closing on navigation, state in the URL, pagination range | navigation (NV) |
| Touch target size, safe areas, on-screen keyboard, viewport units, iOS input zoom | `design-mobile` (M) |
| WCAG criteria no topic rule covers — alt texts, page language and title, keyboard operation of widgets, focus order, focus hidden by fixed UI, name/role/value, label in name, motion, text zoom and spacing, consistent help, checking before sending; running the engine scan, the keyboard walk and the accessibility tree | `design-a11y` (A1–A14) |
| Spacing, nesting, page-level horizontal scroll, z-index scale | layout (L) |
| Composition as rendered: balance, empty zones, scale of imagery, bleeds, things straddling an edge, the first screen | `design-audit` (visual rules V1–V16) |
| Type steps, hierarchy, measure, heading levels | typography (T) |
| Icon library, sizes, names of icon-only controls, alignment | icons (I) |

## Targets

- **Legacy code** (DESIGN.md calls it legacy) is reviewed for behaviour, semantics and accessibility only; token and style rules are `N/A (legacy)`. Say so at the top of the report.
- **Without shadcn**, a rule that names a shadcn component applies to the equivalent in the library the project uses (MUI, Radix, Headless UI, native `<dialog>`) or to hand-built markup that behaves the same. When nothing exists, the fix is to add one primitive, not to patch each use.
- **Static content** (marketing pages, no data fetching) makes data rules `N/A (static)`; list them in one line.

## Checking

**Rendered page**, when it runs and you have a browser:
- Widths — the one list every design skill uses. A layout holds over a range of widths and fails at the wide end of it, where a size or offset chosen for the narrow end leaves space empty; so each range is checked at both ends:
  - 320 (overflow only) and 375 — phones;
  - 768 — tablet portrait;
  - on both sides of every breakpoint where the target changes layout: the last width before it and the first after it. With Tailwind's breakpoints (the project's `--breakpoint-*` tokens, else `sm` 640, `md` 768, `lg` 1024, `xl` 1280) a hero that stacks up to `lg` is checked at 1023 and 1024 — 1023 is the widest a stacked layout ever gets;
  - 1440 — desktop; 1920 for anything sized from the viewport or bleeding past the container.

  A narrower scope says so (`design-mobile`: 375 and 320; quick mode of `design-audit`: 375 and 1440).
- In a browser pane that is hidden or in the background, take a screenshot before measuring: layout APIs return 0 until the page paints.
- Measurements that settle most questions:
  - page overflow: `document.documentElement.scrollWidth > innerWidth`
  - clipped text: `el.scrollWidth > el.clientWidth`
  - unlabelled controls: `input.labels.length === 0` and no `aria-label`/`aria-labelledby`
  - iOS zoom: computed `font-size` of inputs under 16px at 375
  - heading outline: the `h1`–`h6` sequence
  - hydration shift: content in the DOM that the server HTML (`curl`) lacks

**From code only**, when the page does not run or the browser is taken: compute contrast from the token values (follow `var()` chains to the palette) and mark it "computed"; for behaviour, look for the code that would produce it — focus moved and restored, a trap or `inert` on the rest of the page, an Esc handler, a live region present before its content changes. Say in the report what could not be verified.

## Severity

- **P0** — blocks or misleads a visitor: they cannot read, reach, operate or understand it; data is lost; a keyboard or screen-reader user is stuck.
- **P1** — a visitor sees it or is slowed by it: it looks broken or inconsistent, or is harder to read, use or find.
- **P2** — the visitor does not see it: system hygiene (the class is off-system but renders right) and polish.

Each rule has a default severity. Raise it when the harm is worse in context (an invisible focus ring on an invalid field). Lower it when the context removes part of the harm — a system rule on a dev-only page, a failure that is partial (table semantics present, row headers missing), an effect hidden by other UI — and say why. An accessibility failure that blocks a user is never lowered.

## Specimen pages

A design-system reference page (`/playground`) shows many variants on purpose. Repeated primary buttons, framed swatches and tiles, matrices that do not have uniform rows, scroll regions and clipped specimens are fine there. Accessibility, token use and real bugs still count.

## Report

Group by severity, P0 first. P2 come last as one compact block — one line per rule with its locations — since most are the linter's and none changes what a visitor sees. One line per issue:

`[ID · P1] path:line, line — problem. Fix: change.`

- One issue in several places is one line with every location.
- Tags besides rule IDs: `[unlisted]` (real, no rule covers it; propose the rule), `[conflict]`, `[doc]`, `[→ ID]` (owned by another rule; one line, no fix).
- End with `Clean:` (rule IDs checked with no finding) and `N/A:` (rule IDs the target cannot exercise, with the reason), so every rule is accounted for.

Change nothing until the user picks what to fix.
