/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1360px",
      },
    },
    extend: {
      fontFamily: {
        gengboy: ['"Gengboy"'],
        // Add more custom font families as needed
      },
      colors: {
        "bindi-brown": "#34251D",
        "bindi-red": "#da5a2a",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
