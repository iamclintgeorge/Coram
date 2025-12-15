/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Add this line to include all your React component files
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter"],
        playfair: ["Playfair Display"],
      },
    },
  },
  plugins: [],
};
