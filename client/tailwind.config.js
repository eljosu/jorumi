/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jorumi: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#10B981',
          danger: '#EF4444',
          dark: '#1F2937',
          light: '#F3F4F6',
        }
      }
    },
  },
  plugins: [],
}



