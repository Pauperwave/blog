<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface ScryfallCard {
  name: string
  image_uris?: {
    art_crop: string
  }
  card_faces?: Array<{
    image_uris?: {
      art_crop: string
    }
  }>
}

interface ParsedCard {
  name: string
  set?: string
  collector?: string
}

const props = defineProps<{
  card: string
  caption?: string
  crop?: {
    height?: 'small' | 'medium' | 'large' | 'xl'
    position?: 'top' | 'center' | 'bottom'
  }
}>()

const cardData = ref<ScryfallCard | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

/** Parse card string into name + optional set + collector */
function parseCardString(raw: string): ParsedCard {
  // Case: Card name + set + collector → "Name (SET) 123"
  const regexFull = /^(.+?)\s+\(([A-Za-z0-9]+)\)\s+(\d+)$/
  const matchFull = raw.trim().match(regexFull)
  if (matchFull) {
    return {
      name: matchFull[1]!.trim(),
      set: matchFull[2],
      collector: matchFull[3]
    }
  }

  // Case: Card name + set → "Name (SET)"
  const regexSet = /^(.+?)\s+\(([A-Za-z0-9]+)\)$/
  const matchSet = raw.trim().match(regexSet)
  if (matchSet) {
    return {
      name: matchSet[1]!.trim(),
      set: matchSet[2]
    }
  }

  // Case: Just name
  return { name: raw.trim() }
}

const parsedCard = computed(() => parseCardString(props.card))

const artCropUrl = computed(() => {
  if (!cardData.value) return null

  // Single-faced card
  if (cardData.value.image_uris?.art_crop) {
    return cardData.value.image_uris.art_crop
  }

  // Double-faced card (use first face)
  if (cardData.value.card_faces?.[0]?.image_uris?.art_crop) {
    return cardData.value.card_faces[0].image_uris.art_crop
  }

  return null
})

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

/** Fetch card info when card prop changes */
watch(() => props.card, async () => {
  const parsed = parsedCard.value

  if (!parsed.name) {
    cardData.value = null
    error.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    let url = ''

    if (parsed.set && parsed.collector) {
      // Case: set + collector → /cards/{set}/{collector}
      url = `https://api.scryfall.com/cards/${parsed.set}/${parsed.collector}`
    } else if (parsed.set) {
      // Case: set only → /cards/named?fuzzy=...&set=...
      url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(parsed.name)}&set=${parsed.set}`
    } else {
      // Case: name only → /cards/named?fuzzy=...
      url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(parsed.name)}`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Card not found')

    cardData.value = await response.json()
  } catch (e) {
    cardData.value = null
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}, { immediate: true })
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