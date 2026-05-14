/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#1A1A2E', dark: '#16213E' },
        crimson: { DEFAULT: '#E94560', hover: '#d63652' },
        amber: '#F5A623',
        background: '#F8F9FC',
        border: '#E5E7EB',
        'text-primary': '#0D0D0D',
        'text-secondary': '#6B7280',
        success: '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 28px rgba(0,0,0,0.12)',
      },
      transitionDuration: { DEFAULT: '200ms' },
    },
  },
  plugins: [],
}
