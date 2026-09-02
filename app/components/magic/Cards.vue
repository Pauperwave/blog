<script setup lang="ts">
import { cardTransform, cardFilter } from '~/utils/magic-cards-layout'

interface Props {
  cards: string[]
  caption?: string
  /** Total rotation arch in degrees, matches magic.wizards.com's `overall-arch` (default: 20.5). Fan-only. */
  arch?: number
  /** Layout style, matches magic.wizards.com's `config` values: 'fan' (default) or 'hand'. Below the `md`
   * breakpoint this is ignored — cards always fall back to a plain scroll strip (WotC's own component does
   * the same: the swiper/gallery swap on mobile isn't a selectable config, it's automatic infrastructure). */
  layout?: 'fan' | 'hand'
}

const {
  cards,
  caption = '',
  arch = 20.5,
  layout = 'fan'
} = defineProps<Props>()

const MAX_CARDS = 7

if (cards.length > MAX_CARDS) {
  console.warn(`magic-cards: received ${cards.length} cards, showing only the first ${MAX_CARDS}`)
}

const visibleCards = computed(() => cards.slice(0, MAX_CARDS))

const hoveredIndex = ref<number | null>(null)
</script>

<template>
  <figure class="my-8">
    <!-- Below md: plain horizontal scroll strip — not a selectable layout, just the
    responsive fallback (rotated/spread cards don't work on narrow viewports), matching
    how magic.wizards.com's own component swaps to a swiper below its mobile breakpoint
    regardless of which config the page author chose. -->
    <div class="md:hidden flex gap-4 overflow-x-auto justify-center mask-[linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <MagicCard
        v-for="card in visibleCards"
        :key="card"
        :card="card"
        class="shrink-0"
      />
    </div>

    <!-- md and up: fan/hand arrangement. Cards are all absolutely stacked at the exact
    same center position (no margin/flex-based overlap) — the spread comes purely from
    positioning each one relative to a shared pivot, matching how magic.wizards.com's
    fan actually works (verified: every card's un-rotated `left` is identical there).
    magic-cards wraps N magic-card instances, same relationship as WotC's real
    <magic-cards>/<magic-card> elements — MagicCard (our "magic-card") owns the
    actual card resolution/rendering, this component only owns positioning. -->
    <div
      class="fan-container hidden md:block relative px-4 pb-6"
      :class="layout === 'hand' ? 'min-h-125 lg:min-h-150' : 'min-h-75 lg:min-h-90'"
    >
      <div
        v-for="(card, idx) in visibleCards"
        :key="card"
        class="absolute left-1/2 top-6 -translate-x-1/2"
        :style="{ zIndex: hoveredIndex === idx ? visibleCards.length : idx }"
      >
        <MagicCard
          :card="card"
          img-class="w-48 lg:w-56"
          class="fan-card"
          :style="{
            transform: cardTransform(idx, visibleCards.length, layout, arch, hoveredIndex),
            filter: cardFilter(idx, hoveredIndex)
          }"
          @mouseenter="hoveredIndex = idx"
          @mouseleave="hoveredIndex = null"
        />
      </div>
    </div>
    <figcaption
      v-if="caption"
      class="text-sm text-muted text-center py-2"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.fan-card {
  /* Shared distant pivot (~5.83x the card's own height below it), matching the
     magic.wizards.com fan's transform-origin: 50% 2168.18px on a 372px-tall card. */
  transform-origin: 50% 582.84%;
  transition:
    transform 0.4s ease,
    filter 0.4s ease;
}
</style>
