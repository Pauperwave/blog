<script setup lang="ts">
import { useScryfallCard } from '~/composables/useScryfallCard'
import { extractImageUrl } from '#shared/utils'

const props = defineProps<{
  card: string
}>()

const { cardData, loading, error } = useScryfallCard(props.card)

const imageUrl = computed(() => extractImageUrl(cardData.value, 'normal'))
</script>

<template>
  <div class="my-8">
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
      class="rounded-lg shadow-lg max-w-sm mx-auto"
    >
    <USkeleton
      v-else
      class="h-96 w-full max-w-sm mx-auto rounded-lg"
    />
  </div>
</template>
