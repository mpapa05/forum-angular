/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Tailwind will scan these files for class names
  ],
  theme: {
    screens: {
      'menu-breakpoint': '960px',
    },
    extend: {},
  },
  plugins: [],
}

