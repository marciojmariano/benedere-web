/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#e75d23',
          light: '#f07a47',
          dark: '#c44d1a',
        },
        secondary: {
          DEFAULT: '#87cc6e',
          light: '#a3d98f',
          dark: '#6ab554',
        },
      },
    },
  },
  plugins: [],
}