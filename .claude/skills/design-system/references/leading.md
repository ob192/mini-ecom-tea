# Leading

How to set line height for a font: when the family changes, when a step looks loose or cramped, when a heading's lines collide. The values live in the type tokens (`--text-<step>--line-height`, `--text-<step>--letter-spacing`), so changing them is a `design-system` edit; this file is how to choose them.

## The curve

Leading falls as size grows. Body text needs room for the eye to find the next line; a display line is short and its gaps look wider than they are, so it is set tight. Tracking falls with it: large text gets slightly negative letter-spacing, small text none.

| Steps | Role | Line height | Tracking |
|---|---|---|---|
| `xs`, `sm` | meta, labels | 1.33–1.45 | 0 (labels in caps: `tracking-wide`) |
| `base`, `lg` | reading text, lead | 1.5–1.6 | 0 |
| `xl`, `2xl` | card and block titles | 1.25–1.35 | 0 to −0.01em |
| `3xl`, `4xl` | section and page titles | 1.1–1.2 | −0.01 to −0.02em |
| `5xl` and up | display | 1.0–1.1 | −0.02 to −0.03em |

Tailwind's defaults sit inside these bands. Material 3, IBM Carbon and Vercel's Geist set headings looser (about size + 8px: 32/40, 48/56) with stronger negative tracking (Geist −0.04 to −0.06em); for Cyrillic, take about half that tracking, since rows of parallel stems (ш, щ, н, м) crowd sooner than Latin. Body copy stays at 1.5 or more, and nothing may break when a reader raises it further (WCAG 1.4.12: no fixed-height text boxes).

## Fit it to the font

Measure, then place each step in its band:

```
python scripts/font-metrics.py <every subset file of the family> --wght 700
```

next/font stores the files in `.next/static/media` (dev: `.next/dev/static/media`); the script names the family of each.

- **x-height to cap height.** A large x-height (x/cap 0.73 and up: Geist, Inter) fills the line, so the text reads denser and body wants the upper end of its band. A small one (under 0.68: Garamond, Montserrat is in between) leaves air of its own and takes the lower end.
- **Content area.** The font's ascent + descent. When it is far above 1.2 em, `line-height: normal` is loose, and the tokens should set every step explicitly.
- **Touch point.** The highest mark the language uses plus the deepest descender: two lines touch at that line height. Multi-line headings stay 0.03 em above it.

## Cyrillic

- Cyrillic lowercase is mostly x-height letters with few ascenders. The line reads as an even, dark band, so body text never takes less than Latin would, and gains from the upper end of its band.
- Ukrainian has marks above the cap height: Й, Ї (and Ё, Ў in other languages). They are the highest points of a line, higher than any Latin capital. With tight display leading, they meet the descenders of у, р, д, ц, щ, ф on the line above. `--chars` and `--desc` in the script default to those glyphs.
- So the display floor is the touch point, not 1.0. Tailwind's `5xl`–`9xl` default to 1, which collides in most fonts once a line starts with Ї or Й. Display systems built for Latin (Vercel's Geist headings at 56px and up) use 1.0 too; it holds only for one-line text.
- A mark above the line box is cut by `overflow: hidden`, `truncate` and `line-clamp`. The box reaches `(line-height + ascent − descent) / 2` above the baseline: 0.905 em for Geist at 1.1, under Й's 0.913. Headings wrap rather than clip (T12); where one must clip, give it 0.05 more leading.
- Uppercase headings stack marks over capitals with no descender gap to spare: add 0.05.

## Check it

Render each heading step on two lines in the real font and weight, with the worst case: descenders at the end of line one over Й or Ї at the start of line two. The `/playground` reference page shows this specimen; the type section prints each step's size and line height. Look at it at 375 and 1440. Done when no heading step touches, none looks gappier than the step below it, and body text reads at 1.5 or more.
