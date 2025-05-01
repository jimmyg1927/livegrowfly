/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0e1016',
        textPrimary: '#e0e0e0',
        accent: '#3b82f6',
        card: '#1a1c23',
        border: '#2a2d3a',
      },
    },
  },
  plugins: [],
}
