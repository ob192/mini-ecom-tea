/*
  colors.ts — the palette, exported from `Design System — Tokens` in jintea.pen.

  Every value here is authored in the .pen file. Do not invent colors at call
  sites: if a screen needs a shade that is not here, add it to the design file
  first and re-export, otherwise the site and the mockups drift apart.

  `alpha` holds the translucent overlays the design uses on top of dark
  surfaces (hero scrims, footer text). They are expressed as 8-digit hex in the
  .pen file; the same strings are reproduced verbatim.
*/

/** Surfaces, from the page ground up to the raised card. */
export const surface = {
  paper: '#F3ECDD',
  paperDeep: '#EBE1CD',
  card: '#FCF8F0',
} as const;

/** Text, in descending emphasis. */
export const text = {
  ink: '#232719',
  inkSoft: '#5E6151',
  inkFaint: '#908F7C',
} as const;

/** Hairlines. The design separates with 1px lines, not shadows. */
export const line = {
  line: '#E3D9C4',
  lineSoft: '#EDE5D4',
} as const;

/** Brand. `onGreen` is the only text color permitted on a green surface. */
export const brand = {
  green: '#2E4631',
  greenDeep: '#233726',
  amber: '#BE8638',
  amberTint: '#F2E4C8',
  onGreen: '#F3ECDD',
} as const;

/*
  App-level colors that the .pen file does not define, because no mockup shows
  them: interactive green hover, and the validation states the checkout needs.
  Kept separate so it stays obvious which colors came from the design.
*/
export const extended = {
  green600: '#3E5A41',
  greenTint: '#E4E9DF',
  amberDeep: '#A36F28',
  ok: '#3E7A4E',
  danger: '#B0492F',
  dangerTint: '#F3DDD3',
} as const;

/** Translucent overlays, copied from the .pen file's 8-digit hex fills. */
export const alpha = {
  /** Body copy on a green surface. */
  onGreen80: '#F3ECDDCC',
  onGreen69: '#F3ECDDB0',
  onGreen50: '#F3ECDD80',
  /** The footer's top hairline. */
  onGreen15: '#F3ECDD25',
  /** Hero scrim: transparent at the top, green-deep at the bottom. */
  scrimFrom: '#23372600',
  scrimTo: '#233726B0',
} as const;

export const colors = { ...surface, ...text, ...line, ...brand, ...extended } as const;

export type ColorToken = keyof typeof colors;
