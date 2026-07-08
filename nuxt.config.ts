import { readdirSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { definePerson } from "nuxt-schema-org/schema"
import appMeta from "./app/app.meta"

/**
 * Reads content/authors/*.yml directly (avoids depending on Nuxt Content's
 * runtime query API, which isn't available in this build-time Nitro hook)
 * and returns the slug for each author, so their pages can be added to the
 * prerender crawl explicitly. Author cards link via programmatic navigation
 * (no real <a href>), so Nitro's crawlLinks crawler can never discover
 * /authors/[slug] routes on its own.
 */
const getAuthorSlugsAtBuildTime = (): string[] => {
  const authorsDir = fileURLToPath(new URL("./content/authors", import.meta.url))
  return readdirSync(authorsDir)
    .filter(file => file.endsWith(".yml"))
    .map(file => {
      const contents = readFileSync(`${authorsDir}/${file}`, "utf-8")
      const match = contents.match(/^name:\s*(.+)$/m)
      return match?.[1]?.trim()
    })
    .filter((name): name is string => Boolean(name))
    .map(name => name.toLowerCase().replace(/\s+/g, "-"))
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  components: [
    {
      path: '~/components/charts',
      pathPrefix: false,
    },
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
  ogImage: {
    zeroRuntime: true,
    buildCache: true
  },
  content: {
    build: {
      markdown: {
        toc: {
          // h4 headings are included
          depth: 3,
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
    "nuxt-studio",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxt/icon", // Must come after @nuxt/ui
    "@nuxt/content", // https://ui.nuxt.com/docs/getting-started/integrations/content
    "@nuxtjs/mdc",
    "@nuxtjs/seo",
    "@nuxtjs/device",
    "@vueuse/nuxt",
    "magic-regexp/nuxt",
    "nuxt-echarts",
    "nuxt-swiper",
    "@vercel/analytics",
    "./modules/card-tooltip-transformer",
    "./modules/decklist-transformer",
    "./modules/sideboard-guide-transformer",
  ],
  echarts: {
    renderer: ['svg'],
    charts: [
      'BarChart',
      'LineChart',
      'PieChart',
      'ScatterChart',
      'RadarChart'
    ],
    components: [
      'DatasetComponent',
      'GridComponent',
      'TooltipComponent',
      'ToolboxComponent',
      'LegendComponent',
      'TitleComponent',
      'RadarComponent',
    ],
    features: [
      'LabelLayout',
      'UniversalTransition'
    ]
  },
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
      repo: 'blog',
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
      chunkSizeWarningLimit: 3000,
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'INVALID_ANNOTATION' && warning.message.includes('#__PURE__')) {
            return
          }
          if (warning.message?.includes('Sourcemap is likely to be incorrect')) {
            return
          }
          warn(warning)
        }
      }
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
      failOnError: false
    },
    // Filter routes to only prerender recent articles (< 3 months), and add
    // author routes explicitly since the crawler can't discover them (see
    // getAuthorSlugsAtBuildTime above).
    hooks: {
      'prerender:routes' (routes: Set<string>) {
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

        for (const route of routes) {
          if (!route.startsWith('/articles/')) continue

          // Extract date from article path: /articles/2026-01-15-title
          const match = route.match(/\/articles\/(\d{4}-\d{2}-\d{2})/)
          if (match && match[1] && new Date(match[1]) < threeMonthsAgo) {
            routes.delete(route)
          }
        }

        routes.add('/authors')
        for (const slug of getAuthorSlugsAtBuildTime()) {
          routes.add(`/authors/${slug}`)
        }
      }
    }
  },
  routeRules: {
    // Homepage pre-rendered at build time with cache headers
    '/': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
    // Articles index page - always prerendered
    '/articles': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
    // Individual articles: prerendered with long cache (rarely change after publication)
    '/articles/**': { prerender: true, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } },
    // Exclude template files from prerendering
    '/articles/0000-00-00-decklist-template': { prerender: false },
    '/articles/0000-00-00-chart-demo-template': { prerender: false },
    '/reports/0000-00-00-report-template': { prerender: false },
    '/spoilers/0000-00-00-spoiler-template': { prerender: false },
    // Nuxt Studio admin - requires SSR
    '/editor': { ssr: true },
    '/editor/**': { ssr: true },
    // Code of Conduct and Statuto
    '/docs/**': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
    // Author profile pages: prerendered explicitly (see the prerender:routes hook above),
    // since author cards link via programmatic navigation with no crawlable <a href>.
    '/authors': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
    '/authors/**': { prerender: true, headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
    // Static assets with long cache
    '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    '/assets/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } }
  },
  experimental: {
    payloadExtraction: process.env.NODE_ENV === 'production'
  },
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
        'simple-icons:reddit',
        'simple-icons:youtube',
        'simple-icons:github',
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