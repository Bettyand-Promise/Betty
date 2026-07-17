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
          DEFAULT: '#2A2D33',
          primary: '#2A2D33',
          dark: '#1A1C20',
          gold: '#E0A82E',
          ink: '#1E2024',
          bg: '#F4F4F3',
          muted: '#5C5F66',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(26, 28, 32,0.04), 0 8px 24px -16px rgba(26, 28, 32,0.25)',
        card: '0 1px 3px rgba(26, 28, 32,0.06), 0 14px 32px -20px rgba(26, 28, 32,0.30)',
      },
    },
  },
  plugins: [],
};

export default config;
