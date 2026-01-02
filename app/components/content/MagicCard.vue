<script lang="ts" setup>
// import { ref, watch, onMounted } from 'vue'

/** Parsed slot text structure */
interface ParsedCard {
  name: string
  set?: string
  collector?: string
}

const cardData = ref<any | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const cardName = ref('')

const slotText = ref<HTMLElement | null>(null)

/** Parse slot text into name + optional set + collector */
function parseSlotText(raw: string): ParsedCard {
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

/** Initialize MutationObserver to watch slot content */
onMounted(() => {
  const updateName = () => {
    cardName.value = slotText.value?.textContent?.trim() || ''
  }

  updateName()

  if (slotText.value) {
    const observer = new MutationObserver(updateName)
    observer.observe(slotText.value, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }
})

/** Fetch card info when cardName changes */
watch(cardName, async (raw) => {
  const parsed = parseSlotText(raw)
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
      // Case: name only → /cards/named?exact=...
      url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(parsed.name)}`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Carta non trovata')

    cardData.value = await response.json()
  } catch (e) {
    cardData.value = null
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div
    class="p-2 max-w-sm rounded flex flex-col items-center"
  >
    <!-- Slot text wrapper for MutationObserver -->
    <span
      ref="slotText"
      class="hidden"
    >
      <slot />
    </span>

    <!-- States -->
    <div
      v-if="loading"
      class="mt-2 text-gray-500 text-sm"
    >
      Caricamento...
    </div>

    <div
      v-else-if="error"
      class="mt-2 text-red-600 text-sm"
    >
      {{ error }}
    </div>

    <div
      v-else-if="cardData"
      class="mt-2 text-center"
    >
      <img
        v-if="cardData.image_uris?.normal"
        :src="cardData.image_uris.normal"
        :alt="cardData.name"
        class="mt-2 rounded shadow-lg max-w-xs"
      >
    </div>
  </div>
</template>
