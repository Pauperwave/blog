<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  name: string
  author?: string
  position?: string
  description?: string
}>()

const title = computed(() => {
  return props.position ? `${props.name} — ${props.position}` : props.name
})

const hoveredCard = ref<string | null>(null)
const decklistContent = ref<HTMLElement | null>(null)
const showModal = ref(false)
const isMobile = ref(false)

// Store processed card data
interface CardItem {
  quantity: string
  name: string
  manaSymbols: Array<{ symbol: string, svgUri: string }>
}

interface Section {
  heading: string
  count: number
  cards: CardItem[]
}

const mainDeckSections = ref<Section[]>([])
const sideboardSections = ref<Section[]>([])

// Cache for card data (including mana cost)
const cardDataCache = ref<Map<string, { manaCost: string, manaSymbols: Array<{ symbol: string, svgUri: string }> }>>(new Map())

// Cache for mana symbol SVG URIs
const manaSymbolCache = ref<Map<string, string>>(new Map())

// Use Nuxt UI Toast composable
const toast = useToast()

// Check if we're on mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// Function to extract card name from list item text (removes quantity)
const extractCardName = (text: string): string => {
  return text.replace(/^\d+\s+/, '').trim()
}

// Function to extract quantity from list item text
const extractQuantity = (text: string): string => {
  const match = text.match(/^(\d+\s+)/)
  return match ? match[1] : ''
}

// Function to fetch mana symbol SVG URI from Scryfall
const fetchManaSymbol = async (symbol: string): Promise<string> => {
  // Check cache first
  if (manaSymbolCache.value.has(symbol)) {
    return manaSymbolCache.value.get(symbol)!
  }

  try {
    const response = await fetch(`https://api.scryfall.com/symbology`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch symbology')
    }

    const data = await response.json()
    
    // Cache all symbols at once
    data.data.forEach((item: any) => {
      manaSymbolCache.value.set(item.symbol, item.svg_uri)
    })

    return manaSymbolCache.value.get(symbol) || ''
  } catch (error) {
    console.error(`Error fetching mana symbol for ${symbol}:`, error)
    return ''
  }
}

// Function to parse mana cost and get symbol info
const parseManaCost = (manaCost: string): string[] => {
  if (!manaCost) return []
  // Extract symbols like {W}, {U}, {B}, {R}, {G}, {1}, {2}, etc.
  const symbols = manaCost.match(/\{[^}]+\}/g) || []
  return symbols
}

// Function to fetch card data from Scryfall
const fetchCardData = async (cardName: string): Promise<{ manaCost: string, manaSymbols: Array<{ symbol: string, svgUri: string }> }> => {
  // Check cache first
  if (cardDataCache.value.has(cardName)) {
    return cardDataCache.value.get(cardName)!
  }

  try {
    const encodedName = encodeURIComponent(cardName)
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`)
    
    if (!response.ok) {
      throw new Error('Card not found')
    }

    const data = await response.json()
    const manaCost = data.mana_cost || ''
    
    // Parse mana cost and fetch symbol URIs
    const symbols = parseManaCost(manaCost)
    const manaSymbols = await Promise.all(
      symbols.map(async (symbol) => {
        const svgUri = await fetchManaSymbol(symbol)
        return { symbol, svgUri }
      })
    )

    const cardData = {
      manaCost,
      manaSymbols
    }

    // Cache the result
    cardDataCache.value.set(cardName, cardData)
    return cardData
  } catch (error) {
    console.error(`Error fetching card data for ${cardName}:`, error)
    return { manaCost: '', manaSymbols: [] }
  }
}

// Function to process sections and extract card data
const processSections = async () => {
  if (!decklistContent.value) return

  // Fetch symbology once for all cards
  if (manaSymbolCache.value.size === 0) {
    await fetchManaSymbol('{W}') // This will cache all symbols
  }

  // Process main deck
  const mainDeckElement = decklistContent.value.querySelector('.main-deck')
  if (mainDeckElement) {
    mainDeckSections.value = await extractSections(mainDeckElement)
  }

  // Process sideboard
  const sideboardElement = decklistContent.value.querySelector('.sideboard')
  if (sideboardElement) {
    sideboardSections.value = await extractSections(sideboardElement)
  }
}

// Extract sections from a deck element
const extractSections = async (deckElement: Element): Promise<Section[]> => {
  const sections: Section[] = []
  const headings = deckElement.querySelectorAll('h2')

  for (const heading of headings) {
    const headingText = (heading.textContent || '').trim()
    const cards: CardItem[] = []
    let nextElement = heading.nextElementSibling

    while (nextElement && nextElement.tagName !== 'H2') {
      if (nextElement.tagName === 'UL') {
        const listItems = nextElement.querySelectorAll('li')
        
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
      nextElement = nextElement.nextElementSibling
    }

    const count = cards.reduce((sum, card) => {
      const qty = parseInt(card.quantity.trim()) || 0
      return sum + qty
    }, 0)

    sections.push({
      heading: headingText,
      count,
      cards
    })
  }

  return sections
}

// Function to copy decklist to clipboard
const copyDecklist = async () => {
  let decklistText = `${props.name}`
  if (props.author) decklistText += `\n${props.author}`
  if (props.position) decklistText += ` - ${props.position}`
  decklistText += '\n\n'

  // Add main deck
  mainDeckSections.value.forEach(section => {
    decklistText += `${section.heading}\n`
    section.cards.forEach(card => {
      decklistText += `${card.quantity}${card.name}\n`
    })
    decklistText += '\n'
  })

  // Add sideboard
  if (sideboardSections.value.length > 0) {
    sideboardSections.value.forEach(section => {
      decklistText += `${section.heading}\n`
      section.cards.forEach(card => {
        decklistText += `${card.quantity}${card.name}\n`
      })
      decklistText += '\n'
    })
  }

  try {
    await navigator.clipboard.writeText(decklistText)

    toast.add({
      title: 'Copied!',
      description: 'Decklist copied to clipboard',
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch (err) {
    console.error('Failed to copy:', err)
    toast.add({
      title: 'Failed to copy',
      description: 'Could not copy decklist to clipboard',
      icon: 'i-lucide-x',
      color: 'error'
    })
  }
}

// Handle card hover
const handleCardHover = (cardName: string | null) => {
  hoveredCard.value = cardName
  if (isMobile.value && cardName) {
    showModal.value = true
  } else if (!cardName) {
    showModal.value = false
  }
}

// Close modal
const closeModal = () => {
  showModal.value = false
  hoveredCard.value = null
}

// Handle window resize
const handleResize = () => {
  checkMobile()
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  // Wait for slots to render
  setTimeout(() => {
    processSections()
  }, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const getCardImageUrl = (cardName: string): string => {
  const encodedName = encodeURIComponent(cardName)
  return `https://api.scryfall.com/cards/named?format=image&exact=${encodedName}`
}
</script>

<template>
  <UCard
    class="decklist-wrapper bg-yellow-600/80 mx-auto"
    :ui="{
      root: 'overflow-hidden',
      header: 'relative',
      body: 'p-0'
    }"
  >
    <!-- Header Slot -->
    <template #header>
      <h2 class="text-2xl font-bold text-amber-950 pr-12">
        {{ title }}
      </h2>
      <p v-if="props.author" class="text-md text-gray-900">
        {{ props.author }}
      </p>
      <p v-if="props.description" class="mt-2 text-gray-800">
        {{ props.description }}
      </p>

      <!-- Copy Button using UButton -->
      <UButton
        icon="i-lucide-copy"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        class="absolute top-4 end-4"
        title="Copy decklist"
        aria-label="Copy decklist to clipboard"
        @click="copyDecklist"
      />
    </template>

    <!-- Body Slot - Three-column layout -->
    <template #default>
      <div class="decklist-grid">
        <!-- Main Deck (Left) -->
        <div class="main-deck p-3">
          <!-- Hidden slot for parsing original content -->
          <div ref="decklistContent" class="hidden">
            <div class="main-deck">
              <slot name="main" />
            </div>
            <div class="sideboard">
              <slot name="sideboard" />
            </div>
          </div>

          <!-- Rendered deck list -->
          <div v-for="section in mainDeckSections" :key="section.heading" class="section">
            <h2 class="section-heading">
              {{ section.heading }} <span class="card-count">({{ section.count }})</span>
            </h2>
            <ul class="card-list">
              <li
                v-for="(card, index) in section.cards"
                :key="`${section.heading}-${index}`"
                class="card-item"
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
        </div>

        <!-- Sideboard (Middle) -->
        <div class="sideboard p-3">
          <div v-for="section in sideboardSections" :key="section.heading" class="section">
            <h2 class="section-heading">
              {{ section.heading }} <span class="card-count">({{ section.count }})</span>
            </h2>
            <ul class="card-list">
              <li
                v-for="(card, index) in section.cards"
                :key="`${section.heading}-${index}`"
                class="card-item"
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
        </div>

        <!-- Card Preview (Right) - Hidden on small screens -->
        <div class="card-preview p-3 bg-amber-950/10 rounded sticky top-4">
          <div v-if="hoveredCard" class="preview-content">
            <div class="card-image-container">
              <img
                :src="getCardImageUrl(hoveredCard)"
                :alt="hoveredCard"
                class="card-image rounded-lg shadow-lg w-full"
                @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22%3E%3Crect width=%22200%22 height=%22280%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'"
              >
            </div>
          </div>
          <div v-else class="text-gray-600 text-center text-sm py-8">
            <UIcon name="i-lucide-image" class="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p>Hover over a card to preview</p>
          </div>
        </div>
      </div>
    </template>
  </UCard>

  <!-- Mobile Modal using UModal -->
  <UModal
    v-model:open="showModal"
    :ui="{
      content: 'bg-transparent shadow-none ring-0',
      overlay: 'bg-black/80'
    }"
  >
    <template #content>
      <div v-if="hoveredCard" class="flex items-center justify-center p-4">
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
.decklist-wrapper {
  max-width: 1000px;
}

.decklist-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  gap: 0.25rem;
  min-height: 500px;
}

.card-preview {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.hidden {
  display: none;
}

.section {
  margin-bottom: 0.5rem;
}

.section-heading {
  margin-top: 0.6rem;
  margin-bottom: 0.15rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #292524;
}

.section-heading:first-child {
  margin-top: 0;
}

.card-count {
  font-weight: 500;
  opacity: 0.8;
}

.card-list {
  list-style-type: none;
  padding-left: 0;
  margin-top: 0.15rem;
  margin-bottom: 0.35rem;
}

.card-item {
  display: grid;
  grid-template-columns: auto 1fr 60px;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  line-height: 1.2;
  font-size: 0.95rem;
  color: #1c1917;
  font-weight: 500;
}

.card-quantity {
  color: #1c1917;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
}

.card-name-wrapper {
  min-width: 0;
  overflow: hidden;
}

.card-name-link {
  cursor: pointer;
  color: #4714ff;
  text-decoration: underline;
  text-decoration-color: #4714ff;
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

.card-image {
  max-width: 100%;
  height: auto;
  display: block;
}

.card-image-container {
  position: relative;
}

@media (max-width: 1400px) {
  .decklist-grid {
    grid-template-columns: 1fr 1fr 1.5fr;
  }
}

@media (max-width: 1024px) {
  .decklist-grid {
    grid-template-columns: 1fr 1fr 1.5fr;
  }
}

@media (max-width: 768px) {
  .decklist-grid {
    grid-template-columns: 1fr 1fr;
  }

  .card-preview {
    display: none;
  }
}
</style>
