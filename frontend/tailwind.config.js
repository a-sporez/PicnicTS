module.exports = {
  content: [
    "./src/**/*.{astro,js,ts,jsx,tsx,md}"
  ],
  theme: {
    extend: {
      colors: {
        "olive-dark": "#22281a",
        "beige-light": "#fdf6e3"
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
