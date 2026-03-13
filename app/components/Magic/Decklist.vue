<script setup lang="ts">
import MagicCardTypesIcon from './card/TypesIcon.vue'

const props = defineProps<{
  name: string
  player?: string
  placement?: string
  parsedCards?: string
  sectionCounts?: string
  headerGradient?: string
}>()

const anchorId = computed(() =>
  props.player
    ? `deck-${slugify(props.name)}-${slugify(props.player)}`
    : `deck-${slugify(props.name)}`
)

const toast = useToast()

const SECTIONS = ['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments', 'Lands', 'Sideboard'] as const

const GRADIENT_CLASSES: Record<string, string> = {
  // Mono colors
  monowhite: 'bg-gradient-to-r from-amber-100 via-amber-100 to-transparent',
  monoblue: 'bg-gradient-to-r from-blue-600 via-blue-600 to-transparent',
  monoblack: 'bg-gradient-to-r from-gray-950 via-gray-950 to-transparent',
  monored: 'bg-gradient-to-r from-red-600 via-red-600 to-transparent',
  monogreen: 'bg-gradient-to-r from-green-600 via-green-600 to-transparent',
  colorless: 'bg-gradient-to-r from-gray-300 via-gray-300 to-transparent',

  // Two-color combinations
  gruul: 'bg-gradient-to-r from-red-600 to-green-600',
  azorius: 'bg-gradient-to-r from-amber-100 to-blue-600',
  dimir: 'bg-gradient-to-r from-blue-600 to-gray-950',
  boros: 'bg-gradient-to-r from-red-600 to-amber-100',
  golgari: 'bg-gradient-to-r from-gray-950 to-green-600',
  izzet: 'bg-gradient-to-r from-blue-600 to-red-600',
  orzhov: 'bg-gradient-to-r from-amber-100 to-gray-950',
  rakdos: 'bg-gradient-to-r from-gray-950 to-red-600',
  selesnya: 'bg-gradient-to-r from-green-600 to-amber-100',
  simic: 'bg-gradient-to-r from-green-600 to-blue-600',

  // Three-color combinations
  esper: 'bg-gradient-to-r from-amber-100 via-blue-600 to-gray-950',
  grixis: 'bg-gradient-to-r from-blue-600 via-gray-950 to-red-600',
  jund: 'bg-gradient-to-r from-gray-950 via-red-600 to-green-600',
  naya: 'bg-gradient-to-r from-red-600 via-green-600 to-amber-100',
  bant: 'bg-gradient-to-r from-green-600 via-amber-100 to-blue-600',
  mardu: 'bg-gradient-to-r from-amber-100 via-gray-950 to-red-600',
  temur: 'bg-gradient-to-r from-blue-600 via-red-600 to-green-600',
  sultai: 'bg-gradient-to-r from-gray-950 via-green-600 to-blue-600',
  jeskai: 'bg-gradient-to-r from-red-600 via-amber-100 to-blue-600',
  abzan: 'bg-gradient-to-r from-amber-100 via-gray-950 to-green-600'
}

const headerClass = computed(() => {
  if (!props.headerGradient) return undefined
  const key = props.headerGradient.trim().toLowerCase()
  const result = GRADIENT_CLASSES[key]

  if (!result) {
    console.warn('[Decklist] Unknown headerGradient key:', key)
    return 'bg-gradient-to-r from-gray-300 via-gray-300 to-transparent'
  }

  // console.info('[Decklist] headerGradient class:', result, 'key:', key)
  return result
})

const LIGHT_GRADIENTS = new Set(['monowhite', 'azorius', 'orzhov', 'esper', 'mardu', 'abzan'])

const normalizedGradient = computed(() => (props.headerGradient || '').trim().toLowerCase())

const isLightGradient = computed(() => 
  LIGHT_GRADIENTS.has(normalizedGradient.value)
)

const textClasses = computed(() => ({
  heading: isLightGradient.value ? 'text-gray-900 dark:text-gray-900' : 'text-gray-900 dark:text-gray-100',
  subheading: isLightGradient.value ? 'text-gray-700 dark:text-gray-700' : 'text-gray-700 dark:text-gray-300'
}))


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
  return SECTIONS.filter(s => s !== 'Sideboard' && (cardsBySection.value[s] ?? []).length > 0)
})

const sideboardSections = computed(() => {
  return (cardsBySection.value['Sideboard'] ?? []).length > 0 ? ['Sideboard'] : []
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
  <div :id="anchorId">
    <UCard
      ref="decklistCard"
      class="decklist-wrapper mx-auto mb-6"
      :ui="{
        root: 'overflow-hidden',
        header: ['relative p-4', headerClass].filter(Boolean).join(' '),
        footer: 'data-html2canvas-ignore'
      }"
    >
      <!-- Header -->
      <template #header>
        <div class="flex flex-col gap-1">
          <div class="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-2">
            <div class="flex flex-col gap-1">
              <h2
                class="text-xl font-semibold leading-tight m-0"
                :class="textClasses.heading"
              >
                {{ name }}
              </h2>
              <p
                v-if="player"
                class="text-base leading-tight m-0"
                :class="textClasses.subheading"
              >
                {{ player }}
              </p>
            </div>
            <div
              v-if="placement"
              class="text-right text-base font-semibold text-gray-900 dark:text-gray-100"
            >
              {{ placement }}
            </div>
          </div>
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
        <div class="flex gap-2 flex-wrap" data-html2canvas-ignore>
          <!-- Copy text for MTGO -->
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
        </div>
      </template>
    </UCard>
  </div>
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

@media (max-width: 768px) {
  .decklist-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
