import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/*
  tailwind.config.ts — the utility surface of the design system.

  Every scale below mirrors design/tokens/*.ts, which is exported from
  `Design System — Tokens` in jintea.pen. Tailwind is where screens consume the
  tokens; design/tokens is where they are defined. Change the design file
  first, then both.

  Spacing is deliberately absent: the design's 4/8/12/16/24/32/48/64 grid is
  exactly Tailwind's default 1/2/3/4/6/8/12/16, so `gap-4` already means 16px.
*/
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './design/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ---- palette, from design/tokens/colors.ts ----
        paper: { DEFAULT: '#F3ECDD', deep: '#EBE1CD' },
        card: '#FCF8F0',
        ink: { DEFAULT: '#232719', soft: '#5E6151', faint: '#908F7C' },
        line: { DEFAULT: '#E3D9C4', soft: '#EDE5D4' },
        green: {
          DEFAULT: '#2E4631',
          deep: '#233726',
          600: '#3E5A41',
          tint: '#E4E9DF',
        },
        amber: { DEFAULT: '#BE8638', deep: '#A36F28', tint: '#F2E4C8' },
        ok: '#3E7A4E',
        danger: { DEFAULT: '#B0492F', tint: '#F3DDD3' },
        'on-green': '#F3ECDD',

        // ---- shadcn bridge (reads HSL channels from design/tokens/tokens.css) ----
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },

      fontFamily: {
        display: ['var(--font-oswald)', 'Arial Narrow', 'system-ui', 'sans-serif'],
        body: ['var(--font-pt-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },

      /*
        The type scale from design/tokens/typography.ts. Each key carries its
        line height, tracking and weight, so `text-h2` is the whole style and a
        heading never has to restate them. Font family is not part of a
        fontSize in Tailwind — pair display sizes with `font-display`.
      */
      fontSize: {
        display: ['42px', { lineHeight: '1.12', fontWeight: '600' }],
        h1: ['32px', { lineHeight: '1.1', fontWeight: '600' }],
        h2: ['24px', { lineHeight: '1.15', letterSpacing: '1px', fontWeight: '500' }],
        h3: ['19px', { lineHeight: '1.2', letterSpacing: '1px', fontWeight: '500' }],
        body: ['15px', { lineHeight: '1.55' }],
        small: ['13px', { lineHeight: '1.5' }],
        caption: ['11px', { lineHeight: '1.4', letterSpacing: '0.8px', fontWeight: '700' }],

        // component roles (typography.ts `roles`)
        eyebrow: ['12px', { lineHeight: '1.4', letterSpacing: '1.6px' }],
        label: ['13px', { lineHeight: '1.2', letterSpacing: '1px', fontWeight: '700' }],
        nav: ['14px', { lineHeight: '1.4' }],
        'card-title': ['17px', { lineHeight: '1.15', letterSpacing: '0.4px', fontWeight: '500' }],
        'section-head': ['20px', { lineHeight: '1.2', letterSpacing: '1px', fontWeight: '500' }],
        wordmark: ['22px', { lineHeight: '1', letterSpacing: '3px', fontWeight: '600' }],
      },

      /*
        design/tokens/radius.ts. The design is near-square: `rounded-lg` is
        6px, not 22px. `rounded-full` stays for genuinely circular controls.
      */
      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },

      /*
        design/tokens/elevation.ts. Surfaces separate with a hairline; only
        things that truly float get a shadow.
      */
      boxShadow: {
        hairline: 'inset 0 0 0 1px var(--line)',
        overlay: '0 8px 28px rgba(45, 40, 20, 0.14)',
        up: '0 -6px 18px rgba(45, 40, 20, 0.07)',
      },

      maxWidth: {
        content: '1200px',
      },

      keyframes: {
        screenIn: {
          from: { transform: 'translateY(8px)' },
          to: { transform: 'none' },
        },
        // used by Dialog / Sonner entrance
        'fade-in-0': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out-0': { from: { opacity: '1' }, to: { opacity: '0' } },
      },
      animation: {
        screenIn: 'screenIn .28s ease',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
