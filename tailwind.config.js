/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
