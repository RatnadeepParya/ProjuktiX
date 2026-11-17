/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        dark: {
          bg: '#090d16',
          card: '#0f172a',
          cardHover: '#131e36',
          surface: '#1e293b',
          border: '#1e293b',
          borderHover: '#334155',
          text: '#f8fafc',
          muted: '#94a3b8',
        },
        neon: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(14, 165, 233, 0.15) 1px, transparent 1px)",
        'cyber-gradient': 'linear-gradient(135deg, #0f172a 0%, #090d16 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'neon-blue': '0 0 20px -5px rgba(59, 130, 246, 0.3)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};
