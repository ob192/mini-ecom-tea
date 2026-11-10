import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    // Mirror the "@/*" -> "./*" path alias from tsconfig.json.
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  /*
    Override PostCSS with nothing. postcss.config.mjs names Tailwind v4 the way
    Next demands — as a plugin *name* — and Vite, which vitest loads the config
    through, rejects a string plugin and fails every test run with "Invalid
    PostCSS Plugin". No test renders CSS, so there is nothing to lose here.
  */
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
