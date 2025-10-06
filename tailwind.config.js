/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        melee: '#b94b29',
        ranged: '#4d9a3d',
        magic: '#3f5da1',
        necromancy: '#7f3f98'
      }
    }
  },
  plugins: []
};
