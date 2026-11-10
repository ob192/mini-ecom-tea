# DESIGN.md

The project's design decisions in one file at the project root. The CSS file holds the values; DESIGN.md names the tokens, says what each is for, and records the practice that is not a token. Values are not copied into it: a table of token names and roles stays true when a value changes.

Section order follows Google's DESIGN.md (other agent tools read it). Leave a section out when it has nothing to say.

```markdown
# Design

## Overview
Two or three sentences: what the product is, who uses it, the character of the UI
(e.g. "a compact, quiet shop UI; colour only on actions and prices").

## Colors
| Token | Role | Use |
|---|---|---|
| `primary` | main action | one primary button per view; links stay `foreground` |
| `muted-foreground` | secondary text | captions, helper text; never on `muted` below 4.5:1 |
…

## Typography
| Step | Role |
|---|---|
| `text-4xl` | page title |
| `text-base` | body |
…
Font: Geist via next/font. Weights: 400 body, 500 labels, 600 headings.

## Layout
Observed practice — the rhythm new screens follow:
- page sections: `gap-16` mobile, `gap-24` desktop
- container: `max-w-7xl px-4 md:px-6`
- card padding: `p-4`, inside cards `gap-3`
- controls: 44px tall (`h-11`) on touch, 36px (`h-9`) in dense tables
- density: compact — lists and forms keep `gap-2`/`gap-3`

## Elevation & Depth
Borders for structure, one soft shadow for overlays only.

## Shapes
Radius: `rounded-md` controls, `rounded-lg` cards and dialogs, `rounded-full` only for avatars and badges.

## Components
Where to find them (`src/shared/components/ui`) and project-specific variants worth knowing.

## Do's and Don'ts
Short, concrete, from decisions the user made: "Do: one primary action per view." "Don't: tint card backgrounds."
```

## Writing it

- Every line comes from the code (observed) or from the user (decided). Write nothing aspirational.
- Name tokens and classes exactly; the audit flags names that do not exist.
- An existing DESIGN.md is never overwritten: show the diff of what would change and merge with the user's approval.
