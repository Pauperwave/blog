<script setup lang="ts">
interface ParsedCard {
  quantity: string
  name: string
  imageUrl?: string
  manaCost: string
}

const props = defineProps<{
  matchup?: string
  description?: string
  cardsInParsed?: string
  cardsOutParsed?: string
  cardsOutAltParsed?: string
}>()

// Parse pre-fetched card data from props
const cardsIn = computed(() => {
  if (!props.cardsInParsed) return []
  try {
    return JSON.parse(props.cardsInParsed) as ParsedCard[]
  } catch (e) {
    console.error('Failed to parse cardsInParsed:', e)
    return []
  }
})

const cardsOut = computed(() => {
  if (!props.cardsOutParsed) return []
  try {
    return JSON.parse(props.cardsOutParsed) as ParsedCard[]
  } catch (e) {
    console.error('Failed to parse cardsOutParsed:', e)
    return []
  }
})

const cardsOutAlt = computed(() => {
  if (!props.cardsOutAltParsed) return []
  try {
    return JSON.parse(props.cardsOutAltParsed) as ParsedCard[]
  } catch (e) {
    console.error('Failed to parse cardsOutAltParsed:', e)
    return []
  }
})

const hasAlternative = computed(() => cardsOutAlt.value.length > 0)

const totalIn = computed(() => {
  return cardsIn.value.reduce((sum, card) => sum + parseInt(card.quantity || '0'), 0)
})

const totalOut = computed(() => {
  return cardsOut.value.reduce((sum, card) => sum + parseInt(card.quantity || '0'), 0)
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
                <MagicCardTooltip :name="card.name" :image="card.imageUrl" />
              </span>
              <MagicCardManaCost v-if="card.manaCost" :cost="card.manaCost" class="card-mana-cost" />
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
                <MagicCardTooltip :name="card.name" :image="card.imageUrl" />
              </span>
              <MagicCardManaCost v-if="card.manaCost" :cost="card.manaCost" class="card-mana-cost" />
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
                  <MagicCardTooltip :name="card.name" :image="card.imageUrl" />
                </span>
                <MagicCardManaCost v-if="card.manaCost" :cost="card.manaCost" class="card-mana-cost" />
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
