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
    content: {
        build: {
            markdown: {
                toc: {
                    // h4 headings are included
                    // depth: 3,
                    searchDepth: 2,
                },
                // remarkPlugins: {
                //     // we can add options here if needed
                //     "remark-reading-time": {},
                // },
            },
        },
    },
    modules: [
        "@nuxt/ui",
        "@nuxt/image",
        "@nuxtjs/mdc",
        "@nuxt/content",
        "@nuxtjs/seo",
        "@vueuse/nuxt"
    ],
    vite: {
        ssr: {
            external: ["bun:sqlite"],
        },
        optimizeDeps: {
            exclude: ["bun:sqlite"],
        },
    },
});
