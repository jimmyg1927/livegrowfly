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
        background:      'hsl(var(--background))',
        textPrimary:     'hsl(var(--textPrimary))',
        accent: {
          DEFAULT:       'hsl(var(--accent))',
          foreground:    'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:       'hsl(var(--card))',
          foreground:    'hsl(var(--card-foreground))',
        },
        muted: {
          DEFAULT:       'hsl(var(--muted))',
          foreground:    'hsl(var(--muted-foreground))',
        },
        border:          'hsl(var(--border))',
        input:           'hsl(var(--input))',
        highlight:       'hsl(var(--highlight))',
      },
      borderRadius: {
        lg:             'var(--radius)',
        md:             'calc(var(--radius) - 2px)',
        sm:             'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
