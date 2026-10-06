<script setup lang="ts">
// Opaque and self-contained (no controls inside) so it can be rendered to an image. Keep a single
// root element with no comment before it, or $el stops being that element and the export fails.
// Fixed width: header and footer sit exactly on the margins of the deck (main deck + sideboard).
// Card sizes come from the CSS variables on the root, also read by DecklistPile:
// --card-w card width, --card-offset sideboard left/right stagger,
// --card-strip visible title strip of a piled card
// Root width: 6 cards (5 columns + sideboard) + sideboard offset
// + 12.5rem of padding, gaps and the vertical label
import { SIDEBOARD_SECTION } from '#shared/utils'
import type { DecklistHeaderInfo } from '~/composables/useDecklistContext'
import { expandCopies, type DeckCard } from '~/utils/deck-cards'
import type { DeckStats } from '~/utils/deck-stats'
import DecklistArt from './DecklistArt.vue'
import DecklistColorBars from './DecklistColorBars.vue'
import DecklistCurveChart from './DecklistCurveChart.vue'
import DecklistPile from './DecklistPile.vue'
import DecklistTypeCounts from './DecklistTypeCounts.vue'

const { header, cards } = defineProps<{
  header: DecklistHeaderInfo
  cards: DeckCard[]
  stats: DeckStats
}>()

const PILE_SIZE = 4

// Every copy is its own card, in list order (MTGGoldfish visual deck style).
// Main deck: piles of 4 copies. Sideboard: a single pile.
const mainPiles = computed(() =>
  chunk(expandCopies(cards.filter(card => card.section !== SIDEBOARD_SECTION)), PILE_SIZE)
)
const sideboardCopies = computed(() =>
  expandCopies(cards.filter(card => card.section === SIDEBOARD_SECTION))
)

const {
  highlight,
  highlightedColor,
  highlightedBucket,
  highlightedSection,
  onColorHover,
  onTypeHover,
  onCurveHover
} = useDeckHighlight()

// Representative card art, taken from the deck's own card images (no extra requests)
const artCard = computed(() => pickDeckArtCard(cards))
</script>

<template>
  <div class="flex w-[calc(var(--card-w)*6+var(--card-offset)+12.5rem)] flex-col gap-6 bg-default p-6 [--card-offset:1.5rem] [--card-strip:2.25rem] [--card-w:9rem]">
    <header class="relative flex items-stretch justify-between gap-x-6 overflow-hidden rounded-xl border border-default bg-elevated px-6 py-5 shadow-sm">
      <DecklistArt
        v-if="artCard"
        :src="toArtCropUrl(artCard.imageUrl)"
        :card="artCard.name"
      />
      <div class="relative flex flex-col justify-between gap-5">
        <!-- Player next to the title; a long title pushes it to the next line -->
        <div class="flex flex-wrap items-baseline gap-x-5 gap-y-1.5">
          <h2 class="m-0 text-5xl font-light leading-none tracking-tight">
            {{ header.name }}
          </h2>
          <p class="m-0 text-xl font-semibold text-muted">
            {{ header.player }}
            <span v-if="header.placement"> · {{ header.placement }}</span>
          </p>
        </div>
        <div class="flex items-center gap-x-6">
          <DecklistColorBars
            :pips="stats.pips"
            :highlight-color="highlightedColor"
            @hover="onColorHover"
          />
          <DecklistTypeCounts
            :counts="stats.typeCounts"
            :highlight-section="highlightedSection"
            @hover="onTypeHover"
          />
        </div>
      </div>
      <DecklistCurveChart
        :curve="stats.curve"
        :average="stats.averageManaValue"
        :highlight-bucket="highlightedBucket"
        :highlight-color="highlightedColor"
        @hover="onCurveHover"
        class="relative h-28 min-w-64 flex-1 self-end rounded-lg bg-default/70 px-3 py-3"
      />
    </header>

    <div class="flex items-stretch justify-between gap-8">
      <!-- 60 cards: 15 piles of 4 in a 5x3 grid -->
      <div class="grid shrink-0 grid-cols-[repeat(5,var(--card-w))] items-start gap-x-4 gap-y-6">
        <DecklistPile
          v-for="(pile, pileIndex) in mainPiles"
          :key="pileIndex"
          :cards="pile"
          :highlight="highlight"
        />
      </div>

      <section v-if="sideboardCopies.length" class="flex shrink-0 gap-4">
        <span class="self-center rotate-180 text-3xl font-extrabold tracking-[0.3em] [writing-mode:vertical-rl]">
          SIDEBOARD
        </span>
        <!-- Cards spread over the main deck's height, so both end on the same bottom edge -->
        <div class="relative min-h-148 w-[calc(var(--card-w)+var(--card-offset))]">
          <DecklistPile :cards="sideboardCopies" :highlight="highlight" spread />
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
