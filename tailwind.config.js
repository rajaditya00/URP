/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#ffffff', // Pure white background
          secondary: '#f1f5f9', // More visible light slate
          tertiary: '#e2e8f0', // Slightly darker slate for hover states
        },
        accent: {
          primary: '#1d72b8', // Zoho Blue
          secondary: '#3b82f6', // Lighter blue for hovers
          tertiary: '#8ba6c1', // Muted steel blue
        },
        text: {
          primary: '#1e293b', // Very dark slate for high contrast
          secondary: '#475569', // Medium slate for secondary text
          muted: '#94a3b8', // Light slate for disabled/muted text
        },
        border: {
          color: '#94a3b8', // Strong, clear dark slate border
          highlight: '#64748b', // Darker slate for hover borders
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(99, 102, 241, 0.3)',
      },
      backgroundImage: {
        'glass-panel': 'none',
        'gradient-text': 'none',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      borderWidth: {
        DEFAULT: '2px',
      }
    },
  },
  plugins: [],
}
