import type { MainDeckSection } from '#shared/utils'
import type { DeckHighlight } from '~/utils/deck-highlight'
import type { DeckColor } from '~/utils/mana-cost'

/** The stat under the mouse in the visual view: the deck cards are dimmed or kept by it, and the stats show what is hovered. */
export function useDeckHighlight() {
  const highlight = ref<DeckHighlight | null>(null)

  const highlightedColor = computed(() => highlight.value?.kind === 'color' ? highlight.value.color : null)
  const highlightedBucket = computed(() => highlight.value?.kind === 'curve' ? highlight.value.bucket : null)
  const highlightedSection = computed(() => highlight.value?.kind === 'type' ? highlight.value.section : null)

  const onColorHover = (color: DeckColor | null) => {
    highlight.value = color ? { kind: 'color', color } : null
  }
  const onTypeHover = (section: MainDeckSection | null) => {
    highlight.value = section ? { kind: 'type', section } : null
  }
  const onCurveHover = (bucket: number | null) => {
    highlight.value = bucket === null ? null : { kind: 'curve', bucket }
  }

  return { highlight, highlightedColor, highlightedBucket, highlightedSection, onColorHover, onTypeHover, onCurveHover }
}
