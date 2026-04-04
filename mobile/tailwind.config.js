/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brandBlue: '#2563EB',
        brandPurple: '#7C3AED',
        surface: 'rgba(255,255,255,0.9)'
      },
      borderRadius: {
        xl2: '20px'
      },
      boxShadow: {
        soft: '0 10px 24px rgba(15,23,42,0.10)'
      }
    }
  },
  plugins: []
};
