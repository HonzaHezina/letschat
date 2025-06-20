/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // Add any custom theme extensions here (e.g., colors, fonts, animations)
      // For LetsChat, we might want specific chat bubble colors or animations
      colors: {
        'primary': '#1E3A8A', // Example primary color (dark blue)
        'secondary': '#3B82F6', // Example secondary color (blue)
        'accent': '#F59E0B', // Example accent color (amber)
        'background': '#F3F4F6', // Example background color (light gray)
        'text-primary': '#1F2937', // Example primary text color (dark gray)
        'text-secondary': '#6B7280', // Example secondary text color (gray)
      },
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
