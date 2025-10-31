// tailwind.config.cjs
// NO usamos 'path.resolve' esta vez. Usaremos rutas relativas simples.
// const path = require('path'); 
const { fontFamily } = require('tailwindcss/defaultTheme'); 

module.exports = {
  
  // ==========================================
  // === ¡AQUÍ ESTÁ LA CORRECCIÓN! ===
  // ==========================================
  // Le decimos a Tailwind que escanee el index.html
  // Y CUALQUIER archivo .js o .jsx dentro de src/ y TODAS sus subcarpetas.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ==========================================
  // === FIN DE LA CORRECCIÓN ===
  // ==========================================

  theme: {
    extend: {
      fontFamily: {
        'display': ['"Bebas Neue"', 'cursive'], 
        'sans': ['"Roboto Mono"', ...fontFamily.sans], 
      },
      colors: {
        'primary': '#F94144',   // Rojo/Rosa Neón
        'secondary': '#F3722C', // Naranja
        'background': '#1A1A1D', // Fondo CASI negro
        'surface': '#2C2C34',   // Un gris oscuro para tarjetas
        'accent': '#00F0B5',    // Verde/Cian Neón
        'text-dark': '#F5F5F5', // Texto principal (casi blanco)
        'text-light': '#1A1A1D', // Texto para botones claros
      },
      boxShadow: {
        'neon-accent': '0 0 10px #00F0B5, 0 0 20px #00F0B5',
        'neon-primary': '0 0 10px #F94144, 0 0 20px #F94144',
      }
    },
  },
  plugins: [],
};