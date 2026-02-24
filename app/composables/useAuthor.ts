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
