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
    '@nuxtjs/sitemap',
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
    // '@vueuse/motion/nuxt',
    '@vite-pwa/nuxt',
    'nuxt-swiper',
    'dayjs-nuxt',
    'nuxt-lucide-icons',
  ],

  vite: {
    plugins: [
      tailwindcss()
    ]
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

  css: ['~/assets/css/main.css'],
  
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
  
  /**
   * Alias 'dayjs' to ensure proper resolution of the Day.js library.
   * @see: https://github.com/nuxt/nuxt/issues/29084
   */
  alias: {
    'dayjs': 'dayjs'
  },
  dayjs: {
    locales: ['en', 'it', 'de'],
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale: 'it',
    defaultTimezone: 'Europe/Rome',
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage',
    key: 'pinia-persisted-state_%id',
    debug: true,
  },
})