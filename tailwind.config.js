/** @type {import('tailwindcss').Config} */                
module.exports = {                                       
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        minimal: {
          blue: '#2196F3',
          blueLight: '#BBDEFB',
          blueDark: '#1976D2',
          blueDeep: '#0D47A1',
          white: '#FFFFFF',
          grayLight: '#F8F8F8',
          text: '#1A202C',
        },
      },
      boxShadow: {
        'minimal': '0px 2px 4px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.15)',
        'minimal-btn': '0px 2px 4px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        '2xl': '1rem',
        DEFAULT: '1rem',
      },
      fontFamily: {
        minimal: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'minimal-white-grad': 'linear-gradient(145deg, #FFFFFF, #F8F8F8)',
        'minimal-blue-grad': 'linear-gradient(145deg, #2196F3, #1976D2)',
      },
    },
  },
  plugins: [],
};                                                       
