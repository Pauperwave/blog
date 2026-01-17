import { defineCollection, defineContentConfig, z } from "@nuxt/content";
import { asSitemapCollection } from "@nuxtjs/sitemap/content";

// Base schema for all content types
const baseContentSchema = z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.optional(z.array(z.string())),
    author: z.string(),
    author_avatar: z.string(),
    author_description: z.string(),
    thumbnail: z.string(),
    rawbody: z.string(),
});

export default defineContentConfig({
    collections: {
        articles: defineCollection(
            asSitemapCollection({
                source: "content/blog/articles/**/*.md",
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("article").default("article"),
                }),
            })
        ),
        tutorials: defineCollection(
            asSitemapCollection({
                source: "content/blog/tutorials/**/*.md",
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("tutorial").default("tutorial"),
                }),
            })
        ),
        decklists: defineCollection(
            asSitemapCollection({
                source: "content/blog/decklists/**/*.md",
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("decklist").default("decklist"),
                }),
            })
        ),
        reports: defineCollection(
            asSitemapCollection({
                source: "content/blog/reports/**/*.md",
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("report").default("report"),
                }),
            })
        ),
        spoilers: defineCollection(
            asSitemapCollection({
                source: "content/blog/spoilers/**/*.md",
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("spoiler").default("spoiler"),
                }),
            })
        ),
    },
});
