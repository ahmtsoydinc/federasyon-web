/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f9f0',
          100: '#dcf0dc',
          200: '#bce2bc',
          300: '#8fcc8f',
          400: '#5eb05e',
          500: '#3d9140',
          600: '#2d7330',
          700: '#255c28',
          800: '#1f4a22',
          900: '#1a3d1c',
        },
        gold: {
          400: '#f5c842',
          500: '#e8b830',
          600: '#c99a20',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
