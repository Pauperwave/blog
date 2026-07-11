<script setup lang="ts">
import { useScryfallCard } from '~/composables/useScryfallCard'
import { extractImageUrl } from '#shared/utils'

interface Props {
  card: string
  /** Tailwind width classes for the card image and its loading skeleton. */
  imgClass?: string
}

const {
  card,
  imgClass = 'max-w-sm mx-auto'
} = defineProps<Props>()

const { cardData, loading, error } = useScryfallCard(card)

const imageUrl = computed(() => extractImageUrl(cardData.value, 'normal'))
</script>

<template>
  <div>
    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Card not found"
      :description="`Could not find card: ${card}`"
      icon="i-lucide-alert-circle"
    />
    <img
      v-else-if="imageUrl && !loading"
      :src="imageUrl"
      :alt="cardData?.name"
      :class="[imgClass, 'rounded-lg shadow-lg']"
      style="aspect-ratio: 265 / 370"
    >
    <USkeleton
      v-else
      :class="[imgClass, 'rounded-lg']"
      style="aspect-ratio: 265 / 370"
    />
  </div>
</template>
