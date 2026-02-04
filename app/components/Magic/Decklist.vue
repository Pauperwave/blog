<script setup lang="ts">
import MagicCardTypesIcon from './CardTypesIcon.vue'

const props = defineProps<{
  name: string
  player?: string
  placement?: string
  parsedCards?: string
  sectionCounts?: string
  headerGradient?: string
}>()

const toast = useToast()

// Template ref for image generation
const decklistCard = ref<HTMLElement>()

// Share image composable
const { downloadAsImage, copyToClipboard, isGenerating } = useShareImage({
  watermarkLogo: '/logo/pauperwave.png'
})

const SECTIONS = ['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments', 'Lands', 'Sideboard'] as const

const GRADIENT_CLASSES: Record<string, string> = {
  // Mono colors (colore pieno → trasparente)
  monowhite:
    'bg-[linear-gradient(to_right,theme(colors.amber.100)_0%,theme(colors.amber.100)_100%)]',
  monoblue:
    'bg-[linear-gradient(to_right,theme(colors.blue.600)_0%,theme(colors.blue.600)_100%)]',
  monoblack:
    'bg-[linear-gradient(to_right,theme(colors.gray.950)_0%,theme(colors.gray.950)_100%)]',
  monored:
    'bg-[linear-gradient(to_right,theme(colors.red.600)_0%,theme(colors.red.600)_100%)]',
  monogreen:
    'bg-[linear-gradient(to_right,theme(colors.green.600)_0%,theme(colors.green.600)_100%)]',
  colorless:
    'bg-[linear-gradient(to_right,theme(colors.gray.300)_0%,theme(colors.gray.300)_100%)]',

  // Two-color combinations (50 / 50 netto)
  gruul:
    'bg-[linear-gradient(to_right,theme(colors.red.600)_0%,theme(colors.red.600)_50%,theme(colors.green.600)_50%,theme(colors.green.600)_100%)]',
  azorius:
    'bg-[linear-gradient(to_right,theme(colors.amber.100)_0%,theme(colors.amber.100)_50%,theme(colors.blue.600)_50%,theme(colors.blue.600)_100%)]',
  dimir:
    'bg-[linear-gradient(to_right,theme(colors.blue.600)_0%,theme(colors.blue.600)_50%,theme(colors.gray.950)_50%,theme(colors.gray.950)_100%)]',
  boros:
    'bg-[linear-gradient(to_right,theme(colors.red.600)_0%,theme(colors.red.600)_50%,theme(colors.amber.100)_50%,theme(colors.amber.100)_100%)]',
  golgari:
    'bg-[linear-gradient(to_right,theme(colors.gray.950)_0%,theme(colors.gray.950)_50%,theme(colors.green.600)_50%,theme(colors.green.600)_100%)]',
  izzet:
    'bg-[linear-gradient(to_right,theme(colors.blue.600)_0%,theme(colors.blue.600)_50%,theme(colors.red.600)_50%,theme(colors.red.600)_100%)]',
  orzhov:
    'bg-[linear-gradient(to_right,theme(colors.amber.100)_0%,theme(colors.amber.100)_50%,theme(colors.gray.950)_50%,theme(colors.gray.950)_100%)]',
  rakdos:
    'bg-[linear-gradient(to_right,theme(colors.gray.950)_0%,theme(colors.gray.950)_50%,theme(colors.red.600)_50%,theme(colors.red.600)_100%)]',
  selesnya:
    'bg-[linear-gradient(to_right,theme(colors.green.600)_0%,theme(colors.green.600)_50%,theme(colors.amber.100)_50%,theme(colors.amber.100)_100%)]',
  simic:
    'bg-[linear-gradient(to_right,theme(colors.green.600)_0%,theme(colors.green.600)_50%,theme(colors.blue.600)_50%,theme(colors.blue.600)_100%)]',

  // Three-color combinations (33 / 33 / 33 netto)
  esper:
    'bg-[linear-gradient(to_right,theme(colors.amber.100)_0%,theme(colors.amber.100)_33%,theme(colors.blue.600)_33%,theme(colors.blue.600)_66%,theme(colors.gray.950)_66%,theme(colors.gray.950)_100%)]',
  grixis:
    'bg-[linear-gradient(to_right,theme(colors.blue.600)_0%,theme(colors.blue.600)_33%,theme(colors.gray.950)_33%,theme(colors.gray.950)_66%,theme(colors.red.600)_66%,theme(colors.red.600)_100%)]',
  jund:
    'bg-[linear-gradient(to_right,theme(colors.gray.950)_0%,theme(colors.gray.950)_33%,theme(colors.red.600)_33%,theme(colors.red.600)_66%,theme(colors.green.600)_66%,theme(colors.green.600)_100%)]',
  naya:
    'bg-[linear-gradient(to_right,theme(colors.red.600)_0%,theme(colors.red.600)_33%,theme(colors.green.600)_33%,theme(colors.green.600)_66%,theme(colors.amber.100)_66%,theme(colors.amber.100)_100%)]',
  bant:
    'bg-[linear-gradient(to_right,theme(colors.green.600)_0%,theme(colors.green.600)_33%,theme(colors.amber.100)_33%,theme(colors.amber.100)_66%,theme(colors.blue.600)_66%,theme(colors.blue.600)_100%)]',
  mardu:
    'bg-[linear-gradient(to_right,theme(colors.amber.100)_0%,theme(colors.amber.100)_33%,theme(colors.gray.950)_33%,theme(colors.gray.950)_66%,theme(colors.red.600)_66%,theme(colors.red.600)_100%)]',
  temur:
    'bg-[linear-gradient(to_right,theme(colors.blue.600)_0%,theme(colors.blue.600)_33%,theme(colors.red.600)_33%,theme(colors.red.600)_66%,theme(colors.green.600)_66%,theme(colors.green.600)_100%)]',
  sultai:
    'bg-[linear-gradient(to_right,theme(colors.gray.950)_0%,theme(colors.gray.950)_33%,theme(colors.green.600)_33%,theme(colors.green.600)_66%,theme(colors.blue.600)_66%,theme(colors.blue.600)_100%)]',
  jeskai:
    'bg-[linear-gradient(to_right,theme(colors.red.600)_0%,theme(colors.red.600)_33%,theme(colors.amber.100)_33%,theme(colors.amber.100)_66%,theme(colors.blue.600)_66%,theme(colors.blue.600)_100%)]',
  abzan:
    'bg-[linear-gradient(to_right,theme(colors.amber.100)_0%,theme(colors.amber.100)_33%,theme(colors.gray.950)_33%,theme(colors.gray.950)_66%,theme(colors.green.600)_66%,theme(colors.green.600)_100%)]'
}

const headerClass = computed(() => {
  if (!props.headerGradient) return undefined
  const key = props.headerGradient.trim().toLowerCase()
  const result = GRADIENT_CLASSES[key]
  
  if (!result) {
    console.warn('[Decklist] Unknown headerGradient key:', key)
    return 'bg-gradient-to-r from-gray-300 via-gray-300 to-transparent'
  }

  return result
})

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

// Download decklist as image
async function handleDownloadImage() {
  if (!decklistCard.value) return
  await downloadAsImage(decklistCard.value, props.name, props.player)
}

// Copy decklist image to clipboard
async function handleCopyImage() {
  if (!decklistCard.value) return
  await copyToClipboard(decklistCard.value)
}
</script>

<template>
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
            <h2 class="text-xl font-semibold leading-tight text-gray-900 dark:text-gray-100 m-0">
              {{ name }}
            </h2>
            <p v-if="player" class="text-base leading-tight text-gray-700 dark:text-gray-300 m-0">
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
        
        <!-- Download as image -->
        <UButton
          icon="i-lucide-download"
          size="sm"
          variant="subtle"
          class="cursor-pointer"
          title="Scarica immagine"
          aria-label="Scarica decklist come immagine"
          label="Scarica Immagine"
          :loading="isGenerating"
          :disabled="isGenerating"
          @click="handleDownloadImage"
        />
        
        <!-- Copy image to clipboard -->
        <UButton
          icon="i-lucide-image"
          size="sm"
          variant="subtle"
          class="cursor-pointer"
          title="Copia immagine"
          aria-label="Copia decklist come immagine negli appunti"
          label="Copia Immagine"
          :loading="isGenerating"
          :disabled="isGenerating"
          @click="handleCopyImage"
        />
      </div>
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

@media (max-width: 768px) {
  .decklist-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
