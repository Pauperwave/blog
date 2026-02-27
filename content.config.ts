import { defineCollection, defineContentConfig, z } from "@nuxt/content"
import { asSitemapCollection } from "@nuxtjs/sitemap/content"

// Base schema for all content types
const baseContentSchema = z.object({
  title: z.string(),
  date: z.string(),
  description: z.string(),
  tags: z.optional(z.array(z.string())).default([]),
  location: z.optional(z.string()).default(''),
  author: z.string(), // Just the name
  thumbnail: z.string(),
  published: z.boolean().default(false)
})

export default defineContentConfig({
  collections: {
    docs: defineCollection(
      asSitemapCollection({
        source: {
          include: "docs/**/*.md",
          prefix: "/"
        },
        type: "page",
        schema: z.object({
          title: z.string(),
          description: z.string()
        }),
      })
    ),
    authors: defineCollection({
      type: 'data',
      source: 'authors/**.yml',
      schema: z.object({
        name: z.string(),
        nickname: z.string().optional(),
        description: z.string(),
        bio: z.string().optional(),
        avatar: z.string(),
        url: z.string(),
        socials: z.object({
          twitter: z.string().optional(),
          github: z.string().optional(),
          youtube: z.string().optional(),
          twitch: z.string().optional(),
          website: z.string().optional()
        }).optional()
      })
    }),
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
})
