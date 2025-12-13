import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  components: true,  // должно быть true или объект настроек
  imports: {
    autoImport: true  // по умолчанию true
  },
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxt/ui',
    '@vueuse/nuxt'
  ],
  ui: {
    icons: ['mdi', 'heroicons']
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || 'http://localhost:3000/backend'
    }
  },
  ssr: false,
  css: ['../assets/css/main.css'],
  app: {
    head: {
      title: 'InvestHold - Crypto Portfolio',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  nitro: {
    devProxy: {
      '/backend': {
        target: 'http://investhold.ru/backend',
        changeOrigin: true,
        prependPath: true,
      }
    }
  },
})