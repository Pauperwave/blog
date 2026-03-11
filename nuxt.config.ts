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
  // Also note that your routeRules with '/articles/**': { prerender: true } and the nitro.prerender.crawlLinks are complementary — the route rules mark those patterns as prerenderable, while crawlLinks is what actually discovers the concrete URLs.
  nitro: {
    preset: 'vercel',
    prerender: {
      // Pre-render the homepage
      routes: ['/'],
      // Then crawl all the links on the page
      crawlLinks: true
    },
  },
  routeRules: {
    // Homepage pre-rendered at build time
    '/': { prerender: true },
    // Nuxt Studio admin - requires SSR
    '/editor/**': { ssr: true },
    // All content pages prerendered
    '/articles/**': { prerender: true },
    // Code of Conduct and Statuto
    '/docs/**': { prerender: true }
  },
  icon: {
    serverBundle: {
      collections: ['lucide', 'simple-icons'],
    },
    clientBundle: {
      scan: true,
    },
    // Avoid external Iconify fetches during prerender/build.
    fallbackToApi: false,
    aliases: {
      // Nuxt UI prose code blocks default to vscode-icons for file extensions.
      // We don't ship that collection locally, so map the JS file icon to an installed icon.
      'vscode-icons-file-type-js': 'lucide:file-code'
    }
  },
  // image: {
  //     dir: 'public',
  // screens: {
  //     xs: 320,
  //     sm: 640,
  //     md: 768,
  //     lg: 1024,
  //     xl: 1280,
  //     xxl: 1536,
  // },
  // alias: {
  //     '/blog': '/assets/blog',
  //     '/articles': '/assets/blog/articles',
  //     '/arts': '/assets/blog/arts',
  //     '/events': '/assets/blog/events',
  //     '/sets': '/assets/blog/sets',
  // },
  // presets: {
  //     thumbnail: {
  //         modifiers: {
  //             format: 'webp',
  //             width: 1200,
  //             height: 630,
  //             fit: 'cover',
  //             quality: 80
  //         }
  //     },
  //     card: {
  //         modifiers: {
  //             format: 'webp',
  //             width: 600,
  //             height: 315,
  //             fit: 'cover',
  //             quality: 75
  //         }
  //     }
  // }
  // },
  vite: {
    css: {
      devSourcemap: true, // Keep sourcemaps in development for debugging
    },
    build: {
      sourcemap: false, // Disable sourcemaps in production to eliminate Tailwind warnings
      chunkSizeWarningLimit: 3000
    }
  }
})
