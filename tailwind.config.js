/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sky/dusk palette matching Claude Design prototype
        sky: {
          top: '#0a1028',
          mid: '#1a1f4d',
          low: '#3b2a62',
          horizon: '#8a3a5e',
        },
        ink: {
          DEFAULT: '#0a0f24',
          2: '#131a38',
        },
        ember: {
          DEFAULT: '#ff7849',
          glow: '#ffb37a',
          sun: '#ffd166',
        },
        teal: {
          DEFAULT: '#5eead4',
          dim: '#2dd4bf',
        },
        violet: '#a78bfa',
        gold: '#fbbf24',
        pink: '#f472b6',
        paper: '#f6efe3',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
        pill: '999px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
