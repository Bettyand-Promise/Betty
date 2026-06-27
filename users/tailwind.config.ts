import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    // Square design — every rounded-* utility resolves to 0.
    borderRadius: {
      none: '0',
      sm: '0',
      DEFAULT: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '0',
    },
    extend: {
      colors: {
        brand: {
          // Burgundy + gold luxury identity. Channel-based CSS vars so Tailwind
          // opacity modifiers (e.g. bg-brand-primary/10) work. Primary/secondary
          // are admin-overridable at runtime; the rest are fixed design tokens.
          DEFAULT: 'rgb(var(--brand-primary) / <alpha-value>)',
          primary: 'rgb(var(--brand-primary) / <alpha-value>)',
          deep: 'rgb(var(--brand-deep) / <alpha-value>)',
          gold: 'rgb(var(--brand-gold) / <alpha-value>)',
          bg: 'rgb(var(--brand-bg) / <alpha-value>)',
          ink: 'rgb(var(--brand-ink) / <alpha-value>)',
          secondary: 'rgb(var(--brand-secondary) / <alpha-value>)',
          muted: '#6B5A5E',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '1180px',
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(42, 20, 24, 0.18)',
        card: '0 18px 40px -20px rgba(42, 20, 24, 0.25)',
        gold: '0 10px 30px -10px rgba(201, 162, 39, 0.45)',
      },
      letterSpacing: {
        wider2: '0.12em',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        kenburns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
        kenburns: 'kenburns 14s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
