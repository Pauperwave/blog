/**
 * Converts an author name to a URL-friendly slug
 * @param authorName - The author's full name (e.g., "Pietro Bragioto")
 * @returns URL-friendly slug (e.g., "pietro-bragioto")
 */
export const getAuthorSlug = (authorName: string): string => {
  return authorName.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Converts a slug back to a properly capitalized author name
 * @param slug - The URL slug (e.g., "pietro-bragioto")
 * @returns Capitalized author name (e.g., "Pietro Bragioto")
 */
export const getAuthorNameFromSlug = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
