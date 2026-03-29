import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        foreground: '#e0e0e0',
        card: '#12121a',
        muted: '#1c1c2e',
        mutedForeground: '#6b7280',
        accent: '#00ff88',
        accentSecondary: '#ff00ff',
        accentTertiary: '#00d4ff',
        border: '#2a2a3a',
        ring: '#00ff88',
        destructive: '#ff3366',
        input: '#12121a',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace'],
        sharetech: ['Share Tech Mono', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)', filter: 'none' },
          '91%': { transform: 'translate(-2px, 1px)', filter: 'hue-rotate(90deg)' },
          '92%': { transform: 'translate(2px, -1px)', filter: 'hue-rotate(180deg)' },
          '93%': { transform: 'translate(-1px, 2px)', filter: 'hue-rotate(270deg)' },
        },
        scanline: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100px' },
        },
        rgbShift: {
          '0%, 100%': { textShadow: '-2px 0 #ff00ff, 2px 0 #00d4ff' },
          '50%': { textShadow: '-4px 0 #ff00ff, 4px 0 #00d4ff' },
        },
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 5px #00ff88, 0 0 10px rgba(0,255,136,0.25)' },
          '50%': { boxShadow: '0 0 10px #00ff88, 0 0 20px rgba(0,255,136,0.45)' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        glitch: 'glitch 5s infinite',
        scanline: 'scanline 6s linear infinite',
        rgbShift: 'rgbShift 4s ease-in-out infinite',
        pulseNeon: 'pulse-neon 2.4s ease-in-out infinite',
      },
      boxShadow: {
        neon: '0 0 5px #00ff88, 0 0 10px rgba(0,255,136,0.25)',
        'neon-sm': '0 0 3px #00ff88, 0 0 6px rgba(0,255,136,0.2)',
        'neon-lg': '0 0 8px #00ff88, 0 0 22px rgba(0,255,136,0.35)',
        'neon-secondary': '0 0 5px #ff00ff, 0 0 10px rgba(255,0,255,0.25)',
        'neon-tertiary': '0 0 5px #00d4ff, 0 0 10px rgba(0,212,255,0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
