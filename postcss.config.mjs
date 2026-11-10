/*
  Tailwind v4 is a single PostCSS plugin. It inlines `@import` itself (so
  postcss-import is gone) and ships its own prefixing (so autoprefixer is too).

  Next insists on the string (or object-keyed) form and rejects an imported
  plugin instance; Vite rejects the string. Vitest therefore overrides PostCSS
  entirely in vitest.config.ts — no test renders CSS.
*/
const config = { plugins: { '@tailwindcss/postcss': {} } };

export default config;
