import type {
  ScryfallCard,
  ScryfallParsedCard,
  ScryfallImageType
} from '#shared/types'

const SCRYFALL_API_BASE = 'https://api.scryfall.com'

/**
 * Extract image URL from Scryfall card data
 * Handles both single-faced and double-faced cards
 */
export function extractImageUrl(
  card: ScryfallCard | null,
  imageType: ScryfallImageType = 'normal'
): string | null {
  if (!card) return null

  // Single-faced card
  if (card.image_uris?.[imageType]) {
    return card.image_uris[imageType]
  }

  // Double-faced card (use first face)
  if (card.card_faces?.[0]?.image_uris?.[imageType]) {
    return card.card_faces[0].image_uris[imageType]
  }

  return null
}

/**
 * Parse card string into name + optional set + collector number
 * Formats supported:
 * - "Name (SET) 123" → name + set + collector_number
 * - "Name (SET)" → name + set
 * - "Name" → name only
 */
export function parseCardString(raw: string): ScryfallParsedCard {
  // Case: Card name + set + collector → "Name (SET) 123"
  const regexFull = /^(.+?)\s+\(([A-Za-z0-9]+)\)\s+(\d+)$/
  const matchFull = raw.trim().match(regexFull)
  if (matchFull) {
    return {
      name: matchFull[1]!.trim(),
      set: matchFull[2],
      collector_number: matchFull[3]
    }
  }

  // Case: Card name + set → "Name (SET)"
  const regexSet = /^(.+?)\s+\(([A-Za-z0-9]+)\)$/
  const matchSet = raw.trim().match(regexSet)
  if (matchSet) {
    return {
      name: matchSet[1]!.trim(),
      set: matchSet[2]
    }
  }

  // Case: Just name
  return { name: raw.trim() }
}

/**
 * Build Scryfall API URL for exact card search
 * Used by Display and ArtCrop components
 */
export function buildScryfallCardUrl(parsed: ScryfallParsedCard): string {
  if (parsed.set && parsed.collector_number) {
    // Case: set + collector → /cards/{set}/{collector}
    return `${SCRYFALL_API_BASE}/cards/${parsed.set}/${parsed.collector_number}`
  } else if (parsed.set) {
    // Case: set only → /cards/named?exact=...&set=...
    return `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(parsed.name)}&set=${parsed.set}`
  }
  // Case: name only → /cards/named?exact=...
  return `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(parsed.name)}`
}

/**
 * Build Scryfall API URL for exact card search with image format
 * Used by Tooltip component
 */
export function buildScryfallImageUrl(name: string, set?: string): string {
  const baseUrl = `${SCRYFALL_API_BASE}/cards/named`
  const params = new URLSearchParams({
    exact: name,
    format: 'image'
  })

  if (set) {
    params.append('set', set)
  }

  return `${baseUrl}?${params.toString()}`
}

/**
 * Resolve card image URL with fallback chain
 * Priority: provided image → Scryfall with set → database lookup → Scryfall without set
 * @param name - Card name
 * @param image - Optional provided image URL
 * @param set - Optional set code
 * @param databaseLookup - Optional async function to lookup image from database
 * @param isServerSide - Whether running on server-side (skip database if true)
 */
export async function resolveCardImageUrl(
  name: string,
  options: {
    image?: string
    set?: string
    databaseLookup?: (name: string) => Promise<string | null>
    isServerSide?: boolean
  } = {}
): Promise<string | null> {
  const { image, set, databaseLookup, isServerSide } = options

  if (image) return image
  if (set) return buildScryfallImageUrl(name, set)
  if (isServerSide) return null

  const dbImage = databaseLookup ? await databaseLookup(name) : null
  return dbImage || buildScryfallImageUrl(name)
}

/**
 * Fetch card image URL from local database API
 * Requires Nuxt runtime context for $fetch
 * @param name - Card name
 * @param isServerless - Whether running in serverless environment (skip database if true)
 */
export async function getDatabaseCardImage(name: string, isServerless = false): Promise<string | null> {
  // Skip database call in serverless environment (Vercel, AWS Lambda)
  if (isServerless) {
    return null
  }

  try {
    const response = await $fetch<{
      cards?: Record<string, { imageUrl?: string }>
    }>('/api/cards', { query: { names: name } })

    const directMatch = response.cards?.[name]
    if (directMatch?.imageUrl) return directMatch.imageUrl

    const firstCard = Object.values(response.cards || {})[0]
    return firstCard?.imageUrl || null
  } catch {
    return null
  }
}
