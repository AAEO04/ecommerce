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
          DEFAULT: '#000000',     // Pure black for high contrast
          light: '#FAFAFA',       // Off-white (for cards)
        },
        
        // Brand accent colors (Kinetic Chaos)
        'electric-volt-green': '#46C018',
        'hot-pink': '#D838FF',
        'cyan-accent': '#00FFFF',
        
        accent: {
          // Green (primary CTA, success, energy)
          green: {
            DEFAULT: '#46C018',
            50: '#ECFFEB',
            100: '#CFFFC6',
            500: '#46C018',
            600: '#3AA312',
            700: '#2E7C0F',
            900: '#163D08',
          },
          
          // Red (urgency, sales, highlights)
          red: {
            DEFAULT: '#D838FF',
            50: '#F8E6FF',
            100: '#F0CCFF',
            500: '#D838FF',
            600: '#B127D4',
            700: '#8B1EA5',
            900: '#4B115A',
          },
          
          // Purple (premium, exclusivity, links)
          purple: {
            DEFAULT: '#A855F7',   // Updated purple
            50: '#F5EBFF',
            100: '#E6D1FF',
            500: '#B857FF',
            600: '#A100F2',
            700: '#8800CC',
            900: '#5C0085',
          },
        },
        
        // Neutral palette (better contrast)
        neutral: {
          950: '#0A0A0A',
          900: '#1A1A1A',
          800: '#2D2D2D',
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
        display: ['Unbounded', 'Bebas Neue', 'Impact', 'sans-serif'],
        tagline: ['Bebas Neue', 'Impact', 'sans-serif'],
        druk: ['Druk Wide', 'Arial Black', 'Impact', 'sans-serif'],
      },
      animation: {
        'scroll': 'scroll 20s linear infinite',
        'pulse-glow': 'pulse-glow 1s ease-in-out infinite',
        'glitch': 'glitch-skew 3s infinite',
        'drip': 'drip-fall 2s ease-in infinite',
        'burst': 'burst 0.6s ease-out',
        'can-shake': 'can-shake 1s ease-in-out',
        'spray-build': 'spray-build 2s ease-out forwards',
        'ink-rush': 'ink-rush-fade 0.5s ease-out forwards',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
