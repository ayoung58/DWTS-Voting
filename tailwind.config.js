/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./admin-6555.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "purple-dark": "#5B3A8B",
        "purple-medium": "#764BA2",
        "gold-dark": "#D4AF37",
        "gold-bright": "#FFD700",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        body: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
