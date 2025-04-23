/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',         // Indigo
        accent: '#38bdf8',          // Sky Blue
        background: '#0f172a',      // Dark Slate
        card: '#1e293b',            // Dark Gray
        textPrimary: '#f1f5f9',     // Light text
        textSecondary: '#94a3b8',   // Soft gray text
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
