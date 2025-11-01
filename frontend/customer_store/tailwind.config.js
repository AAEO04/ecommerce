/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base colors (darker for contrast)
        background: {
          DEFAULT: '#0A0A0A',     // Almost black
          light: '#FAFAFA',       // Off-white (for cards)
        },
        
        // Brand accent colors (your core identity)
        accent: {
          // Green (primary CTA, success, energy)
          green: {
            DEFAULT: '#00D084',   // Brighter, more electric
            50: '#E6FFF5',
            100: '#B3FFE0',
            500: '#00D084',       // Primary
            600: '#00A676',       // Your current green
            700: '#008C63',
            900: '#005C42',
          },
          
          // Red (urgency, sales, highlights)
          red: {
            DEFAULT: '#FF3B5C',   // Less harsh than pure red
            50: '#FFE8ED',
            100: '#FFCCD6',
            500: '#FF3B5C',       // Primary
            600: '#FF0000',       // Your current red
            700: '#D6002E',
            900: '#8F001F',
          },
          
          // Purple (premium, exclusivity, links)
          purple: {
            DEFAULT: '#B857FF',   // Softer than current
            50: '#F5EBFF',
            100: '#E6D1FF',
            500: '#B857FF',       // Primary
            600: '#A100F2',       // Your current purple
            700: '#8800CC',
            900: '#5C0085',
          },
        },
        
        // Neutral palette (better contrast)
        neutral: {
          950: '#0A0A0A',         // True black
          900: '#1A1A1A',         // Card backgrounds
          800: '#2D2D2D',         // Borders
          700: '#404040',
          600: '#666666',
          500: '#808080',
          400: '#999999',
          300: '#B3B3B3',
          200: '#CCCCCC',
          100: '#E6E6E6',
          50: '#F5F5F5',
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
