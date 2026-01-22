import { defineCollection, defineContentConfig, z } from "@nuxt/content";
import { asSitemapCollection } from "@nuxtjs/sitemap/content";

// Base schema for all content types
const baseContentSchema = z.object({
    title: z.string(),
    date: z.string(),
    description: z.string(),
    tags: z.optional(z.array(z.string())).default([]),
    author: z.string(),
    author_avatar: z.string(),
    author_description: z.string(),
    thumbnail: z.string(),
    published: z.boolean().default(false)
});

export default defineContentConfig({
    collections: {
        articles: defineCollection(
            asSitemapCollection({
                source: {
                    include: "blog/articles/**/*.md",
                    prefix: "/articles"
                },
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("article").default("article"),
                }),
            })
        ),
        tutorials: defineCollection(
            asSitemapCollection({
                source: {
                    include: "blog/tutorials/**/*.md",
                    prefix: "/articles"
                },
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("tutorial").default("tutorial"),
                }),
            })
        ),
        decklists: defineCollection(
            asSitemapCollection({
                source: {
                    include: "blog/decklists/**/*.md",
                    prefix: "/articles"
                },
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("decklist").default("decklist"),
                }),
            })
        ),
        reports: defineCollection(
            asSitemapCollection({
                source: {
                    include: "blog/reports/**/*.md",
                    prefix: "/articles"
                },
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("report").default("report"),
                }),
            })
        ),
        spoilers: defineCollection(
            asSitemapCollection({
                source: {
                    include: "blog/spoilers/**/*.md",
                    prefix: "/articles"
                },
                type: "page",
                schema: baseContentSchema.extend({
                    category: z.literal("spoiler").default("spoiler"),
                }),
            })
        ),
    },
});
