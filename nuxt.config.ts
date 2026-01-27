import { definePerson } from "nuxt-schema-org/schema";
import appMeta from "./app/app.meta";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: [
      "~/assets/css/main.css",
      // ms-3 clash with tailwind
      // "mana-font/css/mana.css"
    ],
    fonts: {
        defaults: {
            weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        },
    },
    site: {
        name: appMeta.name,
        url: appMeta.url,
        defaultLocale: "en",
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
    modules: [
      'nuxt-studio',
      "@nuxt/content",
      "@nuxt/eslint",
      "@nuxt/image",
      "@nuxt/ui",
      "@nuxtjs/mdc",
      "@nuxtjs/seo",
      "@vueuse/nuxt",
      "magic-regexp/nuxt",
      "nuxt-swiper",
      "./modules/card-tooltip-transformer",
      "./modules/decklist-transformer"
    ],
    studio: {
      // Studio admin route (default: '/_studio')
      route: '/admin',

      // Git repository configuration (owner and repo are required)
      repository: {
        provider: 'github',
        owner: 'Pauperwave', // your GitHub/GitLab username or organization
        repo: 'https://github.com/Pauperwave/test', // your repository name
        branch: 'main', // the branch to commit to (default: main)
        rootDir: '', // subdirectory for monorepos (default: '')
        private: true, // request access to private repos (default: true)
      },
      i18n: {
        defaultLocale: 'it'
      }
    },
    nitro: {
      prerender: {
        // Pre-render the homepage
        routes: ['/'],
        // Then crawl all the links on the page
        crawlLinks: true
      }
    },
    icon: {
        collections: ['lucide', 'simple-icons', 'logos', 'mdi']
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
        }
    }
});