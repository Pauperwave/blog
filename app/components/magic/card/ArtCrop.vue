<script setup lang="ts">
import { parseCardString } from '#shared/utils'

const {
  card, image = null, caption = '', crop = undefined
} = defineProps<{
  card: string
  /** The art image URL, added at build time by the card-component-transformer */
  image?: string | null
  caption?: string
  crop?: {
    height?: 'small' | 'medium' | 'large' | 'xl'
    position?: 'top' | 'center' | 'bottom'
  }
}>()

const heightClass = computed(() => {
  if (!crop) return '' // No fixed height - show full art crop

  const heights = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64',
    xl: 'h-96'
  }
  return heights[crop.height || 'medium']
})

const positionClass = computed(() => {
  if (!crop) return '' // No object positioning needed

  const positions = {
    top: 'object-top',
    center: 'object-center',
    bottom: 'object-bottom'
  }
  return positions[crop.position || 'center']
})

const imageClasses = computed(() => {
  const classes = ['w-full', 'rounded-xl']

  if (crop) {
    classes.push('object-cover', heightClass.value, positionClass.value)
  } else {
    // Scryfall's art is 626x457: reserves the space before the image loads
    classes.push('aspect-626/457')
  }

  return classes.filter(Boolean).join(' ')
})

</script>

<template>
  <div class="my-8">
    <UAlert
      v-if="!image"
      color="error"
      variant="soft"
      title="Card not found"
      :description="`Could not find card: ${card}`"
      icon="i-lucide-alert-circle"
    />
    <figure
      v-else
      class="space-y-2"
    >
      <img
        :src="image"
        :alt="caption || parseCardString(card).name"
        :class="imageClasses"
        loading="lazy"
      >
      <figcaption
        v-if="caption"
        class="text-sm text-center text-gray-600 dark:text-gray-400"
      >
        {{ caption }}
      </figcaption>
    </figure>
  </div>
</template>
