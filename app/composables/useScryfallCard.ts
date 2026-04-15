import {
  parseCardString,
  buildScryfallCardUrl
} from '#shared/utils/scryfall'
import type {
  ScryfallCard,
  ScryfallParsedCard
} from '#shared/types'

/**
 * Composable for fetching Magic card data from Scryfall API
 *
 * Handles parsing card strings, building API URLs, and managing fetch state.
 * Used by Display and ArtCrop components to retrieve card information.
 *
 * Includes caching to avoid redundant network requests.
 *
 * @param cardString - Card identifier string or ref (e.g., "Lightning Bolt", "Lightning Bolt (UMA) 123")
 * @returns Object containing:
 *   - cardData: Scryfall card data or null
 *   - loading: Whether fetch is in progress
 *   - error: Error message or null
 *   - parsedCard: Parsed card information (name, set, collector_number)
 *
 * @example
 * ```ts
 * const { cardData, loading, error } = useScryfallCard('Lightning Bolt (UMA) 123')
 * // With reactive ref
 * const cardString = ref('Lightning Bolt')
 * const { cardData, loading, error } = useScryfallCard(cardString)
 * ```
 */
export function useScryfallCard(cardString: string | Ref<string>) {
  const cardStringRef = toRef(cardString)
  const cardData = ref<ScryfallCard | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cardCache = useState<Record<string, ScryfallCard>>('scryfall-card-cache', () => ({}))

  const parsedCard = ref<ScryfallParsedCard>(parseCardString(cardStringRef.value))

  watch(
    cardStringRef,
    async (newValue) => {
      const parsed = parseCardString(newValue)
      parsedCard.value = parsed

      if (!parsed.name) {
        cardData.value = null
        error.value = null
        return
      }

      const cacheKey = newValue
      const cached = cardCache.value[cacheKey]
      if (cached) {
        cardData.value = cached
        return
      }

      loading.value = true
      error.value = null

      try {
        const url = buildScryfallCardUrl(parsed)
        const response = await fetch(url)
        if (!response.ok) throw new Error('Card not found')

        const data = await response.json()
        cardData.value = data
        cardCache.value[cacheKey] = data
      } catch (e) {
        cardData.value = null
        error.value = (e as Error).message
      } finally {
        loading.value = false
      }
    },
    { immediate: true }
  )

  return { cardData, loading, error, parsedCard }
}
