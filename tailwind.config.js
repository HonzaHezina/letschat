/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Previous backgroundImage is removed as it's not in the new spec.
      // If it was meant to be kept, it should be explicitly stated.
      // For this task, only colors, animations, and keyframes are mentioned as preserved/updated.
      colors: {
        'primary': {
          DEFAULT: '#0D9488', // Teal-600 (New primary)
          light: '#2DD4BF',   // Teal-400
          dark: '#0F766E',    // Teal-700
        },
        'secondary': { // Using a gray scale for secondary, can be adjusted
          DEFAULT: '#4B5563', // Gray-600
          light: '#6B7280',   // Gray-500
          dark: '#374151',    // Gray-700
        },
        'accent': { // An accent color, e.g., for notifications or highlights
          DEFAULT: '#F59E0B', // Amber-500 (Kept from previous, good accent)
          light: '#FBBF24',   // Amber-400
          dark: '#D97706',    // Amber-600
        },
        'background': '#FFFFFF', // White background
        'surface': '#F9FAFB',  // Light gray for card backgrounds, etc. (Gray-50)
        'text-primary': '#1F2937',    // Dark gray for main text (Gray-800)
        'text-secondary': '#4B5563', // Medium gray for secondary text (Gray-600)
        'border-color': '#E5E7EB',    // Light gray for borders (Gray-200)
        'success': '#10B981', // Green-500
        'danger': '#EF4444',  // Red-500
        'warning': '#F97316', // Orange-500
      },
      // fontFamily: {
      //  sans: ['Inter', 'sans-serif'], // This makes Inter the default sans font
      // },
      // Keep existing animations and keyframes
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-up': 'slideInUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
