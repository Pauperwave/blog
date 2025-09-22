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
    '@pinia/nuxt',
    'pinia-plugin-persistedstate',
    'magic-regexp',
    '@formkit/auto-animate',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@nuxtjs/device',
    '@nuxtjs/seo',
    '@vite-pwa/nuxt',
    '@nuxtjs/fontaine',
    '@nuxtjs/color-mode',
    '@nuxt/icon',
    '@nuxt/fonts',
  ],

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
})