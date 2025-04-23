/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background-color)',    // Will auto-switch with light/dark
        textPrimary: 'var(--text-color)',         // Also switches with light/dark
        accent: 'var(--accent-color)',
        card: '#1e293b',                          // Consistent dark card color
        primary: '#4f46e5',                       // Indigo (your previous)
        textSecondary: '#94a3b8',                 // Soft gray text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        smooth: '0 4px 14px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
