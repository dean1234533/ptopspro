/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        'slide-down': { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'slide-down': 'slide-down 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
