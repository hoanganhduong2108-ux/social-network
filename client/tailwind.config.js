/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        facebook: {
          primary: '#1877F2',
          secondary: '#42B72A',
          dark: '#1B2A38',
          light: '#F0F2F5'
        }
      }
    },
  },
  plugins: [],
}
