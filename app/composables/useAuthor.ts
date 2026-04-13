export interface Author {
  name: string;
  avatar: string;
  description: string;
  bio?: string;
  url: string;
  nickname?: string;
  socials?: {
    twitter?: string;
    github?: string;
    youtube?: string;
    twitch?: string;
    website?: string;
  };
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
 * Composable to fetch author data from the authors collection
 * @param authorName - The full name of the author (e.g., "Pietro Bragioto")
 * @returns Author data including name, avatar, description, and url
 * @throws Error if author is not found in the authors collection
 */
export const useAuthor = async (authorName: string): Promise<Author> => {
  // Query all authors using the same pattern as other files
  const { data: authors } = await useAsyncData('all-authors', () =>
    queryCollection('authors').all()
  )

  if (!authors.value) {
    throw new Error(`Failed to load authors collection`)
  }

  const author = authors.value.find(
    (a: Author) => a.name.toLowerCase() === authorName.toLowerCase()
  )

  if (!author) {
    throw new Error(`Author "${authorName}" not found in authors collection. Available authors: ${authors.value.map((a: Author) => a.name).join(', ')}`)
  }

  return {
    name: author.name,
    avatar: author.avatar,
    description: author.description,
    bio: author.bio,
    url: author.url,
    nickname: author.nickname,
    socials: author.socials
  }
}

/**
 * Composable to fetch multiple authors data from the authors collection
 * @param authorNames - Array of author names (or single name as string)
 * @returns Array of Author data
 */
export const useAuthors = async (authorNames: string | string[]): Promise<Author[]> => {
  const names = normalizeAuthors(authorNames)

  const authors = await Promise.all(
    names.map(name => useAuthor(name))
  )

  return authors
}
