<script setup lang="ts">
import { useScryfallCard } from '~/composables/useScryfallCard'
import { extractImageUrl } from '#shared/utils'

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

const { cards, caption = '', arch = 20.5, layout = 'fan' } = defineProps<Props>()

const cardsWithData = cards.map(card => ({
  name: card,
  ...useScryfallCard(card)
}))

// Mirrors magic.wizards.com/en/news/making-magic's fan component: the step between
// adjacent cards is arch/count (not arch/(count-1)), so the total spread converges
// toward `arch` as more cards are added instead of growing past it.
function fanRotation(index: number, total: number): number {
  if (total <= 1) return 0
  const step = arch / total
  const center = (total - 1) / 2
  return (index - center) * step
}

// Hover behavior captured directly from magic.wizards.com/en/news/making-magic's live
// fan component (computed styles inspected across three hovered indices — leftmost,
// center, rightmost — while hovering). Every observed value derives from one constant,
// SPREAD = 0.15: cards stacked UNDER the hovered one (index <= hoveredIndex, since a
// later DOM index paints on top) get a mild uniform rotation amplification; cards
// stacked ON TOP of it (index > hoveredIndex) have to visibly move aside to reveal it,
// so they rotate further out and shift right by SPREAD (15% of their own width). The
// hovered card itself follows the "under" formula too, plus a -18px lift.
const SPREAD = 0.15
const hoveredIndex = ref<number | null>(null)

function cardFilter(index: number): string {
  if (hoveredIndex.value === null || hoveredIndex.value === index) return 'none'
  const distance = Math.abs(index - hoveredIndex.value)
  const brightness = 1.12 - 0.08 * distance
  return `blur(0.5px) grayscale(0.8) brightness(${brightness})`
}

// "Hand" config — spotted in the shared magic-cards stylesheet (it's loaded on any page
// with a magic-cards instance, fan or otherwise, since the library bundles every layout
// variant together) while investigating the fan. Unlike fan, cards don't rotate: they
// spread horizontally in steps of 60% of their own width from center, and rise into a
// shallow arc — the center card sits lowest/frontmost, edges recede upward. Only two of
// five slots were captured live before this session moved on (index 0 of 5:
// translateX(-120%) translateY(25%); index 1: translateX(-60%) translateY(45%), and its
// :hover state translateY(15%)). The rest here is extrapolated from that pattern (linear
// 60%-per-step X, symmetric triangular Y arc, -10pp lift on hover) — NOT independently
// re-verified against the live page, and the step values are only confirmed for a 5-card
// hand specifically.
const HAND_X_STEP = 60
const HAND_PEAK_Y = 65
const HAND_Y_STEP = 20

function handPosition(index: number, total: number): { x: number, y: number } {
  const center = (total - 1) / 2
  const offset = index - center
  return {
    x: offset * HAND_X_STEP,
    y: HAND_PEAK_Y - HAND_Y_STEP * Math.abs(offset)
  }
}

function cardTransform(index: number, total: number): string {
  if (layout === 'hand') {
    const { x, y } = handPosition(index, total)
    const lift = hoveredIndex.value === index ? y - 10 : y
    return `translateX(${x}%) translateY(${lift}%)`
  }

  const base = fanRotation(index, total)
  const h = hoveredIndex.value

  if (h === null) return `rotate(${base}deg)`

  const scaled = base * (1 + SPREAD / 2)

  if (index <= h) {
    const lift = index === h ? -18 : 0
    return `rotate(${scaled}deg) translateY(${lift}px)`
  }

  const k = index - h
  const extra = SPREAD * total * (total - 1 - k)
  return `rotate(${scaled + extra}deg) translateX(${SPREAD * 100}%)`
}
</script>

<template>
  <figure class="my-8">
    <!-- Below md: plain horizontal scroll strip — not a selectable layout, just the
    responsive fallback (rotated/spread cards don't work on narrow viewports), matching
    how magic.wizards.com's own component swaps to a swiper below its mobile breakpoint
    regardless of which config the page author chose. -->
    <div class="md:hidden flex gap-4 overflow-x-auto justify-center mask-[linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <MagicCardDisplay
        v-for="card in cards"
        :key="card"
        :card="card"
        class="shrink-0"
      />
    </div>

    <!-- md and up: fan/hand arrangement. Cards are all absolutely stacked at the exact
    same center position (no margin/flex-based overlap) — the spread comes purely from
    positioning each one relative to a shared pivot, matching how magic.wizards.com's
    fan actually works (verified: every card's un-rotated `left` is identical there). -->
    <div
      class="fan-container hidden md:block relative px-4 pb-6"
      :class="layout === 'hand' ? 'min-h-125 lg:min-h-150' : 'min-h-75 lg:min-h-90'"
    >
      <div
        v-for="(item, idx) in cardsWithData"
        :key="item.name"
        class="absolute left-1/2 top-6 -translate-x-1/2"
        :style="{ zIndex: idx }"
      >
        <div
          class="fan-card"
          :style="{
            transform: cardTransform(idx, cardsWithData.length),
            filter: cardFilter(idx)
          }"
          @mouseenter="hoveredIndex = idx"
          @mouseleave="hoveredIndex = null"
        >
          <UAlert
            v-if="item.error.value"
            color="error"
            variant="soft"
            title="Card not found"
            :description="`Could not find card: ${item.name}`"
            icon="i-lucide-alert-circle"
          />
          <img
            v-else-if="extractImageUrl(item.cardData.value, 'normal') && !item.loading.value"
            :src="extractImageUrl(item.cardData.value, 'normal')!"
            :alt="item.cardData.value?.name"
            class="w-48 lg:w-56 rounded-lg shadow-lg"
            style="aspect-ratio: 265 / 370"
          >
          <USkeleton
            v-else
            class="w-48 lg:w-56 rounded-lg"
            style="aspect-ratio: 265 / 370"
          />
        </div>
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
