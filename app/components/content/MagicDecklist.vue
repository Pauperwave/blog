<script setup lang="ts">
import type { DeckSection, CardItem, ParsedCardLine } from '#shared/types/decklist'

const props = defineProps<{
  name: string
  player?: string
  description?: string
  placement?: string
  tags?: string[]
}>()

console.debug('[Decklist] Component initialized with props:', props)

const hoveredCard = ref<string | null>(null)
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

// Slots
const slots = useSlots()

// Check if we're on mobile
const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 768
  console.debug('[Decklist] checkMobile:', {
    wasMobile,
    isMobile: isMobile.value,
    windowWidth: window.innerWidth
  })
}

interface ParsedCard {
  quantity: number
  name: string
  isSideboard: boolean
  section?: string
}

/**
 * Parse raw deck text content
 */
function parseRawDeck(text: string): ParsedCard[] {
  console.debug('[Decklist] parseRawDeck input:', text)
  
  const lines = text.trim().split('\n')
  const cards: ParsedCard[] = []
  let isSideboard = false
  let currentSection = ''

  for (const line of lines) {
    const trimmedLine = line.trim()
    console.debug('[Decklist] Processing line:', trimmedLine)

    if (!trimmedLine) continue

    // Check for sideboard delimiter
    if (/^sideboard:?$/i.test(trimmedLine)) {
      console.debug('[Decklist] Found sideboard marker')
      isSideboard = true
      currentSection = ''
      continue
    }

    // Parse card line: "3 Krark-Clan Shaman"
    const cardMatch = trimmedLine.match(/^(\d+)x?\s+(.+)$/)
    
    if (cardMatch) {
      const quantityString = cardMatch[1]
      const cardName = cardMatch[2]

      // Type guard: ensure both capture groups exist
      if (!quantityString || !cardName) continue

      const card: ParsedCard = {
        quantity: parseInt(quantityString, 10),
        name: cardName,
        isSideboard,
        section: currentSection
      }
      
      cards.push(card)
      console.debug('[Decklist] Added card:', card)
    } else {
      // This line is likely a section heading
      currentSection = trimmedLine
      console.debug('[Decklist] New section:', currentSection)
    }
  }

  console.debug('[Decklist] parseRawDeck result:', cards)
  return cards
}

/**
 * Extract raw text from slot
 */
function getRawTextFromSlot(): string {
  console.debug('[Decklist] getRawTextFromSlot called')
  console.debug('[Decklist] Available slots:', Object.keys(slots))
  
  const defaultSlot = slots.default?.()
  
  if (!defaultSlot || defaultSlot.length === 0) {
    console.debug('[Decklist] No default slot content')
    return ''
  }

  console.debug('[Decklist] Default slot vnodes:', defaultSlot)
  
  // Extract text from vnodes
  const extractText = (vnodes: any[]): string => {
    return vnodes.map(vnode => {
      if (typeof vnode.children === 'string') {
        return vnode.children
      } else if (Array.isArray(vnode.children)) {
        return extractText(vnode.children)
      }
      return ''
    }).join('\n')
  }
  
  const text = extractText(defaultSlot)
  console.debug('[Decklist] Extracted text:', text)
  
  return text
}

/**
 * Group cards by section
 */
function groupCardsBySection(cards: ParsedCard[]): { mainSections: Map<string, ParsedCard[]>, sideSections: Map<string, ParsedCard[]> } {
  console.debug('[Decklist] groupCardsBySection called with:', cards)
  
  const mainSections = new Map<string, ParsedCard[]>()
  const sideSections = new Map<string, ParsedCard[]>()

  for (const card of cards) {
    const sectionName = card.section || 'Other'
    const targetMap = card.isSideboard ? sideSections : mainSections

    if (!targetMap.has(sectionName)) {
      targetMap.set(sectionName, [])
    }
    targetMap.get(sectionName)!.push(card)
  }

  console.debug('[Decklist] Grouped sections:', {
    mainSections: Array.from(mainSections.entries()),
    sideSections: Array.from(sideSections.entries())
  })

  return { mainSections, sideSections }
}

/**
 * Fetch card data from our local API
 */
async function fetchCardDataBatch(cardNames: string[]): Promise<Map<string, any>> {
  console.debug('[Decklist] fetchCardDataBatch called with:', cardNames)
  
  // Check cache first
  const uncachedNames = cardNames.filter(name => !cardDataCache.value.has(name))
  
  console.debug('[Decklist] Cache status:', {
    totalRequested: cardNames.length,
    cached: cardNames.length - uncachedNames.length,
    uncached: uncachedNames.length,
    uncachedNames
  })
  
  if (uncachedNames.length === 0) {
    console.debug('[Decklist] All cards cached, skipping API call')
    return cardDataCache.value
  }
  
  try {
    console.debug('[Decklist] Fetching card data from API...')
    const response = await $fetch('/api/cards', {
      query: {
        names: uncachedNames.join(',')
      }
    })
    
    console.debug('[Decklist] API response:', response)
    
    // Cache the results
    if (response && response.cards) {
      for (const [name, data] of Object.entries(response.cards)) {
        cardDataCache.value.set(name, data)
        console.debug('[Decklist] Cached card data for:', name, data)
      }
    }
    
    console.debug('[Decklist] Card data cache size:', cardDataCache.value.size)
    return cardDataCache.value
  } catch (err) {
    console.error('[Decklist] Error fetching card data:', err)
    throw err
  }
}

/**
 * Process deck content and enrich with card data
 */
async function processDeck() {
  console.debug('[Decklist] processDeck started')

  try {
    // Get raw text from slot
    const rawText = getRawTextFromSlot()
    
    if (!rawText) {
      console.error('[Decklist] No deck content found in slot')
      error.value = 'No deck content found'
      isLoading.value = false
      return
    }

    // Parse the raw text
    const parsedCards = parseRawDeck(rawText)
    console.debug('[Decklist] Parsed cards:', parsedCards)

    if (parsedCards.length === 0) {
      console.error('[Decklist] No cards parsed from content')
      error.value = 'No cards found in deck'
      isLoading.value = false
      return
    }

    // Group by section
    const { mainSections, sideSections } = groupCardsBySection(parsedCards)

    // Collect all unique card names
    const allCardNames = new Set<string>(parsedCards.map(card => card.name))
    console.debug('[Decklist] Unique card names:', Array.from(allCardNames))
    
    // Fetch all card data in one batch
    await fetchCardDataBatch(Array.from(allCardNames))
    
    // Build main deck sections
    console.debug('[Decklist] Building main deck sections...')
    mainDeckSections.value = Array.from(mainSections.entries()).map(([heading, cards]) => {
      console.debug('[Decklist] Processing main deck section:', heading)
      
      const cardItems: CardItem[] = cards.map(card => {
        const cardData = cardDataCache.value.get(card.name)
        
        console.debug('[Decklist] Card data for', card.name, ':', cardData)
        
        return {
          quantity: card.quantity,
          name: card.name,
          manaCost: cardData?.manaCost || '',
          manaSymbols: cardData?.manaSymbols || [],
          imageUrl: cardData?.imageUrl || ''
        }
      })
      
      const count = cardItems.reduce((sum, card) => sum + card.quantity, 0)
      
      const result = {
        heading,
        count,
        cards: cardItems
      }
      
      console.debug('[Decklist] Main deck section built:', result)
      return result
    })
    
    // Build sideboard sections
    console.debug('[Decklist] Building sideboard sections...')
    sideboardSections.value = Array.from(sideSections.entries()).map(([heading, cards]) => {
      console.debug('[Decklist] Processing sideboard section:', heading)
      
      const cardItems: CardItem[] = cards.map(card => {
        const cardData = cardDataCache.value.get(card.name)
        
        console.debug('[Decklist] Card data for', card.name, ':', cardData)
        
        return {
          quantity: card.quantity,
          name: card.name,
          manaCost: cardData?.manaCost || '',
          manaSymbols: cardData?.manaSymbols || [],
          imageUrl: cardData?.imageUrl || ''
        }
      })
      
      const count = cardItems.reduce((sum, card) => sum + card.quantity, 0)
      
      const result = {
        heading,
        count,
        cards: cardItems
      }
      
      console.debug('[Decklist] Sideboard section built:', result)
      return result
    })
    
    console.debug('[Decklist] processDeck completed successfully')
    console.debug('[Decklist] Final state:', {
      mainDeckSections: mainDeckSections.value,
      sideboardSections: sideboardSections.value
    })
    
    isLoading.value = false
  } catch (err) {
    console.error('[Decklist] Error processing deck:', err)
    error.value = err instanceof Error ? err.message : 'Unknown error'
    isLoading.value = false
  }
}

/**
 * Copy decklist to clipboard (MTGO format)
 */
async function copyDecklist() {
  console.debug('[Decklist] copyDecklist called')
  
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

  console.debug('[Decklist] Decklist text to copy:', decklistText)

  try {
    await navigator.clipboard.writeText(decklistText)
    console.debug('[Decklist] Clipboard write successful')

    toast.add({
      title: 'Copied!',
      description: 'Decklist copied to clipboard',
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch (err) {
    console.error('[Decklist] Failed to copy:', err)
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
  console.debug('[Decklist] handleCardHover:', {
    cardName,
    isMobile: isMobile.value,
    previousHoveredCard: hoveredCard.value
  })
  
  hoveredCard.value = cardName
  
  if (isMobile.value && cardName) {
    console.debug('[Decklist] Opening modal for mobile')
    showModal.value = true
  } else if (!cardName) {
    console.debug('[Decklist] Closing modal')
    showModal.value = false
  }
}

/**
 * Close modal
 */
function closeModal() {
  console.debug('[Decklist] closeModal called')
  showModal.value = false
  hoveredCard.value = null
}

/**
 * Handle window resize
 */
function handleResize() {
  console.debug('[Decklist] handleResize triggered')
  checkMobile()
}

/**
 * Get card image URL
 */
function getCardImageUrl(cardName: string): string {
  const cardData = cardDataCache.value.get(cardName)
  const imageUrl = cardData?.imageUrl || `https://api.scryfall.com/cards/named?format=image&exact=${encodeURIComponent(cardName)}`
  
  console.debug('[Decklist] getCardImageUrl:', {
    cardName,
    hasCardData: !!cardData,
    imageUrl
  })
  
  return imageUrl
}

onMounted(() => {
  console.debug('[Decklist] onMounted hook triggered')
  
  checkMobile()
  window.addEventListener('resize', handleResize)
  console.debug('[Decklist] Resize event listener added')
  
  // Process deck content
  nextTick(() => {
    console.debug('[Decklist] nextTick callback - processing deck')
    processDeck()
  })
})

onBeforeUnmount(() => {
  console.debug('[Decklist] onBeforeUnmount hook triggered')
  window.removeEventListener('resize', handleResize)
  console.debug('[Decklist] Resize event listener removed')
})

// Watch reactive values
watch(hoveredCard, (newValue, oldValue) => {
  console.debug('[Decklist] hoveredCard changed:', { from: oldValue, to: newValue })
})

watch(showModal, (newValue, oldValue) => {
  console.debug('[Decklist] showModal changed:', { from: oldValue, to: newValue })
})

watch(isLoading, (newValue, oldValue) => {
  console.debug('[Decklist] isLoading changed:', { from: oldValue, to: newValue })
})

watch(error, (newValue, oldValue) => {
  console.debug('[Decklist] error changed:', { from: oldValue, to: newValue })
})

watch(mainDeckSections, (newValue) => {
  console.debug('[Decklist] mainDeckSections updated:', newValue)
}, { deep: true })

watch(sideboardSections, (newValue) => {
  console.debug('[Decklist] sideboardSections updated:', newValue)
}, { deep: true })
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
          <p
            v-if="props.player"
            class="text-md dark:text-gray-400"
          >
            {{ props.player }}
          </p>
        </div>
        <div
          v-if="props.placement"
          class="dark:text-gray-500"
        >
          {{ props.placement }}
        </div>
      </div>
      <div
        v-if="props.description"
        class="mb-2 dark:text-gray-500"
      >
        {{ props.description }}
      </div>
      <div
        v-if="props.tags && props.tags.length"
        class="flex flex-wrap gap-1"
      >
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
      <!-- Hidden default slot for raw text -->
      <!-- <div class="hidden"> -->
      <div>
        <slot />
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center py-8"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin"
        />
        <span class="ml-2">Loading deck...</span>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="text-red-500 p-4"
      >
        <p><strong>Error loading decklist:</strong></p>
        <p>{{ error }}</p>
      </div>

      <!-- Deck Content -->
      <div
        v-else
        class="decklist-grid"
      >
        <!-- Main Deck (Left) -->
        <div class="main-deck">
          <div
            v-for="section in mainDeckSections"
            :key="section.heading"
            class="section"
          >
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
          <div
            v-for="section in sideboardSections"
            :key="section.heading"
            class="section"
          >
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
          <div
            v-if="hoveredCard"
            class="preview-content"
          >
            <div class="card-image-container">
              <img
                :src="getCardImageUrl(hoveredCard)"
                :alt="hoveredCard"
                class="card-image rounded-lg shadow-lg w-full"
                @error="(e) => { 
                  console.error('[Decklist] Image load error for:', hoveredCard, e);
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22%3E%3Crect width=%22200%22 height=%22280%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'
                }"
                @load="console.debug('[Decklist] Image loaded successfully for:', hoveredCard)"
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
      <div
        v-if="hoveredCard"
        class="flex items-center justify-center p-4"
      >
        <img
          :src="getCardImageUrl(hoveredCard)"
          :alt="hoveredCard"
          class="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
          @error="(e) => {
            console.error('[Decklist] Modal image load error for:', hoveredCard, e);
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22%3E%3Crect width=%22200%22 height=%22280%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'
          }"
          @load="console.debug('[Decklist] Modal image loaded successfully for:', hoveredCard)"
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
