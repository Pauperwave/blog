<script setup lang="ts">
import { useScryfallCard } from '~/composables/useScryfallCard'
import { extractImageUrl } from '#shared/utils'

const props = defineProps<{
  cards: string[]
  caption?: string
}>()

const cardsWithData = props.cards.map(card => ({
  name: card,
  ...useScryfallCard(card)
}))

function fanRotation(index: number, total: number): number {
  if (total <= 1) return 0
  const maxAngle = Math.min(6 * (total - 1), 24)
  const step = (maxAngle * 2) / (total - 1)
  return -maxAngle + step * index
}
</script>

<template>
  <figure class="my-8">
    <div class="flex justify-center items-end flex-wrap pt-10 pb-6 px-4">
      <div
        v-for="(item, idx) in cardsWithData"
        :key="item.name"
        class="fan-card shrink-0"
        :style="{
          transform: `rotate(${fanRotation(idx, cardsWithData.length)}deg)`,
          zIndex: idx,
          marginLeft: idx === 0 ? '0' : '-3.5rem'
        }"
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
          class="w-36 md:w-44 rounded-lg shadow-lg"
        >
        <USkeleton
          v-else
          class="h-50 w-36 md:w-44 rounded-lg"
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
  transform-origin: bottom center;
  transition: transform 0.25s ease;
}

.fan-card:hover {
  transform: translateY(-24px) scale(1.08) !important;
  z-index: 999 !important;
}
</style>
