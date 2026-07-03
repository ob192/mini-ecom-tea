import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ---- brand palette (unchanged) ----
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

        // ---- shadcn bridge colors (read HSL channels from tokens.css) ----
        // These let shadcn utilities (bg-background, text-foreground, ring-ring,
        // border-border, etc.) resolve to the brand theme.
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
      borderRadius: {
        // brand radii (unchanged); shadcn's lg/md/sm map onto --radius below
        sm: '10px',
        DEFAULT: '16px',
        lg: '22px',
        xl: '28px',
      },
      boxShadow: {
        'sh-1': '0 1px 2px rgba(45,40,20,0.05), 0 2px 8px rgba(45,40,20,0.04)',
        'sh-2': '0 4px 14px rgba(45,40,20,0.08), 0 1px 3px rgba(45,40,20,0.05)',
        'sh-up': '0 -6px 18px rgba(45,40,20,0.07)',
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
  plugins: [require('tailwindcss-animate')],
};

export default config;
