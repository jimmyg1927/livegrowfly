/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",    // ✅ Grabs all your components & pages
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",     // ✅ If you're using app directory (which you are)
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22a2a0",             // 💙 Add your Growfly colors here
        secondary: "#1e1e2f",
        accent: "#ff4081",
      },
      fontFamily: {
        inter: ["'Inter'", "sans-serif"],   // Matches your global styles
        mono: ["'Roboto Mono'", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),        // Optional: Pretty form styling
    require('@tailwindcss/typography'),   // Optional: Great for readable text areas
    require('@tailwindcss/aspect-ratio'), // Optional: Good for media embeds / images
  ],
};
