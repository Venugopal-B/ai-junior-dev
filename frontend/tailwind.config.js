/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        bg: { DEFAULT: '#0a0b0e', 2: '#111318', 3: '#181c24', 4: '#1e2330' },
        border: { DEFAULT: 'rgba(255,255,255,0.07)', 2: 'rgba(255,255,255,0.12)' },
        accent: { DEFAULT: '#4f8ef7', 2: '#7c5cf7' },
        success: '#34d97b',
        warning: '#f5a623',
        danger: '#f74f4f',
        info: '#38d9f0',
      },
    },
  },
  plugins: [],
};
