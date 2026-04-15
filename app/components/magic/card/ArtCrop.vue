<script setup lang="ts">
import { useScryfallCard } from '~/composables/useScryfallCard'
import { extractImageUrl } from '#shared/utils'

const props = defineProps<{
  card: string
  caption?: string
  crop?: {
    height?: 'small' | 'medium' | 'large' | 'xl'
    position?: 'top' | 'center' | 'bottom'
  }
}>()

const { cardData, loading, error } = useScryfallCard(props.card)

const artCropUrl = computed(() => extractImageUrl(cardData.value, 'art_crop'))

const heightClass = computed(() => {
  if (!props.crop) return '' // No fixed height - show full art crop

  const heights = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64',
    xl: 'h-96'
  }
  return heights[props.crop.height || 'medium']
})

const positionClass = computed(() => {
  if (!props.crop) return '' // No object positioning needed

  const positions = {
    top: 'object-top',
    center: 'object-center',
    bottom: 'object-bottom'
  }
  return positions[props.crop.position || 'center']
})

const imageClasses = computed(() => {
  const classes = ['w-full', 'rounded-xl']

  if (props.crop) {
    classes.push('object-cover', heightClass.value, positionClass.value)
  }

  return classes.filter(Boolean).join(' ')
})

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
    <figure
      v-else-if="artCropUrl && !loading"
      class="space-y-2"
    >
      <img
        :src="artCropUrl"
        :alt="caption || cardData?.name"
        :class="imageClasses"
      >
      <figcaption
        v-if="caption"
        class="text-sm text-center text-gray-600 dark:text-gray-400"
      >
        {{ caption }}
      </figcaption>
    </figure>
    <USkeleton
      v-else
      class="w-full rounded-xl aspect-5/3"
      :class="heightClass"
    />
  </div>
</template>
