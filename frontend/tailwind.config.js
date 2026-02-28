/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core surface palette
        obsidian: {
          950: '#0a0a0f',
          900: '#0f0f17',
          850: '#13131e',
          800: '#181825',
          700: '#1e1e2e',
          600: '#252538',
        },
        // Electric accent
        electric: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        'grid-pattern-light': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0 0 0 / 0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        'glow-indigo': 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'glow-violet': 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)',
      },
      boxShadow: {
        'glass': '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        'glass-hover': '0 0 0 1px rgba(99,102,241,0.4), 0 8px 32px rgba(99,102,241,0.15), 0 4px 24px rgba(0,0,0,0.5)',
        'card': '0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card-hover': '0 0 0 1px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 40px rgba(0,0,0,0.5)',
        'glow-sm': '0 0 12px rgba(99,102,241,0.4)',
        'glow-md': '0 0 24px rgba(99,102,241,0.35)',
        'glow-lg': '0 0 48px rgba(99,102,241,0.25)',
        'light-card': '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
        'light-card-hover': '0 4px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(99,102,241,0.3)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
