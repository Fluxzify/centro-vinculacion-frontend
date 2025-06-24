/** @type {import('tailwindcss').Config} */
export default {
   content: [
    "./components/**/*.vue", // Específicamente para tus componentes
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    // Si tienes clases de Tailwind en otros archivos HTML/JS/TS fuera de los directorios estándar de Nuxt, inclúyelos aquí
  ],
  theme: {
    extend: {
      // --- Paleta de Colores Institucional ---
      colors: {
        // Colores Primarios
        'santo-tomas-green': '#1B5E20', // Verde institucional principal
        'santo-tomas-green-secondary': '#2E7D32', // Verde medio complementario
        'santo-tomas-green-light': '#E8F5E8', // Para fondos y highlights
        'white': '#FFFFFF', // Fondo principal y contraste

        // Colores de Apoyo
        'gray-dark': '#2C3E50', // Textos principales
        'gray-medium': '#7F8C8D', // Textos secundarios
        'gray-light': '#F8F9FA', // Fondos alternativos
        'gray-border': '#E9ECEF', // Líneas divisorias

        // Colores de Estado
        'status-success': '#28A745', // Verde
        'status-warning': '#FFC107', // Amarillo
        'status-error': '#DC3545', // Rojo
        'status-info': '#17A2B8', // Cian

        // Colores de Actividades
        'activity-capacitacion': '#1B5E20', // Verde Santo Tomás
        'activity-taller': '#2E7D32', // Verde secundario
        'activity-charlas': '#66BB6A', // Verde claro
        'activity-atenciones': '#28A745', // Verde éxito
        'activity-operativo': '#FFC107', // Amarillo advertencia
        'activity-practica': '#6F42C1', // Violeta académico
        'activity-diagnostico': '#FD7E14', // Naranja diagnóstico
      },

      // --- Tipografía ---
      fontFamily: {
        'roboto': ['Roboto', 'Arial', 'sans-serif'],
        'open-sans': ['Open Sans', 'Arial', 'sans-serif'],
        'mono': ['Courier New', 'monospace'],
      },
      fontSize: {
        'h1': '2.5rem', // 40px
        'h2': '2rem',   // 32px
        'h3': '1.75rem', // 28px
        'h4': '1.5rem',  // 24px
        'body': '1rem',  // 16px
        'caption': '0.875rem', // 14px
      },

      // --- Responsive Breakpoints ---
      screens: {
        'sm': '576px',  // Small Mobile
        'md': '768px',  // Mobile (corresponds to Tablet range in your spec, but for Tailwind, sm/md/lg usually refer to minimum width)
        'lg': '992px',  // Tablet (corresponds to Laptop range)
        'xl': '1200px', // Laptop (corresponds to Desktop range)
        // You can define a custom breakpoint for your 'Desktop' if 'xl' isn't sufficient for '1200px y superior'
        '2xl': '1400px', // Example for larger desktops if needed
      },
    },
  },
  plugins: [],
}