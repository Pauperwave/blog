<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'

/** Parsed slot text structure */
interface ParsedCard {
  name: string
  set?: string
  collector_number?: string
}

/** Scryfall minimal card type */
interface ScryfallCard {
  id: string
  name: string
  image_uris?: {
    small?: string
    normal?: string
    large?: string
  }
}

const cardData = ref<ScryfallCard[] | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const slotText = ref<HTMLElement | null>(null)
const rawText = ref('')

/** Parse slot text into name + optional set + collector */
function parseSlotText(raw: string): ParsedCard[] {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map<ParsedCard>(line => {
      const full = line.match(/^(.+?)\s+\(([A-Za-z0-9]+)\)\s+(\d+)$/)
      if (full) {
        return {
          name: full[1]!,
          set: full[2]!.toLowerCase(),
          collector_number: full[3],
        } satisfies ParsedCard
      }

      const set = line.match(/^(.+?)\s+\(([A-Za-z0-9]+)\)$/)
      if (set) {
        return {
          name: set[1]!,
          set: set[2]!.toLowerCase(),
        } satisfies ParsedCard
      }

      return { name: line } satisfies ParsedCard
    })
}


/** Fetch a single card from Scryfall */
async function fetchCard(card: ParsedCard): Promise<ScryfallCard | null> {
  try {
    let url = ''
    if (card.set && card.collector_number) {
      url = `https://api.scryfall.com/cards/${card.set}/${card.collector_number}`
    } else if (card.set) {
      url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}&set=${card.set}`
    } else {
      url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(card.name)}`
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Carta non trovata: ${card.name}`)
    return await res.json()
  } catch (err) {
    console.warn(`Errore fetch per ${card.name}`, err)
    return null
  }
}

/** Watch slot content using MutationObserver */
onMounted(() => {
  if (!slotText.value) return

  const update = () => {
    rawText.value = slotText.value?.textContent?.trim() || ''
  }
  
  update()
  
  // const observer = new MutationObserver(update)
  // observer.observe(slotText.value, { childList: true, subtree: true, characterData: true })
})

/** Fetch Scryfall data whenever rawText changes */
watch(rawText, async (raw) => {
  const cards = parseSlotText(raw)
  if (!cards.length) {
    cardData.value = []
    return
  }

  loading.value = true
  error.value = null
  cardData.value = null

  try {
    const results = await Promise.all(cards.map(fetchCard))
    cardData.value = results.filter((c): c is ScryfallCard => Boolean(c))
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <!-- Slot che contiene i nomi delle carte -->
    <div ref="slotText" class="hidden">
      <slot mdc-unwrap="p" />
    </div>

    <!-- Stati di caricamento / errore -->
    <div v-if="loading" class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
      <div v-for="n in 6" :key="n" class="h-48 bg-gray-300 animate-pulse rounded-lg" />
    </div>
    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>

    <!-- Carte renderizzate -->
    <div v-if="cardData?.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
      <div v-for="card in cardData" :key="card.id" class="flex flex-col items-center">
        <img
          v-if="card.image_uris?.normal"
          :src="card.image_uris.normal"
          :alt="card.name"
          class="rounded-lg shadow-md hover:scale-105 transition-transform"
        >
      </div>
    </div>
    <div v-else-if="!loading" class="text-gray-500 mt-4">Nessuna carta caricata</div>
  </div>
</template>
