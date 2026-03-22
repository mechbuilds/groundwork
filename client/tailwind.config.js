/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gw-black': '#0F0E0D',
        'gw-parchment': '#F5F0E8',
        'gw-amber': '#C8852A',
        'gw-forest': '#1A2E1E',
        'gw-muted': '#6B6560',
        'gw-border': '#2A2825',
        'gw-card': '#1C1A17',
        'gw-bg': '#161411',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        mono: ['DM Mono', 'monospace'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}