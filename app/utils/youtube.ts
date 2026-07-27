const YOUTUBE_ID_PATTERN = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/

/**
 * Extracts the 11-character video ID from a YouTube URL (youtu.be, watch?v=, embed/, shorts/).
 */
export function getYoutubeVideoId(url: string): string | null {
  return url.match(YOUTUBE_ID_PATTERN)?.[1] ?? null
}

/**
 * Returns YouTube's static thumbnail URL for a video, or null if the URL isn't recognized as YouTube.
 */
export function getYoutubeThumbnail(url: string): string | null {
  const id = getYoutubeVideoId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}
