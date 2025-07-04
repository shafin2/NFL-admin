/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E0F2F1',
          600: '#00897B',
          900: '#004D40',
        },
        accent: '#00E5FF',
        danger: '#F44336',
        warning: '#FFC107',
        success: '#4CAF50',
      },
    },
  },
  plugins: [],
} 