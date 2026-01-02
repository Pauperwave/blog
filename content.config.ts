import { defineCollection, defineContentConfig, property } from '@nuxt/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'
import { z } from 'zod/v4'

export default defineContentConfig({
  collections: {
    articles: defineCollection(
      asSitemapCollection({
        // Specify the type of content in this collection
        type: 'page',
        // Define the path to the markdown files for this collection
        // includes all Markdown files within the content/articles and its subdirectories.
        source: 'articles/**/*.md',
        // Define custom schema for docs collection
        schema: z.object({
          title: z.string(),
          subtitle: z.string().optional(),
          description: z.string().optional(),
          author: z.string(),
          date: z.date(),
          updatedAt: z.date(),
          draft: z.boolean().default(false),
          tags: z.array(z.string()).optional(),
          hero: z.object({
            image: property(z.string()).editor({ input: 'media' }),
            alt: z.string(),
            caption: z.string().optional()
          })
        })
      })
    )
  }
})
