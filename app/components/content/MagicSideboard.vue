<script setup lang="ts">
const props = defineProps<{
  matchup?: string
  description?: string
}>()

const decklistContent = ref<HTMLElement | null>(null)
const hoveredCard = ref<string | null>(null)
const showModal = ref(false)
const isMobile = ref(false)

interface CardItem {
  quantity: string
  name: string
  manaSymbols: Array<{ symbol: string, svgUri: string }>
}

const cardsIn = ref<CardItem[]>([])
const cardsOut = ref<CardItem[]>([])
const cardsOutAlt = ref<CardItem[]>([])

// Reuse your cache system
const cardDataCache = ref<Map<string, { manaCost: string, manaSymbols: Array<{ symbol: string, svgUri: string }> }>>(new Map())
const manaSymbolCache = ref<Map<string, string>>(new Map())

const hasAlternative = computed(() => cardsOutAlt.value.length > 0)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const extractCardName = (text: string): string => {
  return text.replace(/^\d+\s+/, '').trim()
}

const extractQuantity = (text: string): string => {
  const match = text.match(/^(\d+)\s+/)
  return match ? match[1]! : ''
}

const fetchManaSymbol = async (symbol: string): Promise<string> => {
  if (manaSymbolCache.value.has(symbol)) {
    return manaSymbolCache.value.get(symbol)!
  }

  try {
    const response = await fetch(`https://api.scryfall.com/symbology`)
    if (!response.ok) throw new Error('Failed to fetch symbology')

    const data = await response.json()
    /* eslint-disable @typescript-eslint/no-explicit-any */
    data.data.forEach((item: any) => {
      manaSymbolCache.value.set(item.symbol, item.svg_uri)
    })

    return manaSymbolCache.value.get(symbol) || ''
  } catch (error) {
    console.error(`Error fetching mana symbol for ${symbol}:`, error)
    return ''
  }
}

const parseManaCost = (manaCost: string): string[] => {
  if (!manaCost) return []
  return manaCost.match(/\{[^}]+\}/g) || []
}

const fetchCardData = async (cardName: string): Promise<{ manaCost: string, manaSymbols: Array<{ symbol: string, svgUri: string }> }> => {
  if (cardDataCache.value.has(cardName)) {
    return cardDataCache.value.get(cardName)!
  }

  try {
    const encodedName = encodeURIComponent(cardName)
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`)
    
    if (!response.ok) throw new Error('Card not found')

    const data = await response.json()
    const manaCost = data.mana_cost || ''
    
    const symbols = parseManaCost(manaCost)
    const manaSymbols = await Promise.all(
      symbols.map(async (symbol) => {
        const svgUri = await fetchManaSymbol(symbol)
        return { symbol, svgUri }
      })
    )

    const cardData = { manaCost, manaSymbols }
    cardDataCache.value.set(cardName, cardData)
    return cardData
  } catch (error) {
    console.error(`Error fetching card data for ${cardName}:`, error)
    return { manaCost: '', manaSymbols: [] }
  }
}

const processCards = async () => {
  if (!decklistContent.value) return

  // Fetch symbology once
  if (manaSymbolCache.value.size === 0) {
    await fetchManaSymbol('{W}')
  }

  // Process "in" cards
  const inElement = decklistContent.value.querySelector('.cards-in')
  if (inElement) {
    cardsIn.value = await extractCards(inElement)
  }

  // Process "out" cards
  const outElement = decklistContent.value.querySelector('.cards-out')
  if (outElement) {
    cardsOut.value = await extractCards(outElement)
  }

  // Process "out-alt" cards
  const outAltElement = decklistContent.value.querySelector('.cards-out-alt')
  if (outAltElement) {
    cardsOutAlt.value = await extractCards(outAltElement)
  }
}

const extractCards = async (element: Element): Promise<CardItem[]> => {
  const cards: CardItem[] = []
  
  // Try to find UL or just process all text content
  const listItems = element.querySelectorAll('li')
  
  // If no LI elements, try to parse from text content directly
  if (listItems.length === 0) {
    const textContent = element.textContent || ''
    const lines = textContent.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      
      const quantity = extractQuantity(trimmed)
      const cardName = extractCardName(trimmed)
      
      if (cardName) {
        const cardData = await fetchCardData(cardName)
        cards.push({
          quantity,
          name: cardName,
          manaSymbols: cardData.manaSymbols
        })
      }
    }
  } else {
    for (const li of listItems) {
      const fullText = li.textContent || ''
      const quantity = extractQuantity(fullText)
      const cardName = extractCardName(fullText)

      if (cardName) {
        const cardData = await fetchCardData(cardName)
        cards.push({
          quantity,
          name: cardName,
          manaSymbols: cardData.manaSymbols
        })
      }
    }
  }

  return cards
}

const handleCardHover = (cardName: string | null) => {
  hoveredCard.value = cardName
  if (isMobile.value && cardName) {
    showModal.value = true
  } else if (!cardName) {
    showModal.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  hoveredCard.value = null
}

const handleResize = () => {
  checkMobile()
}

const getCardImageUrl = (cardName: string): string => {
  const encodedName = encodeURIComponent(cardName)
  return `https://api.scryfall.com/cards/named?format=image&exact=${encodedName}`
}

const totalIn = computed(() => {
  return cardsIn.value.reduce((sum, card) => sum + parseInt(card.quantity || '0'), 0)
})

const totalOut = computed(() => {
  return cardsOut.value.reduce((sum, card) => sum + parseInt(card.quantity || '0'), 0)
})

// const totalOutAlt = computed(() => {
//   return cardsOutAlt.value.reduce((sum, card) => sum + parseInt(card.quantity || '0'), 0)
// })

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  
  setTimeout(() => {
    processCards()
  }, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <UCard
    class="sideboard-guide-wrapper mx-auto"
    :ui="{
      root: 'overflow-hidden'
    }"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h3
            v-if="props.matchup"
            class="text-lg font-semibold"
          >
            vs {{ props.matchup }}
          </h3>
          <p
            v-if="props.description"
            class="text-sm text-gray-400 mt-1"
          >
            {{ props.description }}
          </p>
        </div>
        <!-- <div class="flex items-center gap-2 text-sm text-gray-400">
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-plus" class="size-4 text-green-500" />
            <span>{{ totalIn }}</span>
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-lucide-minus" class="size-4 text-red-500" />
            <span>{{ totalOut }}</span>
          </span>
        </div> -->
      </div>
    </template>

    <template #default>
      <!-- Hidden content for parsing -->
      <div
        ref="decklistContent"
        class="hidden"
      >
        <div class="cards-in">
          <slot name="in" />
        </div>
        <div class="cards-out">
          <slot name="out" />
        </div>
        <div class="cards-out-alt">
          <slot name="out-alt" />
        </div>
      </div>

      <div class="sideboard-grid">
        <!-- Cards In (Left) -->
        <div class="cards-section in-section">
          <div class="section-header">
            <UIcon
              name="i-lucide-plus-circle"
              class="size-5 text-green-500"
            />
            <h4 class="font-semibold">Sideboard In</h4>
            <span class="card-count">({{ totalIn }})</span>
          </div>
          
          <ul class="card-list">
            <li
              v-for="(card, index) in cardsIn"
              :key="`in-${index}`"
              class="card-item in-card"
            >
              <span class="card-quantity">{{ card.quantity }}</span>
              <span class="card-name-wrapper">
                <span
                  class="card-name-link"
                  @mouseenter="!isMobile && handleCardHover(card.name)"
                  @mouseleave="!isMobile && handleCardHover(null)"
                  @click="isMobile && (hoveredCard === card.name && showModal ? closeModal() : handleCardHover(card.name))"
                >
                  {{ card.name }}
                </span>
              </span>
              <span class="card-mana-cost">
                <img
                  v-for="(symbol, idx) in card.manaSymbols"
                  :key="idx"
                  :src="symbol.svgUri"
                  class="mana-symbol"
                  alt="Mana symbol"
                >
              </span>
            </li>
          </ul>
        </div>

        <!-- Cards Out (Middle) -->
        <div class="cards-section out-section">
          <div class="section-header">
            <UIcon
              name="i-lucide-minus-circle"
              class="size-5 text-red-500"
            />
            <h4 class="font-semibold">Sideboard Out</h4>
            <span class="card-count">({{ totalOut }})</span>
          </div>
          
          <ul class="card-list">
            <li
              v-for="(card, index) in cardsOut"
              :key="`out-${index}`"
              class="card-item out-card"
            >
              <span class="card-quantity">{{ card.quantity }}</span>
              <span class="card-name-wrapper">
                <span
                  class="card-name-link"
                  @mouseenter="!isMobile && handleCardHover(card.name)"
                  @mouseleave="!isMobile && handleCardHover(null)"
                  @click="isMobile && (hoveredCard === card.name && showModal ? closeModal() : handleCardHover(card.name))"
                >
                  {{ card.name }}
                </span>
              </span>
              <span class="card-mana-cost">
                <img
                  v-for="(symbol, idx) in card.manaSymbols"
                  :key="idx"
                  :src="symbol.svgUri"
                  class="mana-symbol"
                  alt="Mana symbol"
                >
              </span>
            </li>
          </ul>

          <!-- Alternative section -->
          <template v-if="hasAlternative">
            <div class="alternative-divider">
              <span class="alternative-label">Alternativa</span>
            </div>
            
            <ul class="card-list">
              <li
                v-for="(card, index) in cardsOutAlt"
                :key="`out-alt-${index}`"
                class="card-item out-card"
              >
                <span class="card-quantity">{{ card.quantity }}</span>
                <span class="card-name-wrapper">
                  <span
                    class="card-name-link"
                    @mouseenter="!isMobile && handleCardHover(card.name)"
                    @mouseleave="!isMobile && handleCardHover(null)"
                    @click="isMobile && (hoveredCard === card.name && showModal ? closeModal() : handleCardHover(card.name))"
                  >
                    {{ card.name }}
                  </span>
                </span>
                <span class="card-mana-cost">
                  <img
                    v-for="(symbol, idx) in card.manaSymbols"
                    :key="idx"
                    :src="symbol.svgUri"
                    class="mana-symbol"
                    alt="Mana symbol"
                  >
                </span>
              </li>
            </ul>
          </template>
        </div>

        <!-- Card Preview (Right) -->
        <div class="card-preview bg-amber-950/10 rounded sticky">
          <div
            v-if="hoveredCard"
            class="preview-content"
          >
            <div class="card-image-container">
              <img
                :src="getCardImageUrl(hoveredCard)"
                :alt="hoveredCard"
                class="card-image rounded-lg shadow-lg w-full"
                @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22%3E%3Crect width=%22200%22 height=%22280%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'"
              >
            </div>
          </div>
          <div
            v-else
            class="text-gray-600 text-center text-sm py-8"
          >
            <UIcon
              name="i-lucide-image"
              class="w-16 h-16 mx-auto mb-2 opacity-50"
            />
            <p>Passa il mouse sopra una carta per visualizzarla</p>
          </div>
        </div>
      </div>
    </template>
  </UCard>

  <!-- Mobile Modal -->
  <UModal
    v-model:open="showModal"
    :ui="{
      content: 'bg-transparent shadow-none ring-0',
      overlay: 'bg-black/80'
    }"
  >
    <template #content>
      <div
        v-if="hoveredCard"
        class="flex items-center justify-center"
      >
        <img
          :src="getCardImageUrl(hoveredCard)"
          :alt="hoveredCard"
          class="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
          @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22%3E%3Crect width=%22200%22 height=%22280%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'"
        >
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.sideboard-guide-wrapper {
  max-width: 1000px;
}

.sideboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  min-height: 300px;
}

.cards-section {
  padding: .5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid;
}

.in-section .section-header {
  border-bottom-color: rgb(34 197 94 / 0.3);
}

.out-section .section-header {
  border-bottom-color: rgb(239 68 68 / 0.3);
}

.section-header h4 {
  font-size: 1rem;
}

.card-count {
  font-weight: 500;
  opacity: 0.7;
  margin-left: auto;
}

.alternative-divider {
  position: relative;
  margin: 1.5rem 0;
  text-align: center;
  height: 1px;
  background: rgb(239 68 68 / 0.3);
}

.alternative-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 0.75rem;
  background: var(--ui-bg); /* Adjust this to match your card background color */
  color: rgb(239 68 68);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.card-item {
  display: grid;
  grid-template-columns: auto 1fr 60px;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 0.375rem;
  line-height: 1.4;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background-color 150ms;
}

.in-card {
  background-color: rgb(34 197 94 / 0.05);
  border-left: 3px solid rgb(34 197 94 / 0.4);
}

.in-card:hover {
  background-color: rgb(34 197 94 / 0.1);
}

.out-card {
  background-color: rgb(239 68 68 / 0.05);
  border-left: 3px solid rgb(239 68 68 / 0.4);
}

.out-card:hover {
  background-color: rgb(239 68 68 / 0.1);
}

.card-quantity {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  font-weight: 600;
}

.card-name-link {
  cursor: pointer;
  color: #4714ff;
  text-decoration: underline;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.card-mana-cost {
  display: flex;
  gap: 2px;
  align-items: center;
  width: 60px;
  flex-wrap: wrap;
}

.mana-symbol {
  width: 15px;
  height: 15px;
  display: inline-block;
  flex-shrink: 0;
}

.card-preview {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 1rem;
}

.card-image {
  max-width: 100%;
  height: auto;
  display: block;
}

@media (max-width: 768px) {
  .sideboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .card-preview {
    display: none;
  }
}
</style>
