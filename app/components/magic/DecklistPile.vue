<script setup lang="ts">
// Sizes come from CSS variables set by DecklistGraphic: --card-strip (visible title strip) and --card-offset (sideboard stagger)
const { cards, spread = false } = defineProps<{
  cards: { name: string; imageUrl: string }[]
  /** Fill the parent's height with full cards, alternating left and right, first at the top and last at the bottom */
  spread?: boolean
}>()

const spreadStyle = (index: number) => {
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
      <img
        :src="card.imageUrl"
        :alt="card.name"
        crossorigin="anonymous"
        class="block aspect-[488/680] h-auto w-full rounded-xl motion-safe:transition-transform motion-safe:duration-150 motion-safe:group-hover:scale-200"
      >
    </li>
  </ul>
</template>
