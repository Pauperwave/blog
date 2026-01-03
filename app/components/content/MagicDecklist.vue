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
const extractQuantity = (text: string): number => {
  const match = text.match(/^(\d+)\s+/)
  return match ? parseInt(match[1]!, 10) : 0
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

// Function to calculate total cards in a section
const calculateSectionTotal = (heading: HTMLElement): number => {
  let total = 0
  let nextElement = heading.nextElementSibling

  while (nextElement && nextElement.tagName !== 'H2') {
    if (nextElement.tagName === 'UL') {
      const listItems = nextElement.querySelectorAll('li')
      listItems.forEach((li) => {
        const quantity = extractQuantity(li.textContent || '')
        total += quantity
      })
    }
    nextElement = nextElement.nextElementSibling
  }

  return total
}

// Function to add card counts to headings
const addCardCounts = () => {
  if (!decklistContent.value) return

  const headings = decklistContent.value.querySelectorAll('.main-deck h2, .sideboard h2')

  headings.forEach((heading) => {
    const headingElement = heading as HTMLElement
    const total = calculateSectionTotal(headingElement)

    if (!headingElement.querySelector('.card-count')) {
      const countSpan = document.createElement('span')
      countSpan.className = 'card-count'
      countSpan.textContent = ` (${total})`
      headingElement.appendChild(countSpan)
    }
  })
}

// Function to copy decklist to clipboard
const copyDecklist = async () => {
  if (!decklistContent.value) return

  let decklistText = `${props.name}`
  if (props.author) decklistText += `\n${props.author}`
  decklistText += '\n\n'

  // Get main deck
  const mainDeck = decklistContent.value.querySelector('.main-deck')
  if (mainDeck) {
    const sections = mainDeck.querySelectorAll('h2')
    sections.forEach((heading) => {
      const headingText = heading.textContent?.replace(/\s*\(\d+\)/, '') || ''
      decklistText += `${headingText}\n`

      let nextElement = heading.nextElementSibling
      while (nextElement && nextElement.tagName !== 'H2') {
        if (nextElement.tagName === 'UL') {
          const listItems = nextElement.querySelectorAll('li')
          listItems.forEach((li) => {
            // Extract just the quantity and card name (without mana symbols)
            const cardNameElement = li.querySelector('.card-name-link')
            const quantityElement = li.querySelector('.card-quantity')
            if (quantityElement && cardNameElement) {
              decklistText += `${quantityElement.textContent}${cardNameElement.textContent}\n`
            }
          })
        }
        nextElement = nextElement.nextElementSibling
      }
      decklistText += '\n'
    })
  }

  // Get sideboard
  const sideboard = decklistContent.value.querySelector('.sideboard')
  if (sideboard) {
    const sections = sideboard.querySelectorAll('h2')
    sections.forEach((heading) => {
      const headingText = heading.textContent?.replace(/\s*\(\d+\)/, '') || ''
      decklistText += `${headingText}\n`

      let nextElement = heading.nextElementSibling
      while (nextElement && nextElement.tagName !== 'H2') {
        if (nextElement.tagName === 'UL') {
          const listItems = nextElement.querySelectorAll('li')
          listItems.forEach((li) => {
            const cardNameElement = li.querySelector('.card-name-link')
            const quantityElement = li.querySelector('.card-quantity')
            if (quantityElement && cardNameElement) {
              decklistText += `${quantityElement.textContent}${cardNameElement.textContent}\n`
            }
          })
        }
        nextElement = nextElement.nextElementSibling
      }
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

// Setup hover listeners on mount
const setupHoverListeners = async () => {
  if (!decklistContent.value) return

  const listItems = decklistContent.value.querySelectorAll('.main-deck li, .sideboard li')

  // Fetch symbology once for all cards
  if (manaSymbolCache.value.size === 0) {
    await fetchManaSymbol('{W}') // This will cache all symbols
  }

  // Fetch all card data in parallel
  const fetchPromises: Promise<void>[] = []

  listItems.forEach((item) => {
    const element = item as HTMLElement
    const fullText = element.textContent || ''
    const cardName = extractCardName(fullText)
    const quantity = fullText.match(/^(\d+\s+)/)?.[0] || ''

    // Fetch card data
    const fetchPromise = fetchCardData(cardName).then((cardData) => {
      // Restructure the list item
      const quantitySpan = document.createElement('span')
      quantitySpan.className = 'card-quantity'
      quantitySpan.textContent = quantity

      const cardNameWrapper = document.createElement('span')
      cardNameWrapper.className = 'card-name-wrapper'

      const cardLink = document.createElement('span')
      cardLink.className = 'card-name-link'
      cardLink.textContent = cardName

      cardNameWrapper.appendChild(cardLink)

      // Create mana cost container
      const manaCostContainer = document.createElement('span')
      manaCostContainer.className = 'card-mana-cost'

      if (cardData.manaSymbols.length > 0) {
        cardData.manaSymbols.forEach(({ svgUri }) => {
          if (svgUri) {
            const manaImg = document.createElement('img')
            manaImg.src = svgUri
            manaImg.className = 'mana-symbol'
            manaImg.alt = 'Mana symbol'
            manaCostContainer.appendChild(manaImg)
          }
        })
      }

      element.textContent = ''
      element.appendChild(quantitySpan)
      element.appendChild(cardNameWrapper)
      element.appendChild(manaCostContainer)

      if (isMobile.value) {
        cardLink.addEventListener('click', () => {
          if (hoveredCard.value === cardName && showModal.value) {
            closeModal()
          } else {
            handleCardHover(cardName)
          }
        })
      } else {
        cardLink.addEventListener('mouseenter', () => handleCardHover(cardName))
        cardLink.addEventListener('mouseleave', () => handleCardHover(null))
      }

      element.classList.add('card-item')
    })

    fetchPromises.push(fetchPromise)
  })

  // Wait for all cards to be fetched
  await Promise.all(fetchPromises)
}

// Cleanup listeners
const cleanupHoverListeners = () => {
  if (!decklistContent.value) return

  const listItems = decklistContent.value.querySelectorAll('.card-item')
  listItems.forEach((item) => {
    const element = item as HTMLElement
    element.replaceWith(element.cloneNode(true))
  })
}

// Handle window resize
const handleResize = () => {
  const wasMobile = isMobile.value
  checkMobile()
  if (wasMobile !== isMobile.value) {
    cleanupHoverListeners()
    setTimeout(setupHoverListeners, 100)
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  setTimeout(() => {
    addCardCounts()
    setupHoverListeners()
  }, 100)
})

onBeforeUnmount(() => {
  cleanupHoverListeners()
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
      <div ref="decklistContent" class="decklist-grid">
        <!-- Main Deck (Left) -->
        <div class="main-deck prose prose-sm max-w-none p-3">
          <slot name="main" />
        </div>

        <!-- Sideboard (Middle) -->
        <div class="sideboard prose prose-sm max-w-none p-3">
          <slot name="sideboard" />
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
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.25rem;
  min-height: 500px;
}

.card-preview {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* Style card list items to be interactive */
:deep(.card-item) {
  display: grid;
  grid-template-columns: auto 1fr 60px;
  align-items: center;
  gap: 0.5rem;
}

:deep(.card-quantity) {
  /* border: white 2px solid; */
  color: #1c1917;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
}

:deep(.card-name-wrapper) {
  /* border: white 2px solid; */
  min-width: 0;
  overflow: hidden;
}

:deep(.card-name-link) {
  cursor: pointer;
  color: #4714ff;
  text-decoration: underline;
  text-decoration-color: #4714ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

:deep(.card-mana-cost) {
  /* border: white 2px solid; */
  display: flex;
  gap: 2px;
  align-items: center;
  width: 60px;
  flex-wrap: wrap;
}

:deep(.mana-symbol) {
  width: 15px;
  height: 15px;
  display: inline-block;
  flex-shrink: 0;
}

/* Remove bullet points and tighten spacing */
:deep(.main-deck ul),
:deep(.sideboard ul) {
  /* border: forestgreen 2px solid; */
  list-style-type: none;
  padding-left: 0;
  margin-top: 0.15rem;
  margin-bottom: 0.35rem;
}

:deep(.main-deck li),
:deep(.sideboard li) {
  /* border: yellow 2px solid; */
  margin: 0;
  /* padding: 0; */
  line-height: 1.2;
  font-size: 0.95rem;
  color: #1c1917;
  font-weight: 500;
}

/* Tighten heading spacing */
:deep(.main-deck h2),
:deep(.sideboard h2) {
  margin-top: 0.6rem;
  margin-bottom: 0.15rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #292524;
}

:deep(.main-deck h2:first-child),
:deep(.sideboard h2:first-child) {
  margin-top: 0;
}

/* Style the card count */
:deep(.card-count) {
  font-weight: 500;
  opacity: 0.8;
}

/* Reduce paragraph spacing */
:deep(.main-deck p),
:deep(.sideboard p) {
  margin: 0.15rem 0;
}

/* Prevent word breaking */
:deep(.main-deck),
:deep(.sideboard) {
  word-break: keep-all;
  overflow-wrap: normal;
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
