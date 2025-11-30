const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-primary',
    'bg-primary-light',
    'bg-primary-dark',
    'bg-secondary',
    'bg-secondary-light',
    'bg-secondary-dark',
    'text-primary',
    'text-primary-light',
    'text-primary-dark',
    'text-secondary',
    'text-secondary-light',
    'text-secondary-dark',
    'border-primary',
    'border-secondary',
    'from-primary',
    'to-secondary',
    'via-secondary',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Primary (Blue - Sky/Teal)
        primary: {
          DEFAULT: '#0EA5E9',   // sky-500
          light: '#38BDF8',     // sky-400
          dark: '#0284C7',      // sky-600
          foreground: '#FFFFFF',
        },
        // Secondary (Green - Emerald)
        secondary: {
          DEFAULT: '#10B981',   // emerald-500
          light: '#34D399',     // emerald-400
          dark: '#059669',      // emerald-600
          foreground: '#FFFFFF',
        },
        // Accent (Amber)
        accent: {
          DEFAULT: '#FBBF24',   // amber-400
          light: '#FCD34D',     // amber-300
        },
        // Error / destructive
        danger: {
          DEFAULT: '#EF4444',   // red-500
          light: '#F87171',     // red-400
        },
        // Neutrals (Gray scale for better standard consistency)
        gray: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        // Semantic helpers
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F9FAFB',
          dark: '#1F2937',
        },
        border: {
          DEFAULT: '#E5E7EB', // gray-200
          dark: '#374151',    // gray-700
        },
      },
      boxShadow: {
        // subtle card shadows
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        soft: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        glow: '0 0 15px rgba(16, 185, 129, 0.3)', // emerald glow
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
      }
    },
  },
  plugins: [],
};
