import { definePerson } from "nuxt-schema-org/schema"
import appMeta from "./app/app.meta"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  components: [
    {
      path: '~/components/content',
      pathPrefix: false,
    },
    {
      path: '~/components/layout',
      pathPrefix: false,
    },
    {
      path: '~/components/ui',
      pathPrefix: false,
    },
    {
      path: '~/components',
    },
  ],
  fonts: {
    defaults: {
      weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
  site: {
    name: appMeta.name,
    url: appMeta.url,
    defaultLocale: "it",
  },
  sitemap: {
    zeroRuntime: true,
  },
  schemaOrg: {
    identity: definePerson(appMeta.author),
  },
  // ogImage: {
  //     enabled: false, // Using static thumbnails instead of dynamic OG image generation
  // },
  content: {
    build: {
      markdown: {
        toc: {
          // h4 headings are included
          // depth: 3,
          searchDepth: 2,
        },
      },
    },
  },
  mdc: {
    highlight: {
      // Avoid WASM loading during serverless bundling (Vercel/Nitro).
      shikiEngine: 'javascript',
    },
  },
  modules: [
    'nuxt-studio',
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    '@nuxt/icon',
    "@nuxt/content",
    // Must come after @nuxt/ui
    // https://ui.nuxt.com/docs/getting-started/integrations/content
    "@nuxtjs/mdc",
    "@nuxtjs/seo",
    "@vueuse/nuxt",
    "magic-regexp/nuxt",
    "nuxt-swiper",
    "@vercel/analytics",
    "./modules/card-tooltip-transformer",
    "./modules/decklist-transformer",
    "./modules/sideboard-guide-transformer"
  ],
  css: [
    "~/assets/css/main.css",
  ],
  studio: {
    // Studio admin route (default: '/_studio')
    route: '/editor',

    // Git repository configuration
    repository: {
      provider: 'github',
      owner: 'Pauperwave',
      repo: 'test',
      branch: 'main',
      private: true,
    },
    i18n: {
      defaultLocale: 'it'
    }
  },
  // Disable payload extraction to prevent _payload.json 404 errors on Vercel
  vite: {
    css: {
      devSourcemap: true, // Keep sourcemaps in development for debugging
    },
    build: {
      sourcemap: false, // Disable sourcemaps in production to eliminate Tailwind warnings
      chunkSizeWarningLimit: 3000
    }
  },
  // Also note that your routeRules with '/articles/**': { prerender: true } and the nitro.prerender.crawlLinks are complementary
  // the route rules mark those patterns as prerenderable, while crawlLinks is what actually discovers the concrete URLs.
  nitro: {
    preset: 'vercel',
    // disables sourcemaps for server functions
    sourceMap: false,
    prerender: {
      // Pre-render the homepage
      routes: ['/', '/docs/componenti'],
      // Then crawl all the links on the page
      crawlLinks: true,
      // Filter routes to only prerender recent articles (< 3 months)
      hooks: {
        'prerender:routes' (routes: string[]) {
          const threeMonthsAgo = new Date()
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

          return routes.filter((route: string) => {
            // Keep all non-article routes
            if (!route.startsWith('/articles/')) return true

            // Extract date from article path: /articles/2026-01-15-title
            const match = route.match(/\/articles\/(\d{4}-\d{2}-\d{2})/)
            if (match && match[1]) {
              const articleDate = new Date(match[1])
              // Only prerender articles from last 3 months
              return articleDate >= threeMonthsAgo
            }

            // Keep routes that don't match date pattern (e.g., /articles)
            return true
          })
        }
      }
    },
  },
  routeRules: {
    // Homepage pre-rendered at build time with cache headers
    '/': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
    // Nuxt Studio admin - requires SSR
    '/editor/**': { ssr: true },
    // Articles: ISR for on-demand regeneration (old articles will be SSR)
    '/articles/**': { isr: 3600, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
    // Code of Conduct and Statuto
    '/docs/**': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
    // Static assets with long cache
    '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    '/assets/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }
  },
  // experimental: {
  //   payloadExtraction: false
  // },
  icon: {
    serverBundle: {
      collections: ['lucide', 'simple-icons']
    },
    clientBundle: {
      scan: true,
      icons: [
        // Nuxt UI prose / MDC components
        'lucide:hash',
        'lucide:info',
        'lucide:lightbulb',
        'lucide:triangle-alert',
        'lucide:circle-alert',
        'lucide:file-code',
        'lucide:arrow-up-right',
        // UI icons
        'lucide:search',
        'lucide:menu',
        // Social icons used dynamically
        'simple-icons:x',
        'simple-icons:twitch',
      ]
    },
    // Avoid external Iconify fetches during prerender/build.
    fallbackToApi: false,
    aliases: {
      // Nuxt UI prose code blocks default to vscode-icons for file extensions.
      // We don't ship that collection locally, so map the JS file icon to an installed icon.
      'vscode-icons-file-type-js': 'lucide:file-code'
    }
  },
  image: {
    // Use static provider for SSG compatibility
    // Vercel provider only works with SSR, not static generation
    provider: 'ipx',
    // Enable image optimization for better performance
    quality: 80,
    format: ['webp', 'jpg', 'png'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    presets: {
      thumbnail: {
        modifiers: {
          format: 'webp',
          width: 1200,
          height: 630,
          fit: 'cover',
          quality: 80
        }
      },
      card: {
        modifiers: {
          format: 'webp',
          width: 488,
          height: 680,
          fit: 'contain',
          quality: 85
        }
      }
    }
  }
})
