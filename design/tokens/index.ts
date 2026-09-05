/*
  The design tokens, exported from `Design System — Tokens` in jintea.pen.

  This module is the source of truth for JavaScript. Its CSS twin is
  ./tokens.css, which app/globals.css imports and Tailwind reads through
  tailwind.config.ts. The two must be edited together — tests in
  tests/design-tokens.test.ts fail if they disagree.
*/

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './elevation';

import { colors, alpha } from './colors';
import { typography } from './typography';
import { space, layout } from './spacing';
import { radius } from './radius';
import { shadow, hairline } from './elevation';

export const tokens = {
  colors,
  alpha,
  typography,
  space,
  layout,
  radius,
  shadow,
  hairline,
} as const;
