<script setup lang="ts">
import {
  DECK_SECTIONS,
  MAIN_DECK_SECTIONS,
  SIDEBOARD_SECTION,
  formatDecklistForArena,
  formatDecklistForMTGO,
  safeParse
} from '#shared/utils'
import { provideDecklistContext, type DecklistHeaderInfo } from '~/composables/useDecklistContext'
import { uniqueDeckCards } from '~/utils/deck-cards'
import { useDecklistStyles } from '~/composables/useDecklistStyles'
import type { ManaCombination } from './card/ManaSymbol.vue'
import DecklistHeader from './DecklistHeader.vue'
import DecklistSection from './DecklistSection.vue'
import DecklistStats from './DecklistStats.vue'

/**
 * Props for Decklist component
 */
interface Props {
  /** Deck name */
  name: string
  /** Player name (optional) */
  player?: string
  /** Tournament placement (optional) */
  placement?: string
  /** JSON string of parsed cards by section */
  parsedCards?: string
  /** JSON string of section counts */
  sectionCounts?: string
  /** Mana combination for header gradient styling */
  headerGradient?: ManaCombination
  /** Show only the header, hide body and footer (default: false) */
  headerOnly?: boolean
}

const {
  name,
  player = undefined,
  placement = undefined,
  parsedCards = undefined,
  sectionCounts = undefined,
  headerGradient = undefined,
  headerOnly = false
} = defineProps<Props>()

const anchorId = computed(() =>
  player
    ? `deck-${slugify(name)}-${slugify(player)}`
    : `deck-${slugify(name)}`
)

const { copyToClipboard, copyLink } = useCopyToClipboard()

const { headerClass } = useDecklistStyles(headerGradient)

const cardsBySection = computed(() =>
  safeParse<Record<string, ParsedCard[]>>(parsedCards, {}, 'parsedCards')
)

const counts = computed(() =>
  safeParse<Record<string, number>>(sectionCounts, {}, 'sectionCounts')
)

const mainDeckSections = computed(() =>
  MAIN_DECK_SECTIONS.filter(section => (cardsBySection.value[section] ?? []).length > 0)
)

const sideboardCards = computed(() => cardsBySection.value[SIDEBOARD_SECTION] ?? [])
const hasSideboard = computed(() => sideboardCards.value.length > 0)

const { isMobile } = useDevice()
const showStats = ref(false)
// Loaded on first open only, so decklists that never open it don't pay for it
const DecklistOverlay = defineAsyncComponent(() => import('./DecklistOverlay.vue'))
const DecklistCardModal = defineAsyncComponent(() => import('./DecklistCardModal.vue'))
const showOverlay = ref(false)
const overlayRequested = ref(false)
const showCardModal = ref(false)
const cardModalRequested = ref(false)
const cardModalIndex = ref(0)
const deckStats = computed(() => computeDeckStats(cardsBySection.value))

// The price is looked up when a view that shows it opens (statistics or visual view)
const cardsToPrice = computed(() =>
  Object.values(cardsBySection.value).flat().map(({ name, quantity }) => ({ name, quantity }))
)
const { price, failed: priceFailed, load: loadPrice } = useDeckPrice(cardsToPrice)
watch([showStats, showOverlay], ([statsOpen, overlayOpen]) => {
  if (statsOpen || overlayOpen) loadPrice()
})
// Without player or placement the modal has no visible description (Nuxt UI adds a hidden one)
const statsDescription = computed(() =>
  [player, placement].filter(Boolean).join(' · ') || undefined
)

const headerInfo = computed<DecklistHeaderInfo>(() => ({
  name,
  player,
  placement,
  headerGradient
}))

// What the card viewers (modal, overlay) walk through
const deckCards = computed(() => uniqueDeckCards(cardsBySection.value, DECK_SECTIONS))

const openOverlay = () => {
  overlayRequested.value = true
  showOverlay.value = true
}

const { previewUrl: shareUrl, deckUrl } = useDeckPreviewLink(anchorId, showOverlay, openOverlay)

// Tapping a card name opens the swipeable modal on mobile, the deck overlay on desktop
const openCard = (name: string, section: string) => {
  if (!isMobile) {
    openOverlay()
    return
  }
  const index = deckCards.value.findIndex(
    card => card.name === name && (!section || card.section === section)
  )
  if (index < 0) return
  cardModalIndex.value = index
  cardModalRequested.value = true
  showCardModal.value = true
}

provideDecklistContext({ openCard })

// Copy decklist to clipboard in the import format of the given client
function copyDecklist(format: 'mtgo' | 'arena') {
  const formatDecklist = format === 'arena' ? formatDecklistForArena : formatDecklistForMTGO
  return copyToClipboard(
    formatDecklist(mainDeckSections.value, cardsBySection.value, hasSideboard.value),
    {
      successDescription: 'Decklist copiata negli appunti',
      errorDescription: 'Impossibile copiare la decklist negli appunti'
    }
  )
}
</script>

<template>
  <div :id="anchorId">
    <UCard
      ref="decklistCard"
      class="max-w-4xl mx-auto mb-6"
      :ui="{
        root: 'overflow-hidden',
        header: ['relative p-4', headerClass].filter(Boolean).join(' ')
      }"
    >
      <!-- Header: sempre visibile -->
      <template #header>
        <DecklistHeader
          :name="name"
          :player="player"
          :placement="placement"
          :header-gradient="headerGradient"
        />
      </template>

      <!-- Body - Two-column layout -->
      <template v-if="!headerOnly" #default>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
          <!-- Main Deck (Left) -->
          <div>
            <DecklistSection
              v-for="section in mainDeckSections"
              :key="section"
              :section="section"
              :cards="cardsBySection[section] ?? []"
              :count="counts[section] ?? 0"
            />
          </div>

          <!-- Sideboard (Right) -->
          <div v-if="hasSideboard">
            <DecklistSection
              :section="SIDEBOARD_SECTION"
              :cards="sideboardCards"
              :count="counts[SIDEBOARD_SECTION] ?? 0"
            />
          </div>
        </div>
      </template>

      <!-- Footer -->
      <template v-if="!headerOnly" #footer>
        <div class="flex gap-2 flex-wrap">
          <UButton
            icon="i-lucide-copy"
            size="sm"
            variant="subtle"
            class="cursor-pointer"
            title="Copia decklist"
            aria-label="Copia decklist negli appunti"
            label="Copia per MTGO"
            @click="copyDecklist('mtgo')"
          />
          <UButton
            icon="i-lucide-gamepad-2"
            size="sm"
            variant="subtle"
            class="cursor-pointer"
            title="Copia decklist per MTG Arena"
            aria-label="Copia decklist per MTG Arena"
            label="Esporta su Arena"
            @click="copyDecklist('arena')"
          />
          <UButton
            icon="i-lucide-chart-column"
            size="sm"
            variant="subtle"
            class="cursor-pointer"
            label="Statistiche"
            @click="showStats = true"
          />
          <UButton
            v-if="!isMobile"
            icon="i-lucide-layout-grid"
            size="sm"
            variant="subtle"
            class="cursor-pointer"
            label="Vista visuale"
            @click="openOverlay"
          />
          <UButton
            icon="i-lucide-share-2"
            size="sm"
            variant="subtle"
            class="cursor-pointer"
            label="Condividi"
            @click="copyLink(deckUrl)"
          />
        </div>
      </template>
    </UCard>

    <!-- Desktop overlay: card grid + stats -->
    <DecklistOverlay
      v-if="!isMobile && overlayRequested"
      v-model:open="showOverlay"
      :header="headerInfo"
      :cards="deckCards"
      :stats="deckStats"
      :price="price"
      :share-url="shareUrl"
    />

    <!-- Mobile card modal: swipe between the deck's cards -->
    <DecklistCardModal
      v-if="isMobile && cardModalRequested"
      v-model:open="showCardModal"
      :header="headerInfo"
      :cards="deckCards"
      :start-index="cardModalIndex"
    />

    <!-- Stats overlay -->
    <UModal
      v-model:open="showStats"
      :title="`Statistiche - ${name}`"
      :description="statsDescription"
    >
      <template #body>
        <DecklistStats
          :stats="deckStats"
          :price="price"
          :price-failed="priceFailed"
        />
      </template>
    </UModal>
  </div>
</template>
