import {
  computeDeckPrice,
  fetchCardPrices,
  type CardPrice,
  type DeckPrice
} from '~/utils/deck-price'

/**
 * Estimated price of a decklist. The prices come from Scryfall in the visitor's browser the first
 * time `load()` is called (when a view that shows the price opens), not with the page.
 */
export function useDeckPrice(cards: MaybeRefOrGetter<{ name: string, quantity: number }[]>) {
  const prices = shallowRef<Map<string, CardPrice> | null>(null)
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')

  const price = computed<DeckPrice | null>(() =>
    prices.value ? computeDeckPrice(toValue(cards), prices.value) : null
  )
  const failed = computed(() => status.value === 'error')

  const load = async () => {
    if (status.value === 'pending' || status.value === 'success') return

    status.value = 'pending'
    try {
      prices.value = await fetchCardPrices(toValue(cards).map(card => card.name))
      status.value = 'success'
    } catch (error) {
      status.value = 'error'
      console.warn('[useDeckPrice] could not load the card prices', error)
    }
  }

  return { price, failed, load }
}
