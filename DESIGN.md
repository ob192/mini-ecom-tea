# Design

## Overview

Jintea — a Ukrainian shop for leaf tea bought direct from village producers in
Yunnan and Taiwan. Mobile first and not as a figure of speech: over the 90 days
to 2026-09-07 the site took **zero orders from 93 mobile sessions** while Google
Ads sent 72 mobile clicks, so the phone layout is the thing that has to be
right. Desktop and tablet are first-class too, each designed rather than
reflowed.

Character: warm cream paper, near-black ink, photography doing the colour work,
and **one accent reserved for the main action**. Depth comes from the surfaces
(`background` → `subtle` → `card`) and hairlines, not from shadows. Type is one
family at moderate sizes, sentence case. A dark band is a block, never the whole
page.

Values live in [`app/globals.css`](app/globals.css) — one file, three layers.
This file holds the decisions. The live reference is `/playground` (dev only).

> **The brand direction is not settled.** `--primary` and its four companions
> currently hold the shop's existing tea green, so the site keeps looking like
> itself. `/playground/brand` renders the three candidates; picking one changes
> five lines in `:root` and five in `.dark`, and the two palettes he rejects get
> deleted. Everything else in this file is decided.

## Colors

The palette has one neutral family plus one family per brand candidate (`leaf`,
`honey`, `clay`) and four status hues. Components never name a palette shade;
they use the roles below. An opacity modifier on a token is still that token
(`bg-foreground/5`) and is allowed wherever the result passes contrast.

| Token | Role | Use |
|---|---|---|
| `background` / `foreground` | the page and its text | warm cream, warm near-black (16.9:1) |
| `subtle` | a quiet band | sections that alternate with `background` |
| `card` | a surface | product cards, summaries, panels; no border, no shadow |
| `muted-foreground` | secondary text | captions, meta, hints, footer links (6.8:1 on the page, 6.0:1 on a card) |
| `primary` | the main action | one filled button per view, the selected weight chip, the active state, the leaf in the wordmark — and nothing else |
| `primary-strong` | pressed | `hover:` and `active:` on `bg-primary` |
| `primary-subtle` / `-foreground` | a tinted area | a highlighted row or badge; never a saturated fill at that size |
| `secondary` | the second button | beside the main action |
| `accent` | hover surface | shadcn's highlight role, **not** a brand colour. A ghost control instead darkens whatever is under it (`foreground/5`, pressed `/10`), so it works on every surface |
| `inverse` / `-foreground` | a dark chip or bar on a light page | small things only; a whole dark band is a `.dark` block instead |
| `border` | a hairline | dividers and decorative edges |
| `border-strong` | a stronger line | hover on a field or an outline control |
| `input` | a field's boundary | 3.9:1 against the page and 3.4:1 on a card, because a field has to be seen (WCAG 1.4.11) |
| `ring` | focus | blue, deliberately not the brand hue, so focus survives a change of brand: 5.0:1 light, 7.4:1 dark |
| `error` `success` `warning` `info` (+ `-foreground`, `-subtle`, `-subtle-foreground`) | status | field errors, alerts, stock badges. `destructive` aliases `error` |

Every pair above is measured, and the ratio is written beside the token in
`app/globals.css`. `/playground` recomputes them from the resolved colours in the
browser, so a value that drifts shows there rather than in a review.

### The dark block (`.dark`)

The page is light. Dark is a **block**: `class="dark"` on a section switches every
semantic token inside it to its dark value, so primitives turn dark on their own
and no `dark:` colour class is ever needed. Two blocks use it today — the footer
(`components/Footer.tsx`) and the discover banner — and any band of imagery with
text over it is one, with the scrim as `bg-background/70`.

This is also why text over a photograph is never `text-primary-foreground`: that
token is white in one brand direction and ink in another, which would put
near-black text on a dark photograph.

In the dark block the page is `neutral-950` (#12110e, warm near-black), a card a
step up at `neutral-900`, hairlines `neutral-800`, and the brand steps **up** to
`leaf-300` with ink text — `leaf-700` is 1.9:1 against a near-black page, so a
green button would simply vanish on it. `input` keeps its light value: one shade
clears 3:1 against both pages.

## Typography

One family: **Geist**, self-hosted through `next/font/local` from Vercel's
variable file (`app/fonts/Geist-Variable.woff2`, 69 KB, weights 100–900).

Not `next/font/google`, because of ₴. Google splits Geist into subsets with a
`unicode-range` each: `cyrillic` covers U+0400–045F, U+0490–0491 and № (U+2116);
`latin` stops at €; and ₴ (U+20B4) is assigned to `cyrillic-ext`, which
next/font's own metadata does not even list for Geist. No combination of the
subsets it offers claims U+20B4, so every price would render its currency sign in
the fallback font. The single variable file carries all 728 glyphs — checked with
fontTools for і ї є ґ І Ї Є Ґ ʼ № ₴ « » ’ – —, all present, nothing falling
through.

Sizes are Tailwind's own steps (`text-xs` … `text-9xl`). Line height and tracking
are fitted to Geist and to Ukrainian: measured content area 1.300 em, x/cap 0.75
(a large x-height, so reading text takes the top of its band at 1.55); Й reaches
0.913 em and g falls to −0.162, so two lines touch at line-height **1.073** and
1.1 is the floor for every heading step. Cyrillic takes about half the negative
tracking Latin would, because rows of parallel stems (ш, щ, н, м) crowd sooner.

| Step | Role |
|---|---|
| `text-4xl` → `sm:text-5xl` | the home hero's headline |
| `text-3xl` | page title (`h1`); a section heading from `sm` |
| `text-2xl` | section heading on phones; block title |
| `text-xl` | card title, dialog title |
| `text-lg` | the name of an item in a list; an accordion summary |
| `text-base` | body copy and leads; everything a visitor reads |
| `text-sm` | meta: captions, hints, descriptions, footer links, button labels |
| `text-xs` | labels: badges, eyebrows (`uppercase tracking-wide`), legal lines |

- **Sentence case.** The only uppercase in the system is the `Eyebrow` and the
  wordmark. The old system set every heading, every button label and every nav
  item in uppercase Oswald; Cyrillic all-caps is slower to read, and «ДОДАТИ В
  КОШИК» at 13px was the main action of the whole shop.
- Weights: 400 body, 500 labels and nav, 600 headings and buttons. `6xl`–`9xl`
  are unused — headings keep a moderate size.
- One `h1` per page. The visual step is independent of the tag.
- Headings `text-balance`, paragraphs `text-pretty`, prices and counts
  `tabular-nums`.
- The wordmark is the one place tracking is set by hand (`tracking-widest` caps):
  that is what makes six letters read as a mark rather than a word.

## Layout

Observed practice — the rhythm new screens follow.

- Breakpoints are Tailwind's: `sm` 640, `md` 768 (tablet portrait), `lg` 1024
  (tablet landscape and small laptops), `xl` 1280. Check 320, 375, 768, **1023**
  (the widest a stacked layout ever gets), 1024, 1440, 1920.
- Container: `mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8` — 16px gutters on
  phones, 24 on tablets, 32 from `lg`. The header, every band and the footer
  share it. A full-bleed band puts the same container inside itself.
- Sections alternate `background` / `subtle`, with `py-16 md:py-20` between them.
- Card padding `p-5 sm:p-6`, inner gaps `gap-1.5`–`gap-3`.
- Two columns only from `lg`; below that one column, with the media following the
  actions closely rather than a long run of text, a gap, then a picture.
- Sizes come from the content and the column, never from the viewport: no `vh`
  heights, no unbounded `vw`. A band looks the same at 1920 as at 1440, with more
  margin around it.
- The page is full width. The old design capped the canvas at the 1440px Pencil
  frame with a deeper band either side; the hero and footer are full-bleed now
  and the cap is gone.
- The footer is pinned to the bottom of a short page by the shell in
  `app/layout.tsx` (`flex min-h-dvh flex-col`, `[&>footer]:mt-auto`).

### Bottom-anchored layers share `--cookie-notice-h`

`components/CookieConsent.tsx` publishes the notice's height into
`--cookie-notice-h` while it is on screen; `.sticky-bar` adds it to its `bottom`,
and `body` reserves it as `padding-bottom`. Without that handshake the notice —
correctly the higher layer — covered 89% of «Додати в кошик» on a 375×812 phone,
so the tap landed on «Добре» and nothing went into the cart. Every ad click is a
first-time visitor, so every ad click hit it. **Anything else pinned to the
bottom of the viewport joins the handshake, not just picks a z-index.**
`tests/bottom-layers.test.ts` fails if either half goes missing.

## Elevation & Depth

Flat. Depth is the surface step (`background` → `subtle` → `card`) and a
hairline; a surface is set apart by its colour **or** by a border, never both.
Shadows belong to overlays: `shadow-xl` on a dialog and a toast, and
`shadow-up` — the one shadow Tailwind has no step for — under the mobile buy bar,
which genuinely floats over the page. The scrim under a modal is `bg-inverse/50`;
over a photograph in a dark block it is `bg-background/70`.

## Motion

- Movement is a response to an action: hover, focus, press, a disclosure opening.
  150–200 ms, and `motion-reduce:` turns it off.
- The home hero's video is a **layer over the still, not a replacement**.
  `components/HeroVideo.tsx` ships `preload="none"` with no `<source>` in the
  markup, so the server HTML carries no video URL; a client effect attaches
  sources only after checking `prefers-reduced-motion`, `connection.saveData`
  and `effectiveType`, then fades the clip in over the poster. Anyone excluded —
  or with JS off, or refused autoplay — downloads zero video bytes and still
  sees a finished hero, and the LCP element stays the next/image poster.
- Anchor jumps are smooth, and instant for a reader who asked for less motion.
  `scroll-padding-top: 6.5rem` on `html` keeps both an anchor target and a
  focused element clear of the sticky header (WCAG 2.4.11).

## Shapes

Tailwind's radius scale, unchanged: `rounded-xs` 2px … `rounded-4xl` 32px.

- Controls — buttons, fields, chips, the stepper: `rounded-md` (6px).
- Cards, images, dialogs, the sticky bar: `rounded-xl` (12px).
- Badges and anything pill-shaped in running text: `rounded-full`.
- Circular icon buttons (the rail's arrows): `rounded-full`.
- An inner radius is smaller than its container's.

The old design was deliberately near-square (`rounded-lg` meant 6px). That is
gone; a 6px card is now off-system, not on it.

## Icons

**lucide-react**, outline, default stroke. Sizes follow the text: 14px beside
`text-xs`, 16px beside `text-sm`/`text-base`, 20px beside `text-lg`, in large
controls and as the glyph of an icon-only button, 24px standalone. Set with
`size-*`. Inside a primitive the primitive sets the size (`[&_svg]:size-4`).
lucide renders `aria-hidden` on its own `<svg>`, so a decorative icon needs
nothing; an icon that carries meaning alone turns it off and takes a label.

Other companies' logos are not icons: Instagram, TikTok, Telegram and YouTube
are drawn as assets in `components/BrandMarks.tsx`, because Lucide has two of
the four and a social row from two sources looks like it.

## Components

Primitives live in [`components/ui`](components/ui) (kebab-case files, shadcn
`new-york`, `cssVariables: true`, Radix underneath where a primitive needs it).

- `Button` — variants primary, secondary, outline, ghost, inverse, destructive,
  link; sizes xs 32, sm 36, default 44, lg 56, icon 44, icon-sm 36. The smaller
  steps grow to 44px on a coarse pointer. `pending` shows a spinner, keeps the
  width, ignores presses and keeps focus (`aria-disabled`, not `disabled`).
- `Field` + `FieldGroup` — label, control, hint, error as one unit. The wrapper
  generates the ids and hands the control `id`, `aria-describedby` and
  `aria-invalid`, so no form wires them by hand and none can ship half-wired.
  The error carries `role="alert"`.
- `Input`, `Textarea` — 16px on phones and 14px from `sm`: iOS Safari zooms the
  whole viewport for a focused input under 16px, and the checkout is where the
  mobile funnel dies.
- `RadioGroup` + `Radio` — two to five visible options; the whole row is the
  target, 44px tall, and the choice shows as a filled disc, not colour alone.
- `WeightChip` — one weight tier. The set is a radio group in behaviour
  (`aria-pressed`, the parent owns the selection), and `compact` is the same
  control at catalogue-card scale. The card used to draw look-alike chips that
  answered nothing when pressed.
- `QtyStepper` — 44px hit areas, the value announced through `aria-live`.
- `Accordion` — `<details>`/`<summary>`, not Radix: it works with no client
  JavaScript and keeps its content in the DOM while collapsed, so a crawler
  reads the brewing copy on a product page.
- `Alert`, `Badge`, `Card`, `Dialog`, `Skeleton`, `SectionHeading`, `TextLink`,
  `BackLink`, `InfoRow`, `Eyebrow`, `Label`, and the react-hook-form bridge in
  `form.tsx`.

### `<Header back>` needs a `backHref`

«Назад» is a real link to the page's parent, never `router.back()`.
History-back dead-ended on any direct landing — a pasted URL, a new tab, an ad
or a search result pointing at a product — and when there *was* a previous entry
it was usually Google, which no browser API distinguishes from one of our own
pages, so back would have returned paid traffic to the auction. The default `/`
is a floor, not an answer: a product's parent is `/catalog?cat=<category>`, which
must match the page's `BreadcrumbList` JSON-LD.
`tests/back-navigation.test.ts` pins both.

## Voice

Ukrainian, «ви», short, no officialese. An error says what happened, what to do
about it, and leaves the phone number as a way through. Prices and dates are
formatted for the locale, never concatenated.

## Do's and Don'ts

- **Do** keep one `bg-primary` button per view; the second action is `secondary`
  or `outline`.
- **Do** make a dark band a `.dark` block, and let the tokens switch.
- **Do** take a one-off shade from the palette only when the design calls for it,
  and say so.
- **Don't** use the brand hue for an area: no brand-coloured footer, no tinted
  card, no status colour as decoration.
- **Don't** write `text-primary-foreground` for "white" — it is ink in one of the
  brand directions.
- **Don't** reach for a raw value. A colour, size or step no token covers is a
  design-system decision.
- **Don't** set a height from the viewport, or a width from `vw` without a cap.
