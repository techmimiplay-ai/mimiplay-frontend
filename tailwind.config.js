/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px', // Large monitors
      '4xl': '2560px', // 4K displays
      'tv': '1920px',  // TV screens
      'tv-4k': '3840px' // 4K TV screens
    },
    extend: {
      colors: {
        // Alexi Color Palette
        primary: {
          50: '#fff5f7',
          100: '#ffe4eb',
          200: '#ffccd9',
          300: '#ffa3bb',
          400: '#ff6b9d',
          500: '#ff3d7f',
          600: '#e61f65',
          700: '#c21555',
          800: '#9e1447',
          900: '#7a0f38',
        },
        secondary: {
          50: '#f0fdfb',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#4ecdc4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          50: '#fffef0',
          100: '#fffbd1',
          200: '#fff59a',
          300: '#ffe66d',
          400: '#ffd43b',
          500: '#fcc419',
          600: '#fab005',
          700: '#f59f00',
          800: '#f08c00',
          900: '#e67700',
        },
        success: '#95e1d3',
        background: '#fff5f7',
        text: '#2d3561',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
        display: ['Fredoka', 'cursive'],
      },
      fontSize: {
        // Enhanced font sizes for better TV readability
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // TV-specific font sizes
        'tv-sm': ['1.5rem', { lineHeight: '2rem' }],
        'tv-base': ['2rem', { lineHeight: '2.5rem' }],
        'tv-lg': ['2.5rem', { lineHeight: '3rem' }],
        'tv-xl': ['3rem', { lineHeight: '3.5rem' }],
        'tv-2xl': ['4rem', { lineHeight: '4.5rem' }],
        'tv-3xl': ['5rem', { lineHeight: '5.5rem' }],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        // Enhanced spacing for TV screens
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        'tv-xs': '1rem',
        'tv-sm': '2rem',
        'tv-md': '3rem',
        'tv-lg': '4rem',
        'tv-xl': '6rem',
        'tv-2xl': '8rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        // TV-optimized text utilities
        '.text-tv-readable': {
          fontSize: '2rem',
          lineHeight: '2.5rem',
          fontWeight: '600',
        },
        '.text-tv-title': {
          fontSize: '4rem',
          lineHeight: '4.5rem',
          fontWeight: '700',
        },
        // TV-optimized spacing
        '.p-tv': {
          padding: '3rem',
        },
        '.m-tv': {
          margin: '3rem',
        },
        // TV-optimized interactive elements
        '.btn-tv': {
          padding: '1.5rem 3rem',
          fontSize: '2rem',
          borderRadius: '1.5rem',
          minHeight: '4rem',
        },
      }
      addUtilities(newUtilities, ['responsive'])
    }
  ],
}