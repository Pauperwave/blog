<script setup lang="ts">
const props = defineProps<{
  matchup?: string
  description?: string
}>()

const decklistContent = ref<HTMLElement | null>(null)

interface CardItem {
  quantity: string
  name: string
  imageUrl?: string
  manaCost: string
}

const cardsIn = ref<CardItem[]>([])
const cardsOut = ref<CardItem[]>([])
const cardsOutAlt = ref<CardItem[]>([])

// Cache for card data (removed mana symbol cache)
const cardDataCache = ref<Map<string, { manaCost: string, imageUrl: string }>>(new Map())

const hasAlternative = computed(() => cardsOutAlt.value.length > 0)

const extractCardName = (text: string): string => {
  return text.replace(/^\d+\s+/, '').trim()
}

const extractQuantity = (text: string): string => {
  const match = text.match(/^(\d+)\s+/)
  return match ? match[1]! : ''
}

const fetchCardData = async (cardName: string): Promise<{ manaCost: string, imageUrl: string }> => {
  if (cardDataCache.value.has(cardName)) {
    return cardDataCache.value.get(cardName)!
  }

  try {
    const encodedName = encodeURIComponent(cardName)
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`)
    
    if (!response.ok) throw new Error('Card not found')

    const data = await response.json()
    const manaCost = data.mana_cost || ''
    
    // Get the image URL for caching
    const imageUrl = data.image_uris?.normal || data.image_uris?.large || ''

    const cardData = { manaCost, imageUrl }
    cardDataCache.value.set(cardName, cardData)
    return cardData
  } catch (error) {
    console.error(`Error fetching card data for ${cardName}:`, error)
    return { manaCost: '', imageUrl: '' }
  }
}

const processCards = async () => {
  if (!decklistContent.value) return

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
          imageUrl: cardData.imageUrl,
          manaCost: cardData.manaCost
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
          imageUrl: cardData.imageUrl,
          manaCost: cardData.manaCost
        })
      }
    }
  }

  return cards
}

const totalIn = computed(() => {
  return cardsIn.value.reduce((sum, card) => sum + parseInt(card.quantity || '0'), 0)
})

const totalOut = computed(() => {
  return cardsOut.value.reduce((sum, card) => sum + parseInt(card.quantity || '0'), 0)
})

onMounted(() => {
  nextTick(() => {
    processCards()
  })
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
            <h4 class="font-semibold">
              Sideboard In
            </h4>
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
                <CardTooltip :name="card.name" :image="card.imageUrl" />
              </span>
              <ManaCost v-if="card.manaCost" :cost="card.manaCost" class="card-mana-cost" />
            </li>
          </ul>
        </div>

        <!-- Cards Out (Right) -->
        <div class="cards-section out-section">
          <div class="section-header">
            <UIcon
              name="i-lucide-minus-circle"
              class="size-5 text-red-500"
            />
            <h4 class="font-semibold">
              Sideboard Out
            </h4>
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
                <CardTooltip :name="card.name" :image="card.imageUrl" />
              </span>
              <ManaCost v-if="card.manaCost" :cost="card.manaCost" class="card-mana-cost" />
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
                  <CardTooltip :name="card.name" :image="card.imageUrl" />
                </span>
                <ManaCost v-if="card.manaCost" :cost="card.manaCost" class="card-mana-cost" />
              </li>
            </ul>
          </template>
        </div>
      </div>
    </template>
  </UCard>
</template>

<style scoped>
.sideboard-guide-wrapper {
  max-width: 900px;
}

.sideboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.cards-section {
  padding: 0;
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
  background: var(--ui-bg);
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
  grid-template-columns: auto 1fr auto;
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

.card-name-wrapper {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-mana-cost {
  min-width: 60px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .sideboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
