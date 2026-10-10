<script setup lang="ts">
// Sizes come from CSS variables set by DecklistGraphic:
// --card-strip (visible title strip) and --card-offset (sideboard stagger)
import type { DeckCard } from '~/utils/deck-cards'
import { highlightState, type DeckHighlight } from '~/utils/deck-highlight'
import { formatEur, priceKey, type PriceLine } from '~/utils/deck-price'

const { cards, spread = false, highlight = null, priceLines = null } = defineProps<{
  cards: DeckCard[]
  /** Fill the parent's height with full cards, alternating left and right, first on top */
  spread?: boolean
  /** Cards outside of it are dimmed, the ones it says nothing about are left alone */
  highlight?: DeckHighlight | null
  /** Price of each card by price key, once loaded: shown on the hovered card */
  priceLines?: ReadonlyMap<string, PriceLine> | null
}>()

// Indexes of the images already loaded; the others show a skeleton
const loaded = reactive(new Set<number>())

const stateOf = (card: DeckCard) => highlight ? highlightState(card, highlight) : 'neutral'
const isHighlighted = (card: DeckCard) => stateOf(card) === 'match'
const isDimmed = (card: DeckCard) => stateOf(card) === 'dim'

// Spread: full cards alternating left and right.
// Pile: clipped to the title strip, a highlighted card is shown whole in front
const itemClass = (card: DeckCard, index: number) => {
  if (spread) {
    return [
      'absolute inset-x-0 hover:z-10',
      isHighlighted(card) ? 'z-10' : '',
      index % 2 === 0 ? 'pe-(--card-offset)' : 'ps-(--card-offset)'
    ]
  }
  return [
    'relative h-(--card-strip) last:h-auto last:overflow-visible hover:z-10 hover:overflow-visible',
    isHighlighted(card) ? 'z-10 overflow-visible' : 'overflow-hidden'
  ]
}

const imageClass = (card: DeckCard, index: number) => [
  loaded.has(index) ? 'block' : 'hidden',
  { 'grayscale-80 brightness-60': isDimmed(card) }
]

const priceLabel = (card: DeckCard) => {
  const line = priceLines?.get(priceKey(card.name))
  return line ? `${card.quantity} × ${formatEur(line.unit)}` : null
}

const spreadStyle = (index: number) => {
  const fraction = cards.length > 1 ? (index / (cards.length - 1)) * 100 : 0
  return { top: `${fraction}%`, transform: `translateY(-${fraction}%)` }
}
</script>

<template>
  <!--
    Stack: every card but the last is clipped to its title strip. Hover reveals it fully,
    and so does a highlighted card, in front of the others
  -->
  <ul
    class="m-0 list-none p-0"
    :class="{ 'absolute inset-0': spread }"
  >
    <li
      v-for="(card, index) in cards"
      :key="index"
      class="group m-0 p-0"
      :class="itemClass(card, index)"
      :style="spread ? spreadStyle(index) : undefined"
    >
      <!-- Radius in % keeps the tooltip's corner proportions (12px on a 280px card) at any size -->
      <!-- pointer-events-none: the zoomed image takes no hover, neighbours stay reachable -->
      <!-- In flow with the same box as the image, so it matches; the hidden image still loads -->
      <!-- The wrapper zooms; the price chip is scaled back down by half so it keeps its size -->
      <div
        class="pointer-events-none relative motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:scale-200"
      >
        <USkeleton
          v-if="!loaded.has(index)"
          class="block aspect-488/680 h-auto w-full rounded-[4.3%/3.1%]"
        />
        <img
          :src="card.imageUrl"
          :alt="card.name"
          crossorigin="anonymous"
          class="aspect-488/680 h-auto w-full rounded-[4.3%/3.1%] motion-safe:transition-[filter] motion-safe:duration-400"
          :class="imageClass(card, index)"
          @load="loaded.add(index)"
        >
        <span
          v-if="priceLabel(card)"
          class="absolute bottom-2 left-1/2 origin-bottom -translate-x-1/2 scale-50 whitespace-nowrap rounded-md bg-black/80 px-2 py-0.5 text-xs font-semibold tabular-nums text-white opacity-0 group-hover:opacity-100"
        >{{ priceLabel(card) }}</span>
      </div>
    </li>
  </ul>
</template>
