import { definePerson } from "nuxt-schema-org/schema";
import appMeta from "./app/app.meta";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
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
      "@nuxt/ui",
      "@nuxt/image",
      "@nuxtjs/mdc",
      "@nuxt/content",
      "@nuxtjs/seo",
      "@vueuse/nuxt",
      "nuxt-swiper",
      "./modules/card-tooltip-transformer",
    ],
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
        },
        ssr: {
            external: ["bun:sqlite"],
        },
        optimizeDeps: {
            exclude: ["bun:sqlite"],
        },
    },
});