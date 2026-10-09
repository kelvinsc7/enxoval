/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dawn: '#FAF7FB',
        lavender: {
          50: '#FAF6FC',
          100: '#F4ECFA',
          200: '#E8D9F5',
          300: '#D5BDEE',
          400: '#A480D0',
          500: '#8A69B4',
          600: '#7C5BA6',
          700: '#6B4990',
          800: '#4E356A',
          900: '#342147',
        },
        gold: {
          light: '#F4E9CE',
          DEFAULT: '#E0C887',
          dark: '#B89745',
        },
        baby: {
          dark: '#3D332F',
          muted: '#7E736D',
          border: '#EAE5DF',
          bg: '#FAF7FB',
          card: '#FFFFFF',
          green: '#43A579',
        }
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(110, 80, 140, 0.06)',
        float: '0 8px 30px rgba(110, 80, 140, 0.12)',
        pop: '0 12px 40px rgba(74, 43, 94, 0.16)',
      }
    },
  },
  plugins: [],
}
