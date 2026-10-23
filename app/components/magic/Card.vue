<script setup lang="ts">
import { parseCardString } from '#shared/utils'

const {
  card, image = null, imgClass = 'max-w-sm mx-auto'
} = defineProps<{
  card: string
  /** The grid image URL, added at build time by the card-component-transformer */
  image?: string | null
  /** Tailwind width classes for the card image. */
  imgClass?: string
}>()
</script>

<template>
  <div>
    <UAlert
      v-if="!image"
      color="error"
      variant="soft"
      title="Card not found"
      :description="`Could not find card: ${card}`"
      icon="i-lucide-alert-circle"
    />
    <img
      v-else
      :src="image"
      :alt="parseCardString(card).name"
      loading="lazy"
      :class="[imgClass, 'rounded-lg shadow-lg']"
      style="aspect-ratio: 265 / 370"
    >
  </div>
</template>
