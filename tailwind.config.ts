import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
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
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'Arial Narrow', 'system-ui', 'sans-serif'],
        body: ['var(--font-pt-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
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
      },
      animation: {
        screenIn: 'screenIn .28s ease',
      },
    },
  },
  plugins: [],
};

export default config;
