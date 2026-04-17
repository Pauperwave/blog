import type {
  ScryfallCard,
  ScryfallParsedCard,
  ScryfallImageType
} from '#shared/types'

const SCRYFALL_API_BASE = 'https://api.scryfall.com'
const SCRYFALL_CACHE_KEY = 'scryfall-card-cache'

/**
 * Get or initialize Scryfall card cache
 * Uses Nuxt useState for server/client shared state
 */
function getScryfallCache(): Record<string, ScryfallCard> {
  // Try to get from Nuxt state (works server and client)
  try {
    return useState<Record<string, ScryfallCard>>(SCRYFALL_CACHE_KEY, () => {
      // On client, try to restore from localStorage
      if (import.meta.client) {
        try {
          const stored = localStorage.getItem(SCRYFALL_CACHE_KEY)
          if (stored) {
            return JSON.parse(stored)
          }
        } catch {
          // localStorage might be disabled or full
        }
      }
      return {}
    }).value
  } catch {
    return {}
  }
}

/**
 * Save card to cache (client-side localStorage persistence)
 */
function saveToCache(key: string, card: ScryfallCard) {
  const cache = getScryfallCache()
  cache[key] = card

  // Persist to localStorage on client
  if (import.meta.client) {
    try {
      localStorage.setItem(SCRYFALL_CACHE_KEY, JSON.stringify(cache))
    } catch {
      // localStorage might be disabled or full
    }
  }
}

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
 * Fetch card data from Scryfall API with caching
 * @param name - Card name
 * @param set - Optional set code
 */
async function fetchScryfallCard(name: string, set?: string): Promise<ScryfallCard | null> {
  const cacheKey = set ? `${name}::${set}` : name
  const cache = getScryfallCache()

  // Check cache first
  if (cache[cacheKey]) {
    return cache[cacheKey]
  }

  // Build API URL
  const url = set
    ? `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(name)}&set=${set}`
    : `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(name)}`

  try {
    const response = await $fetch<ScryfallCard>(url)
    saveToCache(cacheKey, response)
    return response
  } catch {
    return null
  }
}

/**
 * Resolve card image URL with fallback chain
 * Priority: provided image → Scryfall with set → Scryfall without set
 * Uses caching to avoid repeated API calls
 * @param name - Card name
 * @param image - Optional provided image URL
 * @param set - Optional set code
 * @param databaseLookup - Optional async function to lookup image from database (unused but kept for compatibility)
 * @param isServerSide - Whether running on server-side (skip Scryfall fetch if true)
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
  const { image, set, isServerSide } = options

  if (image) return image

  // On server-side, return direct image URL without fetching
  if (isServerSide) {
    return buildScryfallImageUrl(name, set)
  }

  // Fetch card data from Scryfall (with caching)
  const card = await fetchScryfallCard(name, set)
  if (card) {
    const imageUrl = extractImageUrl(card)
    if (imageUrl) return imageUrl
  }

  // Fallback to direct image URL
  return buildScryfallImageUrl(name, set)
}

