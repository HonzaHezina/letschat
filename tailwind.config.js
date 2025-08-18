/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#7d1d5d',      // Main purple from the design
        'secondary': '#ffb600',    // Main yellow from the design
        'accent': '#ee5080',       // Pink accent from the design
        'background': '#f3fbfd',   // Light blue background
        'surface': '#ffffff',      // White for cards and surfaces
        'text-primary': '#1F2937', // Keeping dark gray for main text
        'text-secondary': '#4B5563',// Keeping medium gray for secondary text
        'border-color': '#E5E7EB',
        'success': '#10B981',
        'danger': '#EF4444',
        'warning': '#F97316',
      },
      fontFamily: {
        sans: ['Montserrat', ...fontFamily.sans],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-up': 'slideInUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
