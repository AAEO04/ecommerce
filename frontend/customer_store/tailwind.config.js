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
          light: '#0A0A0A',       // Slightly lighter black for cards/surfaces
        },

        // Brand accent colors (Kinetic Chaos)
        'electric-volt-green': '#46C018',
        'hot-pink': '#D838FF',

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
            DEFAULT: '#D838FF', // Kept as Hot Pink per brand
            50: '#F8E6FF',
            100: '#F0CCFF',
            500: '#D838FF',
            600: '#B127D4',
            700: '#8B1EA5',
            900: '#4B115A',
          },

          // Purple (premium, exclusivity, links)
          purple: {
            DEFAULT: '#A855F7',
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
          950: '#050505',
          900: '#121212',
          800: '#262626',
          700: '#404040',
          600: '#525252',
          500: '#737373',
          400: '#A3A3A3',
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F5F5F5',
          50: '#FAFAFA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'Bebas Neue', 'Impact', 'sans-serif'],
        tagline: ['Bebas Neue', 'Impact', 'sans-serif'],
        druk: ['Druk Wide', 'Arial Black', 'Impact', 'sans-serif'],
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.16, 1, 0.3, 1)', // Ease-out-expo (smooth, snappy)
        'bounce-premium': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'scroll': 'scroll 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
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
