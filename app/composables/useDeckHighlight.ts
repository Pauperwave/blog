import type { MainDeckSection } from '#shared/utils'
import type { DeckHighlight } from '~/utils/deck-highlight'
import { costliestLines, type DeckPrice } from '~/utils/deck-price'
import type { DeckColor } from '~/utils/mana-cost'

/** The stat under the mouse in the visual view: dims or keeps the deck cards, marks the stats. */
export function useDeckHighlight() {
  const highlight = ref<DeckHighlight | null>(null)

  const highlightedColor = computed(() =>
    highlight.value?.kind === 'color' ? highlight.value.color : null
  )
  const highlightedBucket = computed(() =>
    highlight.value?.kind === 'curve' ? highlight.value.bucket : null
  )
  const highlightedSection = computed(() =>
    highlight.value?.kind === 'type' ? highlight.value.section : null
  )

  const highlightedPrice = computed(() => highlight.value?.kind === 'price')

  const onColorHover = (color: DeckColor | null) => {
    highlight.value = color ? { kind: 'color', color } : null
  }
  const onTypeHover = (section: MainDeckSection | null) => {
    highlight.value = section ? { kind: 'type', section } : null
  }
  const onPriceHover = (price: DeckPrice | null) => {
    highlight.value = price
      ? { kind: 'price', keys: new Set(costliestLines(price).map(line => line.key)) }
      : null
  }
  const onCurveHover = (bucket: number | null) => {
    highlight.value = bucket === null ? null : { kind: 'curve', bucket }
  }

  return {
    highlight,
    highlightedColor,
    highlightedBucket,
    highlightedSection,
    highlightedPrice,
    onColorHover,
    onTypeHover,
    onCurveHover,
    onPriceHover
  }
}
