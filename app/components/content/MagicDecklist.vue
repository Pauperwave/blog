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
const showModal = ref(false)
const isMobile = ref(false)

// Check if we're on mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// Function to extract card name from list item text (removes quantity)
const extractCardName = (text: string): string => {
  // Remove leading numbers and spaces (e.g., "4 Myr Enforcer" -> "Myr Enforcer")
  return text.replace(/^\d+\s+/, '').trim()
}

// Function to extract quantity from list item text
const extractQuantity = (text: string): number => {
  const match = text.match(/^(\d+)\s+/)
  return match ? parseInt(match[1], 10) : 0
}

// Function to calculate total cards in a section
const calculateSectionTotal = (heading: HTMLElement): number => {
  let total = 0
  let nextElement = heading.nextElementSibling
  
  // Traverse siblings until we hit another heading or run out of elements
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
  if (!decklistWrapper.value) return
  
  const headings = decklistWrapper.value.querySelectorAll('.main-deck h2, .sideboard h2')
  
  headings.forEach((heading) => {
    const headingElement = heading as HTMLElement
    const total = calculateSectionTotal(headingElement)
    
    // Check if count is already added
    if (!headingElement.querySelector('.card-count')) {
      const countSpan = document.createElement('span')
      countSpan.className = 'card-count'
      countSpan.textContent = ` (${total})`
      headingElement.appendChild(countSpan)
    }
  })
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
const setupHoverListeners = () => {
  if (!decklistWrapper.value) return

  // Find all list items in the decklist
  const listItems = decklistWrapper.value.querySelectorAll('.main-deck li, .sideboard li')
  
  listItems.forEach((item) => {
    const element = item as HTMLElement
    const cardName = extractCardName(element.textContent || '')
    
    if (isMobile.value) {
      // On mobile, use click instead of hover
      element.addEventListener('click', () => {
        if (hoveredCard.value === cardName && showModal.value) {
          closeModal()
        } else {
          handleCardHover(cardName)
        }
      })
    } else {
      // On desktop, use hover
      element.addEventListener('mouseenter', () => handleCardHover(cardName))
      element.addEventListener('mouseleave', () => handleCardHover(null))
    }
    
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

// Handle window resize
const handleResize = () => {
  const wasMobile = isMobile.value
  checkMobile()
  if (wasMobile !== isMobile.value) {
    // Re-setup listeners when switching between mobile/desktop
    cleanupHoverListeners()
    setTimeout(setupHoverListeners, 100)
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  // Use setTimeout to ensure DOM is fully rendered
  setTimeout(() => {
    addCardCounts()
    setupHoverListeners()
  }, 100)
})

onBeforeUnmount(() => {
  cleanupHoverListeners()
  window.removeEventListener('resize', handleResize)
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
    <header class="border-b border-amber-900/30 p-3">
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

    <!-- Mobile Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div 
          v-if="showModal && hoveredCard && isMobile"
          class="modal-overlay"
          @click="closeModal"
        >
          <div class="modal-content" @click.stop>
            <div class="modal-card">
              <img 
                :src="getCardImageUrl(hoveredCard)" 
                :alt="hoveredCard"
                class="modal-card-image"
                @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22280%22%3E%3Crect width=%22200%22 height=%22280%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.decklist-wrapper {
  max-width: 1200px;
}

.decklist-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 0.25rem;
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
  margin-top: 0.15rem;
  margin-bottom: 0.35rem;
}

:deep(.main-deck li),
:deep(.sideboard li) {
  margin: 0;
  padding: 0;
  line-height: 1.4;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-card {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card-image {
  max-width: 100%;
  max-height: 85vh;
  width: auto;
  height: auto;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

@media (max-width: 1400px) {
  .decklist-wrapper {
    max-width: 100%;
  }
}

/* Adjust column proportions between 768px and 1024px */
@media (max-width: 1024px) {
  .decklist-grid {
    grid-template-columns: 1.5fr 1fr 1.5fr;
  }
}

@media (max-width: 768px) {
  .decklist-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  /* Hide card preview entirely on small screens */
  .card-preview {
    display: none;
  }
}
</style>
