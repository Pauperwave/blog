<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface ScryfallCard {
  name: string
  image_uris?: {
    normal: string
  }
  card_faces?: Array<{
    image_uris?: {
      normal: string
    }
  }>
}

interface ParsedCard {
  name: string
  set?: string
  collector_number?: string
}

const props = defineProps<{
  card: string
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
      collector_number: matchFull[3]
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

const imageUrl = computed(() => {
  if (!cardData.value) return null

  // Single-faced card
  if (cardData.value.image_uris?.normal) {
    return cardData.value.image_uris.normal
  }

  // Double-faced card (use first face)
  if (cardData.value.card_faces?.[0]?.image_uris?.normal) {
    return cardData.value.card_faces[0].image_uris.normal
  }

  return null
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

    if (parsed.set && parsed.collector_number) {
      // Case: set + collector → /cards/{set}/{collector}
      url = `https://api.scryfall.com/cards/${parsed.set}/${parsed.collector_number}`
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