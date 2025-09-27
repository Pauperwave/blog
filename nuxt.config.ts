import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@compodium/nuxt',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/i18n',
    '@nuxtjs/device',
    '@nuxtjs/seo',
    '@nuxtjs/fontaine',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate',
    'magic-regexp',
    '@formkit/auto-animate',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    'nuxt-swiper',
    'dayjs-nuxt',
  ],
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  // eslint: {
  //   checker: true // run eslint during dev and build
  // },
  content: {
    build: {
      markdown: {
        toc: {
          depth: 3, // include h3 headings
          searchDepth: 2
        }
      }
    }
  },
  css: ['~/assets/css/main.css'],
  // Nuxt UI Prefix
  // ui: {
  //   colorMode: true,
  //   fonts: true
  // },
  i18n: {
    defaultLocale: 'it',
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    locales: [
      { code: 'de', iso: 'de-DE', file: 'de.ts' },
      { code: 'en', iso: 'en-US', file: 'en.ts' },
      { code: 'it', iso: 'it-IT', file: 'it.ts' },
    ],
  },
})