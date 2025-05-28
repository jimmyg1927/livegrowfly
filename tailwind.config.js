/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        textPrimary: 'var(--textPrimary)',
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        'input-border': 'var(--input-border)',
        'input-focus': 'var(--input-focus)',
        highlight: 'var(--highlight)',
      },
      boxShadow: {
        DEFAULT: '0 1px 2px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
