---
paths:
  - "src/**/*.{tsx,jsx}"
---

# Design rules: Forms

Forms and inputs.

## Before writing

- The form primitives in `src/shared/components/ui` (`Field`, `Input`, `Button`, …). Where a rule needs a piece the project lacks (a field wrapper that wires ids, a label, an input group), build it once as a primitive, not inline in the form; propose it to the user first.
- DESIGN.md: Components, Shapes, Colors, Voice.
- How forms submit (a server action, an API route) and validate, and the `autoComplete` values existing forms use.
- Labels, hints and errors are written in the site's language and voice.

## How to check

Every rule against every target file. When the page runs: tab through the form, submit it empty once, then submit with Enter from a field. When the fix is a missing primitive, say so ("add a `Field` primitive that …") rather than patching each use.

**Severity here:** P0 blocks or misleads users (no label, error not announced, data lost, no keyboard submit, double submit); P1 a visitor sees a broken pattern; P2 polish.

Component names are shadcn's; where the project lacks one, the rule applies to the equivalent markup, and the fix is usually to add that piece as a primitive. Colour names are the project's tokens (`error` here is `destructive` in stock shadcn).

## Field anatomy

**F1 · P0 — Every control has a label.** A visible `<label htmlFor>` (shadcn `Label`/`FieldLabel`) tied to the control's `id`, or a label wrapping it. The placeholder is an example of the value, never the label. A visually hidden label (`sr-only`) only where the context already names the field (a search box with a search icon and button). Check it: `input.labels.length` is never 0 without `aria-label`.

**F2 · P1 — A field is one unit, wired once.** Label, control, then hint or error, stacked with a small gap (`flex flex-col gap-1.5`; shadcn `Field`). A field wrapper primitive generates the ids (`useId`) and passes `id`, `aria-describedby` and `aria-invalid` to the control, so no form wires them by hand. Fields in a form are spaced more widely than the parts of one field (`gap-4`–`gap-6`; shadcn `FieldGroup`). Related checkboxes, radios or switches sit in a `fieldset` with a `legend`.

**F3 · P1 — Hints are tied to the control.** A hint under the control in `text-sm text-muted-foreground`, referenced by `aria-describedby`. Information needed to fill the field lives in the hint, not the placeholder.

**F4 · P1 — Controls look like controls.** A field reads as a field — a boundary or fill, not text on the page — and placeholder text uses `text-muted-foreground`. The boundary's 3:1 contrast is C10.

## Errors and validation

**F5 · P0 — Errors are specific, placed and announced.** The message sits under its field in the error text colour, says how to fix it ("Enter the full number: +380 and 9 digits", in the site's language), and is referenced by `aria-describedby`. The control gets `aria-invalid` and the field wrapper `data-invalid` (so the label can react), both driven by the same error state. How the message is announced is FB11; its wording is FB10.

**F6 · P1 — Validate at the right moment.** On blur or submit, not on every keystroke; once a field has shown an error, re-check it as the user types so the error clears. After a failed submit, focus moves to the first invalid field (long forms: an error summary at the top that links to each field).

**F7 · P0 — Input survives errors.** Values stay after a failed submit or server error; nothing resets until success.

## Controls

**F8 · P1 — The right type, keyboard and autofill.** `type`, `inputMode` and `autoComplete` match the data. Phone: `type="tel"`, `inputMode="tel"`, `autoComplete="tel"` (or `tel-national` when the country code is fixed — follow what the project's forms already use). Name `autoComplete="name"`, email `type="email" autoComplete="email"`, code `autoComplete="one-time-code"`. Autofill is never blocked.

**F9 · P1 — The control fits the choice.** Two to five visible options → radio group or segmented control (`ToggleGroup`), not a loop of buttons with an active state; more options → `Select` or a combobox; a boolean in a form → `Checkbox`, a setting that applies at once → `Switch`; long text → `Textarea`.

**F10 · P1 — Required vs optional is marked once.** Mark the minority: when most fields are required, label the rest "(optional)" in the site's language; when few are, mark those required. Never colour alone.

**F11 — Focus on fields.** Owned by S8, invalid fields included: report `[→ S8]`.

**F12 · P1 — Sizes match their row.** A control and a button in one row share a size step (same height and radius). Touch target size and the 16px input font on phones are `design-mobile`.

**F13 · P2 — Inline actions are grouped.** A button attached to an input (search, promo code) uses `InputGroup` + `InputGroupAddon`, or a flex row of the same size step; no absolutely positioned button over an input. On phones a full-width submit stacks under the field.

## Submit

**F14 · P0 — A form is a form.** Fields that are sent together live in a `<form onSubmit>`, the submit button is `type="submit"`, and Enter in a text field submits.

**F15 · P1 — One clear submit.** One primary button per form, labelled with the outcome ("Sign up", "Get a call back"), not "Submit" or "OK". Secondary actions are a lower variant.

**F16 · P0 — A form cannot be sent twice.** While a submit is in flight, repeat presses and Enter do nothing. How pending looks is S6; the success and failure messages are [feedback.md](feedback.md); the input survives a failure (F7).

**F17 · P1 — Submit stays available.** The submit button stays enabled while fields are invalid; pressing it shows the errors (F5–F6). Disable it only while pending.

## Layout

**F18 · P1 — One column, labels on top.** Fields run in one column with labels above them. Two short related fields (first and last name) may share a row from `sm` up. The form is as narrow as its content (`max-w-md`–`max-w-lg`).

**F19 · P2 — Ask only what is needed.** Every field earns its place; optional detail goes behind a disclosure or into a later step.
