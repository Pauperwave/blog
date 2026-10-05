<script setup lang="ts">
// Opaque and self-contained (no controls inside) so it can be rendered to an image. Keep a single
// root element with no comment before it, or $el stops being that element and the export fails.
// Fixed width: header and footer sit exactly on the margins of the deck (main deck + sideboard)
import type { DecklistHeaderInfo, DecklistSwipeCard } from '~/composables/useDecklistContext'
import type { DeckStats } from '~/utils/deck-stats'
import DecklistArt from './DecklistArt.vue'
import DecklistColorBars from './DecklistColorBars.vue'
import DecklistCurveChart from './DecklistCurveChart.vue'
import DecklistPile from './DecklistPile.vue'
import DecklistTypeCounts from './DecklistTypeCounts.vue'

const { header, cards } = defineProps<{
  header: DecklistHeaderInfo
  cards: DecklistSwipeCard[]
  stats: DeckStats
}>()

const PILE_SIZE = 4

// Every copy is its own card, in list order (MTGGoldfish visual deck style)
const copiesOf = (list: DecklistSwipeCard[]) =>
  list.flatMap(card => Array.from({ length: card.quantity }, () => card))

// Main deck: piles of 4 copies. Sideboard: a single pile.
const mainPiles = computed(() => chunk(copiesOf(cards.filter(card => card.section !== 'Sideboard')), PILE_SIZE))
const sideboardCopies = computed(() => copiesOf(cards.filter(card => card.section === 'Sideboard')))

// Representative card art, taken from the deck's own card images (no extra requests)
const artCard = computed(() => pickDeckArtCard(cards))

const typeCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const card of cards) {
    if (card.section === 'Sideboard') continue
    counts.set(card.section, (counts.get(card.section) ?? 0) + card.quantity)
  }
  return [...counts].map(([section, count]) => ({ section, count }))
})
</script>

<template>
  <div class="flex w-[68rem] flex-col gap-6 bg-default p-6">
    <header class="relative flex items-stretch justify-between gap-x-10 overflow-hidden rounded-xl border border-default bg-elevated px-6 py-5 shadow-sm">
      <DecklistArt
        v-if="artCard"
        :src="toArtCropUrl(artCard.imageUrl)"
        :card="artCard.name"
      />
      <div class="relative flex flex-col justify-between gap-5">
        <div class="flex flex-col gap-1.5">
          <h2 class="m-0 text-5xl font-light leading-none tracking-tight">
            {{ header.name }}
          </h2>
          <p class="m-0 text-xl font-semibold text-muted">
            {{ header.player }}
            <span v-if="header.placement"> · {{ header.placement }}</span>
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-x-8 gap-y-2">
          <DecklistColorBars :pips="stats.pips" />
          <DecklistTypeCounts :counts="typeCounts" />
        </div>
      </div>
      <DecklistCurveChart :curve="stats.curve" class="relative h-28 shrink-0 self-end rounded-lg bg-default/70 px-4 py-3" />
    </header>

    <!-- Card width is 9rem everywhere: main deck columns and sideboard (9rem + 1.5rem left/right offset) -->
    <div class="flex items-stretch justify-between gap-8">
      <!-- 60 cards: 15 piles of 4 in a 5x3 grid -->
      <div class="grid shrink-0 grid-cols-[repeat(5,9rem)] items-start gap-x-4 gap-y-6">
        <DecklistPile
          v-for="(pile, pileIndex) in mainPiles"
          :key="pileIndex"
          :cards="pile"
        />
      </div>

      <section v-if="sideboardCopies.length" class="flex shrink-0 gap-4">
        <span class="self-center rotate-180 text-3xl font-extrabold tracking-[0.3em] [writing-mode:vertical-rl]">
          SIDEBOARD
        </span>
        <!-- Cards spread over the main deck's height, so both end on the same bottom edge -->
        <div class="relative min-h-[37rem] w-42">
          <DecklistPile :cards="sideboardCopies" spread />
        </div>
      </section>
    </div>

    <footer class="flex items-end justify-between gap-6">
      <MagicCopyright />
      <div class="flex shrink-0 items-center gap-2">
        <img src="/favicon.ico" alt="" class="size-8">
        <span class="text-lg font-bold">Pauperwave</span>
      </div>
    </footer>
  </div>
</template>
