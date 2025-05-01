/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        /* map your CSS vars into tailwind classes */
        background: 'var(--background)',
        textPrimary: 'var(--textPrimary)',
        accent: 'var(--accent)',
        card: 'var(--card)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
