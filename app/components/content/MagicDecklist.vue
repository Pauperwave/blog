<script setup lang="ts">
import type { DeckSection, CardItem, ParsedCardLine } from '../../../shared/types/decklist'

const props = defineProps<{
  name: string
  player?: string
  description?: string
  placement?: string
  tags?: string[]
}>()

const hoveredCard = ref<string | null>(null)
const decklistContent = ref<HTMLElement | null>(null)
const showModal = ref(false)
const isMobile = ref(false)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Store processed card data
const mainDeckSections = ref<DeckSection[]>([])
const sideboardSections = ref<DeckSection[]>([])

// Card data cache (from API)
const cardDataCache = ref<Map<string, any>>(new Map())

// Use Nuxt UI Toast composable
const toast = useToast()

// Check if we're on mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

/**
 * Parse a card line like "4 Lightning Bolt" or "- 4 Lightning Bolt"
 */
function parseCardLine(text: string): ParsedCardLine | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  
  // Match patterns like:
  // "4 Lightning Bolt"
  // "- 4 Lightning Bolt"
  // "4x Lightning Bolt"
  const match = trimmed.match(/^-?\s*(\d+)x?\s+(.+)$/)
  
  if (!match) return null
  
  const quantity = parseInt(match[1]!, 10)
  const name = match[2]!.trim()
  
  return { quantity, name }
}

/**
 * Extract sections from a deck element
 */
function extractSectionsFromDOM(deckElement: Element): Array<{ heading: string; cardLines: ParsedCardLine[] }> {
  const sections: Array<{ heading: string; cardLines: ParsedCardLine[] }> = []
  const headings = deckElement.querySelectorAll('h2')

  for (const heading of headings) {
    const headingText = (heading.textContent || '').trim()
    const cardLines: ParsedCardLine[] = []
    let nextElement = heading.nextElementSibling

    while (nextElement && nextElement.tagName !== 'H2') {
      if (nextElement.tagName === 'UL') {
        const listItems = nextElement.querySelectorAll('li')

        for (const li of listItems) {
          const fullText = li.textContent || ''
          const parsed = parseCardLine(fullText)
          
          if (parsed) {
            cardLines.push(parsed)
          }
        }
      }
      nextElement = nextElement.nextElementSibling
    }

    if (cardLines.length > 0) {
      sections.push({
        heading: headingText,
        cardLines
      })
    }
  }

  return sections
}

/**
 * Fetch card data from our local API
 */
async function fetchCardDataBatch(cardNames: string[]): Promise<Map<string, any>> {
  // Check cache first
  const uncachedNames = cardNames.filter(name => !cardDataCache.value.has(name))
  
  if (uncachedNames.length === 0) {
    return cardDataCache.value
  }
  
  try {
    const response = await $fetch('/api/cards', {
      query: {
        names: uncachedNames.join(',')
      }
    })
    
    // Cache the results
    if (response && response.cards) {
      for (const [name, data] of Object.entries(response.cards)) {
        cardDataCache.value.set(name, data)
      }
    }
    
    return cardDataCache.value
  } catch (err) {
    console.error('Error fetching card data:', err)
    throw err
  }
}

/**
 * Process sections and enrich with card data
 */
async function processSections() {
  if (!decklistContent.value) {
    error.value = 'Deck content not found'
    isLoading.value = false
    return
  }

  try {
    // Extract sections from DOM
    const mainDeckElement = decklistContent.value.querySelector('.main-deck')
    const sideboardElement = decklistContent.value.querySelector('.sideboard')
    
    const mainSections = mainDeckElement ? extractSectionsFromDOM(mainDeckElement) : []
    const sideSections = sideboardElement ? extractSectionsFromDOM(sideboardElement) : []
    
    // Collect all unique card names
    const allCardNames = new Set<string>()
    
    for (const section of [...mainSections, ...sideSections]) {
      for (const line of section.cardLines) {
        allCardNames.add(line.name)
      }
    }
    
    // Fetch all card data in one batch
    await fetchCardDataBatch(Array.from(allCardNames))
    
    // Build main deck sections
    mainDeckSections.value = mainSections.map(section => {
      const cards: CardItem[] = section.cardLines.map(line => {
        const cardData = cardDataCache.value.get(line.name)
        
        return {
          quantity: line.quantity,
          name: line.name,
          manaCost: cardData?.manaCost || '',
          manaSymbols: cardData?.manaSymbols || [],
          imageUrl: cardData?.imageUrl || ''
        }
      })
      
      const count = cards.reduce((sum, card) => sum + card.quantity, 0)
      
      return {
        heading: section.heading,
        count,
        cards
      }
    })
    
    // Build sideboard sections
    sideboardSections.value = sideSections.map(section => {
      const cards: CardItem[] = section.cardLines.map(line => {
        const cardData = cardDataCache.value.get(line.name)
        
        return {
          quantity: line.quantity,
          name: line.name,
          manaCost: cardData?.manaCost || '',
          manaSymbols: cardData?.manaSymbols || [],
          imageUrl: cardData?.imageUrl || ''
        }
      })
      
      const count = cards.reduce((sum, card) => sum + card.quantity, 0)
      
      return {
        heading: section.heading,
        count,
        cards
      }
    })
    
    isLoading.value = false
  } catch (err) {
    console.error('Error processing sections:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
    isLoading.value = false
  }
}

/**
 * Copy decklist to clipboard (MTGO format)
 */
async function copyDecklist() {
  let decklistText = ''

  // Add main deck
  mainDeckSections.value.forEach((section) => {
    section.cards.forEach((card) => {
      decklistText += `${card.quantity} ${card.name}\n`
    })
  })

  // Add sideboard
  if (sideboardSections.value.length > 0) {
    decklistText += '\nSideboard:\n'
    sideboardSections.value.forEach((section) => {
      section.cards.forEach((card) => {
        decklistText += `${card.quantity} ${card.name}\n`
      })
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

/**
 * Handle card hover
 */
function handleCardHover(cardName: string | null) {
  hoveredCard.value = cardName
  if (isMobile.value && cardName) {
    showModal.value = true
  } else if (!cardName) {
    showModal.value = false
  }
}

/**
 * Close modal
 */
function closeModal() {
  showModal.value = false
  hoveredCard.value = null
}

/**
 * Handle window resize
 */
function handleResize() {
  checkMobile()
}

/**
 * Get card image URL
 */
function getCardImageUrl(cardName: string): string {
  const cardData = cardDataCache.value.get(cardName)
  return cardData?.imageUrl || `https://api.scryfall.com/cards/named?format=image&exact=${encodeURIComponent(cardName)}`
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  
  // Wait for slots to render, then process
  nextTick(() => {
    processSections()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <UCard
    class="decklist-wrapper mx-auto"
    :ui="{
      root: 'overflow-hidden',
      header: 'relative'
    }"
  >
    <!-- Header Slot -->
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 class="text-lg font-semibold">{{ props.name }}</h2>
          <p v-if="props.player" class="text-md dark:text-gray-400">
            {{ props.player }}
          </p>
        </div>
        <div v-if="props.placement" class="dark:text-gray-500">
          {{ props.placement }}
        </div>
      </div>
      <div v-if="props.description" class="mb-2 dark:text-gray-500">
        {{ props.description }}
      </div>
      <div v-if="props.tags && props.tags.length" class="flex flex-wrap gap-1">
        <UButton
          v-for="(tag, index) in props.tags"
          :key="index"
          size="sm"
          variant="outline"
        >
          {{ tag }}
        </UButton>
      </div>
    </template>

    <!-- Body Slot - Three-column layout -->
    <template #default>
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin" />
        <span class="ml-2">Loading deck...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-red-500 p-4">
        <p><strong>Error loading decklist:</strong></p>
        <p>{{ error }}</p>
      </div>

      <!-- Deck Content -->
      <div v-else class="decklist-grid">
        <!-- Hidden slot for parsing original content -->
        <div ref="decklistContent" class="hidden">
          <div class="main-deck">
            <slot name="main" />
          </div>
          <div class="sideboard">
            <slot name="sideboard" />
          </div>
        </div>

        <!-- Main Deck (Left) -->
        <div class="main-deck">
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
        <div class="sideboard">
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
        <div class="card-preview bg-amber-950/10 rounded sticky top-4">
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
            <p>Passa il mouse sopra una carta per visualizzarla</p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        icon="i-lucide-copy"
        size="sm"
        variant="subtle"
        class="cursor-pointer"
        title="Copia decklist"
        aria-label="Copia decklist negli appunti"
        label="Copia per MTGO"
        :disabled="isLoading"
        @click="copyDecklist"
      />
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
  line-height: 1.4;
  font-size: 0.95rem;
  font-weight: 500;
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
    grid-template-columns: 1fr;
  }

  .card-preview {
    display: none;
  }
}
</style>
