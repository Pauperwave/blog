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

// Track the currently hovered card
const hoveredCard = ref<string | null>(null)
const decklistWrapper = ref<HTMLElement | null>(null)

// Function to extract card name from list item text (removes quantity)
const extractCardName = (text: string): string => {
  // Remove leading numbers and spaces (e.g., "4 Myr Enforcer" -> "Myr Enforcer")
  return text.replace(/^\d+\s+/, '').trim()
}

// Handle card hover
const handleCardHover = (cardName: string | null) => {
  hoveredCard.value = cardName
}

// Setup hover listeners on mount
const setupHoverListeners = () => {
  if (!decklistWrapper.value) return

  // Find all list items in the decklist
  const listItems = decklistWrapper.value.querySelectorAll('.main-deck li, .sideboard li')
  
  listItems.forEach((item) => {
    const element = item as HTMLElement
    const cardName = extractCardName(element.textContent || '')
    
    element.addEventListener('mouseenter', () => handleCardHover(cardName))
    element.addEventListener('mouseleave', () => handleCardHover(null))
    
    // Add a class for styling
    element.classList.add('card-item')
  })
}

// Cleanup listeners
const cleanupHoverListeners = () => {
  if (!decklistWrapper.value) return

  const listItems = decklistWrapper.value.querySelectorAll('.card-item')
  listItems.forEach((item) => {
    const element = item as HTMLElement
    element.replaceWith(element.cloneNode(true))
  })
}

onMounted(() => {
  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(setupHoverListeners, 100)
})

onBeforeUnmount(() => {
  cleanupHoverListeners()
})

// Optional: Function to get card image URL (you can integrate with Scryfall API)
const getCardImageUrl = (cardName: string): string => {
  // Replace spaces with + for URL encoding
  const encodedName = encodeURIComponent(cardName)
  return `https://api.scryfall.com/cards/named?format=image&exact=${encodedName}`
}
</script>

<template>
  <div ref="decklistWrapper" class="decklist-wrapper bg-yellow-600/80 rounded-lg overflow-hidden mx-auto">
    <!-- Header -->
    <header class="border-b border-amber-900/30 p-4">
      <h2 class="text-2xl font-bold text-amber-950">
        {{ title }}
      </h2>
      <p
        v-if="props.author"
        class="text-sm text-gray-800"
      >
        By {{ props.author }}
      </p>
      <p
        v-if="props.description"
        class="mt-2 text-gray-800"
      >
        {{ props.description }}
      </p>
    </header>

    <!-- Three-column layout -->
    <div class="decklist-grid">
      <!-- Main Deck (Left) -->
      <div class="main-deck prose prose-sm max-w-none p-4">
        <slot name="main" />
      </div>

      <!-- Sideboard (Middle) -->
      <div class="sideboard prose prose-sm max-w-none p-4">
        <slot name="sideboard" />
      </div>

      <!-- Card Preview (Right) - Hidden on small screens -->
      <div class="card-preview p-4 bg-amber-950/10 rounded sticky top-4">
        <div v-if="hoveredCard" class="preview-content">
          <!-- Card image from Scryfall -->
          <div class="card-image-container">
            <img 
              :src="getCardImageUrl(hoveredCard)" 
              :alt="hoveredCard"
              class="card-image rounded-lg shadow-lg w-full"
              @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22%3E%3Crect width=%22200%22 height=%22280%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'"
            />
          </div>
        </div>
        <div v-else class="text-gray-600 text-center text-sm py-8">
          <svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <p>Hover over a card to preview</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.decklist-wrapper {
  max-width: 1400px;
}

.decklist-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 0.5rem;
  min-height: 500px;
}

.card-preview {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* Style card list items to be interactive */
:deep(.card-item) {
  cursor: pointer;
}

/* Remove bullet points and tighten spacing */
:deep(.main-deck ul),
:deep(.sideboard ul) {
  list-style-type: none;
  padding-left: 0;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

:deep(.main-deck li),
:deep(.sideboard li) {
  margin: 0;
  padding: 0;
  line-height: 1.5;
  font-size: 0.95rem;
  color: #1c1917;
  font-weight: 500;
}

/* Tighten heading spacing */
:deep(.main-deck h2),
:deep(.sideboard h2) {
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: #292524;
}

:deep(.main-deck h2:first-child),
:deep(.sideboard h2:first-child) {
  margin-top: 0;
}

/* Reduce paragraph spacing */
:deep(.main-deck p),
:deep(.sideboard p) {
  margin: 0.25rem 0;
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
  .decklist-wrapper {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .decklist-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  /* Hide card preview entirely on small screens */
  .card-preview {
    display: none;
  }
}
</style>
