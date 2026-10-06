<script setup lang="ts">
// Sizes come from CSS variables set by DecklistGraphic: --card-strip (visible title strip) and --card-offset (sideboard stagger)
const { cards, spread = false } = defineProps<{
  cards: { name: string; imageUrl: string }[]
  /** Fill the parent's height with full cards, alternating left and right, first at the top and last at the bottom */
  spread?: boolean
}>()

// Indexes of the images already loaded; the others show a skeleton
const loaded = reactive(new Set<number>())

const spreadStyle =(index: number) => {
  const fraction = cards.length > 1 ? (index / (cards.length - 1)) * 100 : 0
  return { top: `${fraction}%`, transform: `translateY(-${fraction}%)` }
}
</script>

<template>
  <!-- Stack: every card but the last is clipped to its title strip, hover reveals it fully -->
  <ul
    class="m-0 list-none p-0"
    :class="{ 'absolute inset-0': spread }"
  >
    <li
      v-for="(card, index) in cards"
      :key="index"
      class="group m-0 p-0"
      :class="spread
        ? ['absolute inset-x-0 hover:z-10', index % 2 === 0 ? 'pe-(--card-offset)' : 'ps-(--card-offset)']
        : 'relative h-(--card-strip) overflow-hidden last:h-auto last:overflow-visible hover:z-10 hover:overflow-visible'"
      :style="spread ? spreadStyle(index) : undefined"
    >
      <!-- Radius in % keeps the tooltip's corner proportions (12px on a 280px card) at any size, zoom included -->
      <!-- pointer-events-none: the zoomed image doesn't capture hover, so neighbouring cards stay reachable -->
      <!-- In flow with the same box as the image, so it matches the card exactly; the hidden image still loads -->
      <USkeleton
        v-if="!loaded.has(index)"
        class="pointer-events-none block aspect-[488/680] h-auto w-full rounded-[4.3%/3.1%]"
      />
      <img
        :src="card.imageUrl"
        :alt="card.name"
        crossorigin="anonymous"
        class="pointer-events-none aspect-[488/680] h-auto w-full rounded-[4.3%/3.1%] motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:scale-200"
        :class="loaded.has(index) ? 'block' : 'hidden'"
        @load="loaded.add(index)"
      >
    </li>
  </ul>
</template>
