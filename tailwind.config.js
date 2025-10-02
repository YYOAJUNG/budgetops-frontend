module.exports = {
  darkMode: 'class',
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3b82f6',
          accent: '#93c5fd',
          green: '#34d399'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Arial']
      },
      borderRadius: {
        xl: '12px'
      },
      boxShadow: {
        soft: '0 8px 24px rgba(2,6,23,0.06)'
      }
    }
  },
  plugins: []
}
