/*
  elevation.ts — separation rules.

  The design separates surfaces with 1px hairlines, not shadows: every card,
  panel, chip and input in the component sheet is `card` fill + a `line`
  stroke. The two shadows below exist only for elements that genuinely float
  above the page (modals, the mobile sticky buy bar, toasts) and are much
  softer than a typical Material elevation.
*/

export const hairline = {
  width: 1,
  color: 'var(--line)',
} as const;

export const shadow = {
  /** Floating panel: dialogs, toasts. */
  overlay: '0 8px 28px rgba(45, 40, 20, 0.14)',
  /** Bar pinned to the bottom of the viewport, lifting off the content. */
  up: '0 -6px 18px rgba(45, 40, 20, 0.07)',
} as const;

export type ShadowToken = keyof typeof shadow;
