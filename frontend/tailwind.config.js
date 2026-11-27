/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#060B18',
          850: '#0B132B',
          800: '#111E38',
          700: '#1C2E52',
          600: '#284172',
        },
        cyber: {
          cyan: '#00F0FF',
          blue: '#0070F3',
          purple: '#8B5CF6',
          violet: '#A855F7',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 240, 255, 0.35)',
        'neon-blue': '0 0 20px rgba(0, 112, 243, 0.35)',
        'neon-violet': '0 0 20px rgba(168, 85, 247, 0.35)',
        'neon-rose': '0 0 20px rgba(244, 63, 94, 0.35)',
        'neon-emerald': '0 0 20px rgba(16, 185, 129, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'radar-sweep': 'radar 4s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
