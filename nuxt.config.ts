import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  components: true, // должно быть true или объект настроек
  imports: {
    autoImport: true, // по умолчанию true
  },
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxt/ui", "@vueuse/nuxt"],
  ui: {
    icons: ["mdi", "heroicons"],
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL || "/backend",
    },
  },
  ssr: false,
  css: ["../assets/css/main.css"],
  app: {
    head: {
      title: "InvestHold - Crypto Portfolio",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.png" }],
    },
  },
  vite: {
    server: {
      watch: {
        // Vite doesn't watch node_modules and keeps serving the old copy of a package
        // after `npm i` until restart. The editor is loaded by URL into an iframe
        // (components/editor/OphxDemo.vue), so watch it to pick up new versions live.
        ignored: ["!**/node_modules/@phenix1024/editor/**"],
      },
    },
  },
  nitro: {
    devProxy: {
      "/backend": {
        // https: nginx на investhold.ru редиректит http → https (301),
        // а при редиректе POST превращается в GET → "Cannot GET /auth/login"
        target: "https://investhold.ru/backend", //"http://localhost",
        changeOrigin: true,
        prependPath: true,
      },
    },
  },
});
