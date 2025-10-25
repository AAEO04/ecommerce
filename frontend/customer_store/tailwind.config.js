/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode
        background: 'hsl(0 0% 100%)',
        surface: 'hsl(0 0% 98%)',
        primary: 'hsl(0 0% 9%)',
        secondary: 'hsl(0 0% 45%)',
        border: 'hsl(0 0% 90%)',
        // Dark Mode (via class strategy)
        'dark-background': 'hsl(0 0% 9%)',
        'dark-surface': 'hsl(0 0% 14%)',
        'dark-primary': 'hsl(0 0% 98%)',
        'dark-secondary': 'hsl(0 0% 65%)',
        'dark-border': 'hsl(0 0% 20%)',
        // Accent Colors
        accent: {
          red: '#FF0000',    // Primary Red - Sale badges, errors
          green: '#00A676',  // Green - Add to Cart, success
          purple: '#A100F2', // Purple - Highlights, links
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
