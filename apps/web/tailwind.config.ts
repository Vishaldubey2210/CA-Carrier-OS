import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--border-subtle)',
        input: 'var(--border-strong)',
        ring: 'var(--brand-primary)',
        background: 'var(--page-background)',
        foreground: 'var(--text-primary)',
        primary: {
          DEFAULT: 'var(--brand-primary)',
          foreground: '#FFFFFF',
          hover: 'var(--brand-primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--surface-secondary)',
          foreground: 'var(--text-primary)',
        },
        destructive: {
          DEFAULT: 'var(--danger-text)',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: 'var(--surface-secondary)',
          foreground: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--brand-soft)',
          foreground: 'var(--brand-primary)',
        },
        popover: {
          DEFAULT: 'var(--surface-primary)',
          foreground: 'var(--text-primary)',
        },
        card: {
          DEFAULT: 'var(--surface-primary)',
          foreground: 'var(--text-primary)',
        },
        brand: {
          primary: 'var(--brand-primary)',
          hover: 'var(--brand-primary-hover)',
          interactive: 'var(--brand-interactive)',
          soft: 'var(--brand-soft)',
          teal: 'var(--brand-teal)',
          'teal-soft': 'var(--brand-teal-soft)',
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
