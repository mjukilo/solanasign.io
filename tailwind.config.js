/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: {
        brand: {
          DEFAULT: '#0ea5e9', // sky-500
          fg: '#e0f2fe',
          ring: 'rgba(14,165,233,.35)'
        }
      },
      boxShadow: {
        glow: '0 0 0 4px rgba(14,165,233,.15), 0 10px 30px rgba(0,0,0,.35)'
      },
      backgroundImage: {
        'grid': "radial-gradient(circle at 1px 1px, rgba(255,255,255,.06) 1px, transparent 0)"
      }
    }
  },
  plugins: [],
}
