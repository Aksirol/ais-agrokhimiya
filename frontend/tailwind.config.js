/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Додамо фірмовий зелений колір з твого макета
        agro: {
          dark: '#2A5C4A', // Темно-зелений для бокового меню
          light: '#72A072', // Світло-зелений для кнопок і бейджів
          bg: '#F3F4F6' // Світло-сірий фон
        }
      }
    },
  },
  plugins: [],
}