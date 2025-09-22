import { defineCollection, defineContentConfig, property } from '@nuxt/content'
import { z } from 'zod/v4'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      // Specify the type of content in this collection
      type: 'page',
      // Define the path to the markdown files for this collection
      // includes all Markdown files within the content/blog and its subdirectories.
      source: 'blog/**/*.md',
      // Define custom schema for docs collection
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
        updatedAt: z.date(),
        draft: z.boolean().default(false),
        tags: z.array(z.string()).optional(),
        hero: z.object({
          image: property(z.string()).editor({ input: 'media' }),
          alt: z.string(),
          caption: z.string().optional()
        })
      }),
    })
  }
})
