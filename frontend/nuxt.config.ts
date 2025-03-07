export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: ["@pinia/nuxt", "@nuxtjs/i18n"],
  components: [{ path: "~/components", pathPrefix: false }],
  i18n: {
    langDir: "locales/",
    locales: [
      {
        code: "en",
        file: "en.json",
        name: "English",
      },
      {
        code: "pt",
        file: "pt.json",
        name: "Português",
      },
    ],
    defaultLocale: "pt",

    strategy: "no_prefix",
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: "2025-03-01",
});
