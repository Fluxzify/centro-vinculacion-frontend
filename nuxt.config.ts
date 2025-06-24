import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  srcDir: 'src/',
  compatibilityDate: '2025-06-23',
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/index.css'
  ],
  plugins: [],
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.NUXT_API_BASE_URL || 'http://localhost:4000'
    }
  }
});
