# The reference page

What `/playground` shows and how. Distilled from shadcn's design-system page guide (Primer, Carbon, Atlassian, Pajamas, Cloudscape, Material 3).

## Principles

1. **Foundations, then components, then compositions.**
2. **Roles, not palettes.** Each colour as a surface paired with its foreground and the measured contrast; the raw palette comes after.
3. **Lead with the typical case.** Each component opens with its most common use, then variants, then sizes, then states.
4. **Pin states so they can be seen.** Hover, focus, pressed, disabled, invalid and pending render side by side without interaction.
5. **A matrix for primitives, an example for compositions.** Variant × size for buttons; one realistic use plus additions for composed components. Exhaustive combinations belong in tests.
6. **Real content, awkward cases included.** Long text, empty, error, loading.
7. **DESIGN.md made visible.** Its Do's and Don'ts as rendered pairs.

## Outline

| # | Section | Contents |
|---|---|---|
| 1 | Header | System name, where tokens, components and rules live; controls the reference needs (font set, theme) |
| 2 | Colours | Surface pairs with contrast; brand; text tokens on `background` with contrast; lines (`border`, `input`, `ring`); status; palette |
| 3 | Typography | One row per step: class, size / line height (read from the tokens), the use from DESIGN.md, a specimen in real copy truncated to one line. Then weights, then a paragraph of running text with a link |
| 4 | Radius | The same box at each step, labelled with class, value and what uses it |
| 5 | Elevation | Each surface level with what rests on it; the overlay scrim |
| 6 | Icons | The library at each size used, in `foreground` and `muted-foreground` |
| 7 | Actions | Button matrix (variant × size, row headers), icon buttons, states including pending and disabled; Badge variants |
| 8 | Inputs | Fields through the project's field primitive: default, with hint, invalid, disabled, each size; a field + button form |
| 9 | Feedback | Alert variants with title, description and action; toasts and progress when the project has them |
| 10 | Overlays, navigation, data | Whatever primitives exist: dialog, sheet, menu, tabs, table, pagination |
| 11 | Do and Don't | Two to four DESIGN.md rules that are easiest to break, as rendered pairs |
| 12 | Composition | One realistic block built only from tokens and primitives |

Skip a section the project has nothing for. Add a section when a new primitive lands.

## Mechanics

- **Guard.** Pages Router: `getStaticProps` returns `{notFound: true}` when `NODE_ENV === "production"`. App Router: call `notFound()` under the same condition. Add `<meta name="robots" content="noindex">`.
- **Layout.** A sticky side navigation with section anchors on desktop, one column on phones; sections spaced like the site's sections.
- **Live values.** Read resolved colours and token values in the browser (`getComputedStyle`), never hardcode hex next to a class. Values that only exist on the client render a same-size placeholder on the server, so nothing shifts after hydration.
- **Contrast.** Compute WCAG contrast from the resolved colours and format numbers for the site's locale.
- **Pinned states.** For hover/focus/pressed without interaction, add `data-preview` variants to the CSS (`@custom-variant hover { @media (hover: hover) { &:hover { @slot } } &[data-preview~="hover"] { @slot } }`, and the same for `focus-visible` and `active`), then render each state with `data-preview="hover"` etc.
