/*
  spacing.ts — the 4px base grid from `Design System — Tokens`.

  The eight documented steps happen to be exactly Tailwind's 1/2/3/4/6/8/12/16,
  so screens keep using `gap-4`, `px-6` and so on; nothing here needs to be
  wired into the Tailwind config. These named exports exist for the places that
  need a spacing value in JS (inline styles, canvas measurements, tests).
*/

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const;

/** The base unit every step is a multiple of. */
export const BASE_GRID = 4;

/*
  Page gutters and the content column. The desktop frames are 1440px wide with
  a 1200px inner column; mobile frames are 390px with a 20px gutter.
*/
export const layout = {
  contentMaxWidth: 1200,
  gutterMobile: 20,
  gutterDesktop: 32,
} as const;

export type SpaceToken = keyof typeof space;
