# Design system

Exported from **`/home/bunin192/Apps/Pencil/jintea.pen`** — the Pencil design
file that is upstream of everything in this folder. Two frames in that file are
the source: `Design System — Tokens` and `Design System — Components`. The
`Home Page`, `Product Page — Шу Пуер`, `Mobile — Home` and `Mobile — Product`
frames are the screens those pieces compose into.

```
design/
  tokens/          the palette, type scale, 4px grid, radii, elevation
    colors.ts        surfaces / text / lines / brand, plus the alpha overlays
    typography.ts    the seven-step scale + the recurring component roles
    spacing.ts       the 4px grid and the content column
    radius.ts        3 / 4 / 6 / 8 and `full`
    elevation.ts     hairline first; two shadows for things that truly float
    tokens.css       the CSS twin of the above + the shadcn bridge
    index.ts
  primitives/      one module per panel of `Design System — Components`
  index.ts         `import { Button, WeightChip, tokens } from '@/design'`
```

## The three copies of a token

A token exists in three places, and nothing syncs them automatically:

| where | who reads it |
| --- | --- |
| `design/tokens/*.ts` | JS: inline styles, tests, anything computing a value |
| `design/tokens/tokens.css` | plain CSS in `app/styles/*`, and shadcn via `hsl(var(--…))` |
| `tailwind.config.ts` | every screen, via utility classes |

`tests/design-tokens.test.ts` fails if they disagree. Change the `.pen` file
first, then all three.

## Conventions the design commits to

- **Hairlines, not shadows.** Every card, panel, chip and input is a `card`
  fill with a 1px `line` stroke (`shadow-hairline`). The only shadows are
  `shadow-overlay` (dialogs, toasts) and `shadow-up` (the mobile buy bar).
- **Near-square corners.** 3px on tags, 4px on controls, 6px on images, 8px on
  panels. `rounded-full` is for genuinely circular controls only. A 16px or
  22px radius means a screen is still on the previous design.
- **Two faces, fixed jobs.** Oswald for display (headings, prices, the
  wordmark), PT Sans for everything else. Button labels are body-face, 13/700,
  uppercase, 1px tracking — never display-face.
- **Spacing is Tailwind's default scale.** The design's 4/8/12/16/24/32/48/64
  grid is exactly `1/2/3/4/6/8/12/16`, which is why no spacing scale is
  configured. `tests/design-tokens.test.ts` pins that coincidence.
- **Full-bleed sections, 1200px content.** Hero and footer run edge to edge;
  content is held by `mx-auto max-w-content px-5 lg:px-8`. Note that an auto
  cross-axis margin on a *flex item* makes it shrink to its content — so those
  sections must not sit directly in a `flex flex-col` parent.

## Where the implementation departs from the mockups

- **Search and account glyphs** are drawn in the header. There is no search
  index and no accounts, so they are not rendered rather than shipped dead.
- **The desktop nav carries six categories**, as the design does. The catalogue
  has eleven, and all of them unwrapped overflowed the page horizontally. The
  rest stay in the catalogue filters, the footer, and the mobile disclosure.
- **Journal, the discover banner and the newsletter block** are drawn on the
  home frame but have no data behind them, so they are not built.
- **The `ПРИГОТУВАННЯ` accordion** is filled with per-product brewing
  parameters in the mockup. `public/products.json` carries none, so rather than
  invent numbers it points at `/brewing`.
- **`Field` renders its value at 16px**, not the design's 14px: iOS Safari
  zooms the viewport on focus for anything smaller, which is a real problem on
  the checkout form.
