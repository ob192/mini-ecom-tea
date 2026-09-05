/*
  typography.ts — the type scale, exported from `Design System — Tokens`.

  Two families, both loaded with Cyrillic subsets in app/layout.tsx:
  Oswald for display (headings, prices, buttons that shout) and PT Sans for
  body. `fontFamily` values are the CSS variables next/font writes, so these
  tokens can be used from CSS as well as from Tailwind.

  `scale` is the seven-step scale the design page documents. `roles` are the
  component-specific styles that the design uses repeatedly but that are not
  part of the numbered scale (eyebrows, button labels, card titles).

  Sizes are px numbers; lineHeight is a unitless multiplier; letterSpacing is
  px, matching how the .pen file stores them.
*/

export const fontFamily = {
  display: 'var(--font-oswald), "Arial Narrow", system-ui, sans-serif',
  body: 'var(--font-pt-sans), system-ui, -apple-system, sans-serif',
} as const;

export interface TextStyle {
  family: 'display' | 'body';
  size: number;
  weight: 400 | 500 | 600 | 700;
  lineHeight: number;
  letterSpacing: number;
}

/** The documented scale. One row per line of the type specimen table. */
export const scale = {
  display: { family: 'display', size: 42, weight: 600, lineHeight: 1.12, letterSpacing: 0 },
  h1: { family: 'display', size: 32, weight: 600, lineHeight: 1.1, letterSpacing: 0 },
  h2: { family: 'display', size: 24, weight: 500, lineHeight: 1.15, letterSpacing: 1 },
  h3: { family: 'display', size: 19, weight: 500, lineHeight: 1.2, letterSpacing: 1 },
  body: { family: 'body', size: 15, weight: 400, lineHeight: 1.55, letterSpacing: 0 },
  small: { family: 'body', size: 13, weight: 400, lineHeight: 1.5, letterSpacing: 0 },
  caption: { family: 'body', size: 11, weight: 700, lineHeight: 1.4, letterSpacing: 0.8 },
} as const satisfies Record<string, TextStyle>;

/** Recurring component styles, measured off the component sheet. */
export const roles = {
  /** Uppercase amber lead-in above a headline. */
  eyebrow: { family: 'body', size: 12, weight: 400, lineHeight: 1.4, letterSpacing: 1.6 },
  /** Every button label and column heading: uppercase, wide, bold. */
  label: { family: 'body', size: 13, weight: 700, lineHeight: 1.2, letterSpacing: 1 },
  /** Header and footer navigation. */
  nav: { family: 'body', size: 14, weight: 400, lineHeight: 1.4, letterSpacing: 0 },
  /** Product-card title. Smaller and tighter than h3. */
  cardTitle: { family: 'display', size: 17, weight: 500, lineHeight: 1.15, letterSpacing: 0.4 },
  /** "ВАМ ТАКОЖ СПОДОБАЄТЬСЯ" and friends. */
  sectionHead: { family: 'display', size: 20, weight: 500, lineHeight: 1.2, letterSpacing: 1 },
  /** The wordmark. */
  wordmark: { family: 'display', size: 22, weight: 600, lineHeight: 1, letterSpacing: 3 },
} as const satisfies Record<string, TextStyle>;

export const typography = { fontFamily, scale, roles } as const;

export type ScaleToken = keyof typeof scale;
export type RoleToken = keyof typeof roles;
