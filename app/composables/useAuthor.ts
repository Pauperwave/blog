export interface Author {
  name: string
  avatar: string
  description: string
  bio: string
  url: string
  nickname: string
  socials?: {
    twitter?: string
    github?: string
    youtube?: string
    twitch?: string
    website?: string
  }
}

/**
 * Helper function to normalize author field to always return an array
 * @param author - The author field (string or array of strings)
 * @returns Array of author names
 */
export const normalizeAuthors = (author: string | string[]): string[] => {
  if (Array.isArray(author)) {
    return author
  }
  return [author]
}

/**
 * Composable to fetch a single author from the authors collection.
 * Must be called in a Nuxt context (script setup, plugin, composable).
 *
 * @param authorName - The full name of the author (e.g., "Pietro Bragioto")
 * @returns useAsyncData result with `data` as Author | null and `error`
 *
 * @example
 * const { data: author, error } = await useAuthor('Pietro Bragioto')
 */
export const useAuthor = (authorName: string) => {
  return useAsyncData<Author>(
    `author-${authorName.toLowerCase().replace(/\s+/g, '-')}`,
    async () => {
      const authors = await queryCollection('authors').all() as Author[]

      if (!authors) {
        throw new Error(`Failed to load authors collection`)
      }

      const author = authors.find(
        (a: Author) => a.name.toLowerCase() === authorName.toLowerCase()
      )

      if (!author) {
        throw new Error(
          `Author "${authorName}" not found in authors collection. Available authors: ${authors.map((a: Author) => a.name).join(', ')}`
        )
      }

      return {
        name: author.name,
        avatar: author.avatar,
        description: author.description,
        bio: author.bio,
        url: author.url,
        nickname: author.nickname,
        socials: author.socials
      } satisfies Author
    }
  )
}

/**
 * Composable to fetch multiple authors from the authors collection.
 * Must be called in a Nuxt context (script setup, plugin, composable).
 *
 * @param authorNames - Array of author names or a single name string
 * @returns useAsyncData result with `data` as Author[] and `error`
 *
 * @example
 * const { data: authors, error } = await useAuthors(['Pietro Bragioto', 'Jane Doe'])
 */
export const useAuthors = (authorNames: string | string[]) => {
  const names = normalizeAuthors(authorNames)
  const key = `authors-${names.map(n => n.toLowerCase().replace(/\s+/g, '-')).join('_')}`

  return useAsyncData<Author[]>(
    key,
    async () => {
      const allAuthors = await queryCollection('authors').all() as Author[]

      if (!allAuthors.length) {
        throw new Error(`Authors collection is empty`)
      }

      const results: Author[] = []

      for (const name of names) {
        const author = allAuthors.find(
          (a: Author) => a.name.toLowerCase() === name.toLowerCase()
        )

        if (!author) {
          throw new Error(
            `Author "${name}" not found in authors collection. Available authors: ${allAuthors.map((a: Author) => a.name).join(', ')}`
          )
        }

        results.push({
          name: author.name,
          avatar: author.avatar,
          description: author.description,
          bio: author.bio,
          url: author.url,
          nickname: author.nickname,
          socials: author.socials
        } satisfies Author)
      }

      return results
    }
  )
}
