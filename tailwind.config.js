/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dusk: {
          50: '#f5f3f0',
          100: '#e8e2db',
          200: '#d4bfb0',
          300: '#b89a85',
          400: '#a07d6a',
          500: '#8b6e60',
          600: '#6b5548',
          700: '#5a4639',
          800: '#3d2f28',
          900: '#2a1f1a',
        },
        ember: {
          50: '#fef5f2',
          100: '#fce8e0',
          500: '#ff7849',
          600: '#e85d30',
          700: '#d14e1e',
        },
        teal: {
          500: '#5eead4',
          600: '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
