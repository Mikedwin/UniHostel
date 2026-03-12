/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0F766E',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          500: '#6366F1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        success: {
          500: '#22C55E',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          500: '#EAB308',
          600: '#ca8a04',
          700: '#a16207',
        },
        error: {
          500: '#EF4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
    },
  },
  plugins: [],
}
