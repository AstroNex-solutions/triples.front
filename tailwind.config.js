/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-background) / <alpha-value>)',
        'on-background': 'rgb(var(--color-on-background) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-variant': 'rgb(var(--color-surface-variant) / <alpha-value>)',
        'on-surface': 'rgb(var(--color-on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-on-surface-variant) / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--color-surface-container-lowest) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--color-surface-container-low) / <alpha-value>)',
        'surface-container': 'rgb(var(--color-surface-container) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--color-surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--color-surface-container-highest) / <alpha-value>)',
        primary: {
          DEFAULT: '#663399',
          hover: '#8b5cf6', // a lighter purple for hover
          light: '#A2C9E4', // using the light blue as light
          dark: '#333879',  // dark blue
          darkest: '#1B1B48', // very dark blue
        },
        'on-primary': '#ffffff',
        'primary-container': 'rgb(var(--color-primary-container) / <alpha-value>)',
        'on-primary-container': 'rgb(var(--color-on-primary-container) / <alpha-value>)',
        secondary: {
          DEFAULT: '#4DBFB3', // teal
          hover: '#38bdf8',
          light: '#A2C9E4',
        },
        'on-secondary': '#ffffff',
        'secondary-container': 'rgb(var(--color-secondary-container) / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--color-on-secondary-container) / <alpha-value>)',
        'secondary-fixed': '#4DBFB3',
        'on-secondary-fixed': '#1B1B48',
        tertiary: '#333879',
        'on-tertiary': '#ffffff',
        error: '#ef4444',
        'on-error': '#ffffff',
        'error-container': 'rgb(var(--color-error-container) / <alpha-value>)',
        'outline': 'rgb(var(--color-outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--color-outline-variant) / <alpha-value>)',
        dark: '#333333',
        light: '#FFFFFF',
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '1rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '3rem',
        'xxl': '4rem',
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.15', fontWeight: '800' }],
        'headline-lg': ['2.25rem', { lineHeight: '1.25', fontWeight: '700' }],
        'headline-md': ['1.5rem', { lineHeight: '1.35', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'label-md': ['0.875rem', { lineHeight: '1.4', fontWeight: '600' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      fontFamily: {
        arabic: ['Cairo', 'sans-serif'],
        sans: ['Coolvetica', 'Co Text', 'Cairo', 'sans-serif'],
      },
      maxWidth: {
        'container-max': '1280px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'soft': '0 20px 50px -15px rgba(15, 23, 42, 0.06)',
        'glow': '0 10px 30px -5px rgba(102, 51, 153, 0.35)',
        'glow-secondary': '0 10px 30px -5px rgba(77, 191, 179, 0.35)',
      }
    },
  },
  plugins: [],
}