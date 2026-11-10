---
paths:
  - "{app,components,context}/**/*.{tsx,jsx}"
---

# Design rules: States

Every state a view or control can be in besides the happy one. Messages to the user belong to [feedback.md](feedback.md).

## Before writing

- The primitives for states in `components/ui` (`Skeleton`, `Spinner`, `Empty`, `Alert`, how `Button` shows pending). A missing one is built once as a primitive; propose it to the user first.
- List every async view (data fetched, form submitted, action run) and every control with states, each with the states it can reach: loading, empty, error, partial, slow; pending, error, success; hover, focus, pressed, disabled, selected or current. Each is rendered or explicitly out of scope.
- Static marketing sections make the data rules `N/A (static)`.

## How to check

For each entry on the list, which states exist in code. When the page runs, force the states you can: throttle the network, return an error, empty the data.

**Severity here:** P0 a state that strands or misleads users (no error state, data lost, stuck spinner, invisible focus); P1 a missing or inconsistent state; P2 polish.

Component names are shadcn's; without shadcn they mean the equivalent in the project's library or markup. Data views are S1–S5, actions and forms S4–S7, controls S8–S10.

## Data views

**S1 · P1 — Every async view has its states.** Loading, empty, error, and — when data can be incomplete — partial. Designed, not left to whatever renders. A view with no error state at all is P0 under S4.

**S2 · P1 — Loading looks like the result.** Content loads behind a skeleton shaped like the final layout (shadcn `Skeleton`), reserving the same space; a spinner only for a short action or a region with no known shape. Show it after a short delay (~300ms) so fast loads do not flash — this delay is for views, never for the control the user just pressed, which reacts at once (S6).

**S3 · P1 — Empty explains and offers a way on.** What is missing, why, and one action (shadcn `Empty`). Tell apart first use ("No lessons booked yet"), no results ("Nothing matches these filters — reset filters") and cleared ("All done").

**S4 · P0 — Errors give a way out.** Say what happened in the user's words and what to do (retry, change input, contact), next to where it happened. Keep the user's data. Never show raw messages, codes or stack traces. Once per project, check the error boundary and the 404 and 500 pages: they exist, speak the site's language and offer a way back.

**S5 · P1 — Slow and offline are states too.** Every request has a timeout (about 10s for a user action); until then the loading state stays and the page does not freeze, after it the error state offers retry. A lost connection ends the same way.

## Actions

**S6 · P1 — The control that acts shows pending.** At once, a spinner on that control, which keeps its width, and the control ignores further presses — `disabled`, or `aria-disabled` when focus should stay on it; `aria-busy` or a status text tells screen readers. The pattern lives in one primitive (shadcn composes `Spinner` + `disabled` in `Button`; a project may wrap it in a `pending` prop). The rest of the page stays usable. Optimistic updates where the action is safe to roll back, with a rollback message when it fails.

**S7 · P2 — Success is visible where it happened.** The new item appears, the saved field shows "Saved", the form becomes a confirmation. A message elsewhere only when the result is not on screen (see [feedback.md](feedback.md)).

## Controls

**S8 · P0 — Interactive states come from the primitive, focus above all.** Hover (pointer devices only), `focus-visible`, pressed, selected or current, and disabled are defined once in the primitive, not per use. The focus indicator is at least 2px with 3:1 contrast against its surroundings on every control, and stays visible in every state: an invalid field with focus looks different from an invalid field at rest (a common trap: `aria-invalid` styles override the focus ring). Missing hover or pressed styles alone are P1.

**S9 · P1 — Selected and current are exposed.** The matching attribute: `aria-current` for location, `aria-pressed` for toggles, `aria-selected` in tabs and listboxes, `aria-checked` for radios and checkboxes, `aria-expanded` on disclosures. (That it is shown by more than colour is C11.)

**S10 · P1 — Disabled explains itself.** A disabled control says why (a hint next to it) or is hidden when it cannot apply. Disabled is not validation: a form's submit stays enabled and shows errors instead.

## Content

**S11 · P1 — Edge content has a plan.** Long names wrap or truncate per the typography rules; large numbers are formatted; missing images fall back (avatar initials, a placeholder surface with the image's aspect ratio); a list of one and a list of a thousand both work.

**S12 · P2 — Changes of state are calm.** Transitions take 150–200ms and respect `prefers-reduced-motion`. Content the user is reading or about to press does not move: new content is inserted below it, into reserved space, or scrolled into view.
