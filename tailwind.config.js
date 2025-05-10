/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        textPrimary: 'hsl(var(--textPrimary))',
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        'input-border': 'hsl(var(--input-border))',
        'input-focus': 'hsl(var(--input-focus))',
        highlight: 'hsl(var(--highlight))',
      },
      boxShadow: {
        focus: '0 0 0 3px rgba(25, 146, 255, 0.3)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
