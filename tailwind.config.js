/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mmtBlue: "#0084FF",
        mmtDarkBlue: "#05203C",
        mmtRed: "#E41B23"
      }
    },
  },
  plugins: [],
}
