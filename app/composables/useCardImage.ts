import { ref, watch } from 'vue'
import { resolveCardImageUrl, getDatabaseCardImage } from '#shared/utils/scryfall'
import { isServerlessEnvironment } from '#shared/utils/env'

/**
 * Composable for resolving Magic card image URLs with fallback chain
 *
 * Handles image resolution with multiple fallback strategies:
 * 1. Provided image URL (if available)
 * 2. Scryfall API with set code (if set provided)
 * 3. Local database lookup (if not serverless)
 * 4. Scryfall API without set (fallback)
 *
 * Includes caching to avoid redundant network requests and automatically
 * skips database calls in serverless environments (Vercel, AWS Lambda).
 *
 * @param name - Card name
 * @param image - Optional provided image URL (highest priority)
 * @param set - Optional set code for specific card version
 * @param options - Optional configuration
 * @param options.cacheKey - Custom cache key (defaults to 'card-tooltip-image-cache')
 * @returns Reactive Ref containing the resolved image URL or null
 *
 * @example
 * ```ts
 * const imageUrl = useCardImage('Lightning Bolt')
 * const imageUrlWithSet = useCardImage('Lightning Bolt', undefined, 'UMA')
 * const imageUrlWithProvided = useCardImage('Lightning Bolt', 'https://example.com/image.jpg')
 * const imageUrlWithCustomCache = useCardImage('Lightning Bolt', undefined, undefined, { cacheKey: 'my-cache' })
 * ```
 */
export function useCardImage(name: string, image?: string, set?: string, options?: { cacheKey?: string }) {
  const imageUrl = ref<string | null>(image || null)
  const cacheKey = options?.cacheKey || 'card-tooltip-image-cache'
  const imageCache = useState<Record<string, string>>(cacheKey, () => ({}))

  // Check if running in serverless environment (Vercel, AWS Lambda, etc.)
  // Only check on server-side, client-side always returns false
  const isServerless = import.meta.client ? false : isServerlessEnvironment()

  // Memoized database lookup callback
  const databaseLookup = (cardNameToLookup: string) => getDatabaseCardImage(cardNameToLookup, isServerless)

  watch(
    () => [name, image, set] as const,
    async ([cardName, providedImage, cardSet]) => {
      const cacheKeyForCard = cardSet ? `${cardName}::${cardSet}` : cardName
      const cached = imageCache.value[cacheKeyForCard]
      if (cached) {
        imageUrl.value = cached
        return
      }

      const resolved = await resolveCardImageUrl(cardName, {
        image: providedImage,
        set: cardSet,
        databaseLookup,
        isServerSide: import.meta.server
      })
      imageUrl.value = resolved

      if (resolved) {
        imageCache.value[cacheKeyForCard] = resolved
      }
    },
    { immediate: true }
  )

  return imageUrl
}
