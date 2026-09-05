/*
  radius.ts — corner radii from `Design System — Tokens`.

  The design is deliberately near-square: nothing in the mockups is rounder
  than 8px except deliberately circular controls (icon buttons, carousel
  arrows, the card's add button), which use `full`. If a new surface wants a
  22px radius, it is not following this design.
*/

export const radius = {
  /** Tags, SKU chips. */
  sm: 3,
  /** Buttons, inputs, weight chips, the qty stepper. */
  md: 4,
  /** Images and image frames. */
  lg: 6,
  /** Panels that group several controls. */
  xl: 8,
  /** Circular controls only. */
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
