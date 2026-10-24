/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E2761',
        deep: '#1E2761',
        accent: '#C9A227',
        gold: '#C9A227',
        surface: '#FAFAFA',
        muted: '#5A6274',
        success: '#2F7A4F',
        warning: '#B8860B',
        danger: '#B23A33',
        fiscal: {
          bg: '#FAFAFA',
          white: '#FFFFFF',
          text: '#1E2761',
          muted: '#5A6274',
          border: '#E3E6ED',
        },
      },
      boxShadow: {
        fiscal: '0 8px 24px rgba(30, 39, 97, 0.06)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
