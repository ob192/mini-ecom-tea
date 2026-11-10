# Accessibility criteria

Target: WCAG 2.2 Level AA (W3C Recommendation, also ISO/IEC 40500:2025). The A rules below cover what the topic rules in `.claude/rules/design/` do not; the table at the end maps every A and AA success criterion to its owner, so each failure is reported once.

## A rules

Severity is the default; the shared protocol says when to raise or lower it. An accessibility failure that blocks a user is never lowered.

**A1 · P0 — Images say what they show.** (1.1.1, 1.4.5) An image that carries information has a text alternative that says what it shows in this context; a decorative image has `alt=""`. On this site: the hero car, the fleet and the instructors' photos say what they show (the car model, the instructor's name) — not the file name; the lava-lamp background and grain are decorative (`alt=""` or CSS). Text inside an image (an old banner, a price list as a picture) is live text instead (1.4.5) unless it is a logo. How to check: the scan finds missing alts; the tree (step 5) shows what is said — judging the words is ◐.

**A2 · P1 — Every page has its own title.** (2.4.2) `<title>` names the page first and the school second, in Ukrainian, and differs between pages: the privacy page says it is the privacy policy, Ichnia names the town. How to check: `__axe()` returns `title`; compare across the sample and the four locales.

**A3 · P0 — The language is declared.** (3.1.1, 3.1.2) `<html lang>` is `uk` (`app/layout.tsx`). A passage in another language carries its own `lang` — a Russian or English quote, a brand name read as a word. Hyphenation (`hyphens-auto`) depends on the right `lang`. How to check: `__axe()` returns `lang` on each locale; the tree and the code for parts.

**A4 · P0 — Everything works from the keyboard.** (2.1.1, 2.1.2, 2.1.4) Every action a mouse can do, a keyboard can: the mobile menu, the sign-up modal and its form, price tabs or toggles, anything that opens on click. Focus never gets stuck: Tab and Shift+Tab leave every component except a modal, which Esc closes (O3, O5). Single-key shortcuts, if any, can be turned off or work only with focus. Header and menu navigation is NV13. How to check: the walk reaches each control (`notReached` is empty), then operate each widget (SKILL.md, step 4.2).

**A5 · P1 — Focus follows the reading order and only lands on what is visible.** (2.4.3, 1.3.2) Tab order matches the visual order: no `tabindex` above 0, no element placed by CSS far from its place in the DOM. Nothing invisible takes focus — carousel slides out of view, a closed menu, a visually hidden link that does not appear on focus (the skip link must appear). How to check: `jumps`, `invisible` and `notReached` in the walk; ◐ for order, since a jump can be intended (a cookie banner first in order is fine).

**A6 · P1 — Focus is never hidden behind fixed UI.** (2.4.11) A focused control is never entirely covered by something the page fixes or sticks to the screen: a sticky header, a floating call or messenger button, a bottom bar. Fix with `scroll-padding` on the scroller for sticky bars (`scroll-pt-*`, `scroll-pb-*`) or by moving focus into the banner first. How to check: `covered` in the walk — 100% fails, partial is ◐.

**A7 · P0 — Custom widgets expose name, role and value.** (4.1.2) Built-in elements and Radix primitives do this; hand-built ones must: a disclosure has `aria-expanded`, a toggle `aria-pressed`, a toggle between gearboxes or categories exposes which is chosen, a carousel is a labelled group whose slides say "2 of 6", an accordion trigger is a button with `aria-expanded` and controls its panel. Selected and current state is S9. How to check: the tree before and after operating each widget.

**A8 · P1 — The name contains the visible label.** (2.5.3) A control's accessible name starts with, or at least contains, the words on it, so a voice user can say what they see. An `aria-label` that replaces a visible label with other words fails («In den Warenkorb» shown, "Add" announced). How to check: in the tree, compare each named control with its visible text.

**A9 · P1 — Moving content can be paused, motion respects the setting.** (2.2.2, 2.3.1) Anything that moves, scrolls or updates on its own for more than five seconds — an autoplaying hero carousel, a ticker, a looping animation — has a visible pause control, or stops on hover and focus and after five seconds. Nothing flashes more than three times a second. Project standard beyond AA: under `prefers-reduced-motion: reduce`, autoplay stops and decorative motion is off (`motion-safe:` / `motion-reduce:`). How to check: `__adapt("motion")`, ten seconds of watching, the code search in step 6.

**A10 · P1 — Text survives zoom and spacing.** (1.4.4, 1.4.10, 1.4.12, 1.3.4) At 200% text size and with the WCAG text-spacing override, no text is cut off or overlaps; at 320 CSS px wide nothing needs scrolling in two directions (L13 owns the horizontal scroll). Line clamps and `truncate` that cut more under the override are ◐: the full text must be reachable (a full version of the text exists on the page). The page works in both orientations. How to check: `__adapt("text200")` and `__adapt("spacing")` — `newlyClipped`, with a screenshot (`{keep: true}`). `notScaled` lists text sized in px: browsers zoom it, but a user's larger default font does not — P2 note, not a failure.

**A11 · P1 — Content on hover or focus can be dismissed, hovered and stays.** (1.4.13) A tooltip, hover card or popover that appears on hover or focus closes with Esc without moving focus, stays while the pointer moves onto it, and stays until dismissed or no longer relevant. Menus opened by a click are O12. How to check: hover and focus each such trigger; Esc; move the pointer onto the content.

**A12 · P1 — Navigation, names and help stay consistent.** (3.2.3, 3.2.4, 3.2.6) The header, the footer and their order are the same on every page (NV3); one function has one name and one icon everywhere (the sign-up action is always worded the same, I9); help — the phone number, the messengers, the address — is reached from the same place on every page. How to check: compare the tree's landmarks and names across the sample.

**A13 · P1 — A sign-up can be checked before it is sent, and nothing is asked twice.** (3.3.4, 3.3.7, 3.3.8) The sign-up commits to nothing legal or financial, so 3.3.4 applies only if a form ever takes a payment; still, the form shows what will be sent (name, phone, category) and confirms what happened after sending. Information already given — a category chosen on the page — is carried into the form, not asked again. Signing in, if the site ever has it, needs no puzzle or memorised code without an alternative. How to check: fill the form with test values on dev up to the send button.

**A14 · P1 — Nothing changes context on focus or input.** (3.2.1, 3.2.2) Focusing a control never opens a new page, moves focus or submits. Changing a select, radio or checkbox does not navigate or submit by itself unless the control says so beforehand; filters that update results in place are fine, a locale select that reloads the page on change needs a button or a clear label. How to check: operate each control in the walk and watch for navigation.

## Reading the output

### `__axe()`

| Field | Meaning | Goes to |
|---|---|---|
| `violations[].sc` | the WCAG criteria the rule maps to | the owner in the table below |
| `violations[].kind = best-practice` | no WCAG criterion; axe's own advice (`region`, `landmark-unique`, `heading-order`) | NV14, T15 or P2 |
| `incomplete[]` | axe could not decide — mostly contrast over images, gradients, pseudo-elements | ◐; measure on pixels (`design-audit`) |
| `lang`, `title` | `<html lang>` and `<title>` of this page | A3, A2 |

### `__kbd.report()`

| Field | Meaning | Goes to |
|---|---|---|
| `summary.noIndicator` | nothing changed when the control took focus (self, parent, grandparent) | S8, P0 ● |
| `summary.weakIndicator` | an outline or ring under 2px or under 3:1 against the surface behind it; a border or background change under 3:1 against its unfocused colour; an underline alone | S8 (◐ for underline only) |
| `summary.covered` | the focused control's sample points are covered; `by` names the fixed or sticky element | A6 (100% ●, partial ◐) |
| `summary.jumps` | focus went half a screen up, or a third of the width back within a row | A5 ◐ |
| `summary.invisible` | focus landed on something not shown | A5 ●, or NV14 for a skip link that stays hidden |
| `summary.notReached` | tabbable elements the walk never reached — the walk was too short, or they are skipped | walk further; then A4 / A5 |
| `summary.skipLinkFirst` | the first stop is a visible in-page link | NV14 when false |
| `summary.unknown` | controls seen only after the last reset; their indicator is not judged | `__kbd.reset()` on that state and walk again |
| `leftDocument` | focus left the page — the walk reached its end | — |

The indicator contrast is measured against the first opaque background behind the control; on images and gradients judge the screenshot instead (◐).

### `__adapt()`

| Field | Meaning | Goes to |
|---|---|---|
| `newlyClipped` | text cut off with the change that was not cut before | A10 (clamps ◐) |
| `horizontalScroll` | the page became wider than the viewport | L13 at 320/375; A10 otherwise |
| `notScaled` | text that did not grow with the root font size (set in px) | A10, P2 note |
| `motion.running` | CSS animations and transitions longer than 5 s or infinite | A9 |
| `motion.media` | video and audio: autoplay, playing, muted, controls | A9, 1.4.2 |
| `motion.carousels[].pauseControl` | a carousel with a pause or stop button | A9, only when it advances on its own |

## WCAG 2.2 A and AA — who owns what

"Engine" means the axe scan settles the mechanical part (●) and a person judges the rest. N/A triggers are the reason a criterion may be skipped; name them in the report.

| SC | Level | Name | Owner | How it is settled |
|---|---|---|---|---|
| 1.1.1 | A | Non-text Content | A1, I7 | engine (presence) + tree (wording ◐) |
| 1.2.1–1.2.5 | A/AA | Time-based media | A9 | N/A without video or audio with speech |
| 1.3.1 | A | Info and Relationships | F2, TB2, T15, NV14 | engine + tree |
| 1.3.2 | A | Meaningful Sequence | A5 | walk + tree ◐ |
| 1.3.3 | A | Sensory Characteristics | C11 | read instructions ◐ ("the button on the right") |
| 1.3.4 | AA | Orientation | A10 | rotate the mobile preset |
| 1.3.5 | AA | Identify Input Purpose | F8 | engine (`autocomplete-valid`) + code |
| 1.4.1 | A | Use of Color | C11 | screenshot ◐ |
| 1.4.2 | A | Audio Control | A9 | N/A without autoplaying sound |
| 1.4.3 | AA | Contrast (Minimum) | C9 | engine; over images `design-audit` |
| 1.4.4 | AA | Resize Text | A10 | `__adapt("text200")` |
| 1.4.5 | AA | Images of Text | A1 | tree + screenshot |
| 1.4.10 | AA | Reflow | L13, A10 | 320 px (`design-mobile`) |
| 1.4.11 | AA | Non-text Contrast | C10, S8 | code + walk (focus indicators) |
| 1.4.12 | AA | Text Spacing | A10 | `__adapt("spacing")` |
| 1.4.13 | AA | Content on Hover or Focus | A11 | manual |
| 2.1.1 | A | Keyboard | A4, NV13 | walk + operate |
| 2.1.2 | A | No Keyboard Trap | A4, O3 | walk + operate |
| 2.1.4 | A | Character Key Shortcuts | A4 | code search for key handlers; N/A without shortcuts |
| 2.2.1 | A | Timing Adjustable | A13 | N/A without time limits |
| 2.2.2 | A | Pause, Stop, Hide | A9 | `__adapt("motion")` + watching |
| 2.3.1 | A | Three Flashes | A9 | watching |
| 2.4.1 | A | Bypass Blocks | NV14 | walk (`skipLinkFirst`) + tree |
| 2.4.2 | A | Page Titled | A2 | `__axe().title` |
| 2.4.3 | A | Focus Order | A5, O3 | walk |
| 2.4.4 | A | Link Purpose (In Context) | NV5, I7 | engine + tree ◐ |
| 2.4.5 | AA | Multiple Ways | NV7 | search + navigation + sitemap exist |
| 2.4.6 | AA | Headings and Labels | T15, F1 | tree ◐ |
| 2.4.7 | AA | Focus Visible | S8 | walk |
| 2.4.11 | AA | Focus Not Obscured (Minimum) | A6 | walk (`covered`) |
| 2.5.1 | A | Pointer Gestures | M3 | `design-mobile` |
| 2.5.2 | A | Pointer Cancellation | M3 | `design-mobile` |
| 2.5.3 | A | Label in Name | A8 | tree |
| 2.5.4 | A | Motion Actuation | M3 | N/A without shake or tilt |
| 2.5.7 | AA | Dragging Movements | M3 | carousels and sliders have buttons |
| 2.5.8 | AA | Target Size (Minimum) | M1 | `design-mobile` |
| 3.1.1 | A | Language of Page | A3 | `__axe().lang` per locale |
| 3.1.2 | AA | Language of Parts | A3 | tree + code |
| 3.2.1 | A | On Focus | A14 | walk |
| 3.2.2 | A | On Input | A14 | operate |
| 3.2.3 | AA | Consistent Navigation | A12, NV3 | across the sample |
| 3.2.4 | AA | Consistent Identification | A12, I9 | across the sample |
| 3.2.6 | A | Consistent Help | A12 | across the sample |
| 3.3.1 | A | Error Identification | F5 | the sign-up form with errors |
| 3.3.2 | A | Labels or Instructions | F1, F3 | engine + tree |
| 3.3.3 | AA | Error Suggestion | F5, FB10 | the sign-up form with errors ◐ |
| 3.3.4 | AA | Error Prevention (Legal, Financial, Data) | A13 | N/A while no form takes a payment or a binding commitment |
| 3.3.7 | A | Redundant Entry | A13 | the sign-up form |
| 3.3.8 | AA | Accessible Authentication (Minimum) | A13 | N/A without sign-in |
| 4.1.2 | A | Name, Role, Value | A7, S9, O4, I7 | engine + tree + operate |
| 4.1.3 | AA | Status Messages | FB11 | tree: live region present before the update (form sent, form error) |

4.1.1 Parsing is obsolete in WCAG 2.2 and not checked. AAA criteria (2.3.3 Animation from Interactions, 2.4.13 Focus Appearance) are not targets; A9 and S8 take what the project wants from them.
