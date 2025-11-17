module.exports = {
  darkMode: "class",   // REQUIRED FOR MANUAL DARK MODE
  content: [
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        '81rem': '81rem',
      },
    },
  },
  plugins: [],
}
