<script setup lang="ts">
import MagicCardTypesIcon from './CardTypesIcon.vue'

const props = defineProps<{
  name: string
  player?: string
  placement?: string
  parsedCards?: string
  sectionCounts?: string
}>()

const toast = useToast()

const SECTIONS = ['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments', 'Lands', 'Sideboard'] as const

// Parse data from transformer
const cardsBySection = computed(() => {
  if (!props.parsedCards) return {}
  try {
    return JSON.parse(props.parsedCards) as Record<string, ParsedCard[]>
  } catch (e) {
    console.error('Failed to parse parsedCards:', e)
    return {}
  }
})

const counts = computed(() => {
  if (!props.sectionCounts) return {}
  try {
    return JSON.parse(props.sectionCounts) as Record<string, number>
  } catch (e) {
    console.error('Failed to parse sectionCounts:', e)
    return {}
  }
})

// Separate main deck and sideboard
const mainDeckSections = computed(() => {
  return SECTIONS.filter(s => s !== 'Sideboard' && cardsBySection.value[s]?.length > 0)
})

const sideboardSections = computed(() => {
  return cardsBySection.value['Sideboard']?.length > 0 ? ['Sideboard'] : []
})

// Copy decklist to clipboard (MTGO format)
async function copyDecklist() {
  let decklistText = ''

  // Add main deck
  mainDeckSections.value.forEach((section) => {
    cardsBySection.value[section]?.forEach((card) => {
      decklistText += `${card.quantity} ${card.name}\n`
    })
  })

  // Add sideboard
  if (sideboardSections.value.length > 0) {
    decklistText += '\nSideboard\n'
    cardsBySection.value['Sideboard']?.forEach((card) => {
      decklistText += `${card.quantity} ${card.name}\n`
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
</script>

<template>
  <UCard
    class="decklist-wrapper mx-auto"
    :ui="{
      root: 'overflow-hidden',
      header: 'relative'
    }"
  >
    <!-- Header -->
    <template #header>
      <div class="header-bar">
        <div class="header-top">
          <h2 class="text-lg font-semibold header-title">{{ name }}</h2>
          <div v-if="placement" class="placement font-semibold">
            {{ placement }}
          </div>
        </div>
        <p v-if="player" class="text-md dark:text-gray-400 header-player">
          {{ player }}
        </p>
      </div>
    </template>

    <!-- Body - Two-column layout -->
    <template #default>
      <div class="decklist-grid">
        <!-- Main Deck (Left) -->
        <div class="main-deck">
          <div v-for="section in mainDeckSections" :key="section" class="section">
            <h2 class="section-heading">
              <MagicCardTypesIcon :type="section" size="md" class="section-type-icon" />
              {{ section }} <span class="card-count">({{ counts[section] }})</span>
            </h2>
            <ul class="card-list">
              <li v-for="(card, index) in cardsBySection[section]" :key="`${section}-${index}`" class="card-item">
                <span class="card-quantity">{{ card.quantity }}</span>
                <MagicCardTooltip :name="card.name" :image="card.imageUrl" />
                <MagicCardManaCost v-if="card.manaCost" :cost="card.manaCost" class="card-mana-cost" />
              </li>
            </ul>
          </div>
        </div>

        <!-- Sideboard (Right) -->
        <div class="sideboard">
          <div v-for="section in sideboardSections" :key="section" class="section">
            <h2 class="section-heading">
              <MagicCardTypesIcon :type="section" size="md" class="section-type-icon" />
              {{ section }} <span class="card-count">({{ counts[section] }})</span>
            </h2>
            <ul class="card-list">
              <li v-for="(card, index) in cardsBySection[section]" :key="`${section}-${index}`" class="card-item">
                <span class="card-quantity">{{ card.quantity }}</span>
                <MagicCardTooltip :name="card.name" :image="card.imageUrl" />
                <MagicCardManaCost v-if="card.manaCost" :cost="card.manaCost" class="card-mana-cost" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <UButton
        icon="i-lucide-copy"
        size="sm"
        variant="subtle"
        class="cursor-pointer"
        title="Copia decklist"
        aria-label="Copia decklist negli appunti"
        label="Copia per MTGO"
        @click="copyDecklist"
      />
    </template>
  </UCard>
</template>

<style scoped>
.decklist-wrapper {
  max-width: 900px;
}

.decklist-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.section {
  margin-bottom: 0.5rem;
}

.section-heading {
  margin-top: 0.6rem;
  margin-bottom: 0.15rem;
  font-size: 1.05rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.section-type-icon {
  display: inline-flex;
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
  grid-template-columns: auto 1fr auto;
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

.card-mana-cost {
  min-width: 60px;
  justify-content: flex-start;
}


.header-bar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.35rem;
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.header-title {
  line-height: 1.2;
}

.placement {
  text-align: right;
}

.header-player {
  line-height: 1.2;
}

@media (min-width: 640px) {
  .header-bar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .decklist-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
