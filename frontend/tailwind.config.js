/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1F3B73',
          foreground: '#F5F7FA',
        },
        secondary: {
          DEFAULT: '#5FB7C2',
          foreground: '#0F2E34',
        },
        accent: {
          DEFAULT: '#E3B765',
          foreground: '#3A2710',
        },
        neutral: {
          light: '#F5F7FA',
          DEFAULT: '#E2E8F0',
          muted: '#64748B',
          dark: '#1E293B',
        },
      },
      boxShadow: {
        card: '0 32px 72px -36px rgba(31, 59, 115, 0.35)',
      },
    },
  },
  plugins: [],
};

