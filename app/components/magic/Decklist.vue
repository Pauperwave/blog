<script setup lang="ts">
import { formatDecklistForMTGO, safeParse } from '#shared/utils'
import { provideDecklistContext, type DecklistContext } from '~/composables/useDecklistContext'
import { useDecklistStyles } from '~/composables/useDecklistStyles'
import type { ManaCombination } from './card/ManaSymbol.vue'
import DecklistHeader from './DecklistHeader.vue'
import DecklistSection from './DecklistSection.vue'
import DecklistStats from './DecklistStats.vue'

/**
 * Props for Decklist component
 */
const props = defineProps<{
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
}>()

const anchorId = computed(() =>
  props.player
    ? `deck-${slugify(props.name)}-${slugify(props.player)}`
    : `deck-${slugify(props.name)}`
)

const toast = useToast()

const SECTIONS = ['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments', 'Lands', 'Sideboard'] as const

const { headerClass } = useDecklistStyles(props.headerGradient)

const cardsBySection = computed(() =>
  safeParse<Record<string, ParsedCard[]>>(props.parsedCards, {}, 'parsedCards')
)

const counts = computed(() =>
  safeParse<Record<string, number>>(props.sectionCounts, {}, 'sectionCounts')
)

const mainDeckSections = computed(() =>
  SECTIONS.filter(s => s !== 'Sideboard' && (cardsBySection.value[s] ?? []).length > 0)
)

const hasSideboard = computed(() => (cardsBySection.value['Sideboard'] ?? []).length > 0)

const { isMobile } = useDevice()
const showStats = ref(false)
const deckStats = computed(() => computeDeckStats(cardsBySection.value))

// Lets the mobile card modal show the deck header and swipe between the deck's cards
const swipeCards = computed(() => {
  const seen = new Set<string>()
  const result: DecklistContext['cards'] = []
  for (const section of SECTIONS) {
    for (const card of cardsBySection.value[section] ?? []) {
      const key = `${section}-${card.name}`
      if (!card.imageUrl || seen.has(key)) continue
      seen.add(key)
      result.push({ name: card.name, section, quantity: card.quantity, imageUrl: card.imageUrl, backImageUrl: card.backImageUrl })
    }
  }
  return result
})
provideDecklistContext(computed(() => ({
  header: { name: props.name, player: props.player, placement: props.placement, headerGradient: props.headerGradient },
  cards: swipeCards.value
})))

// Copy decklist to clipboard (MTGO format)
async function copyDecklist() {
  const decklistText = formatDecklistForMTGO(
    mainDeckSections.value,
    cardsBySection.value,
    hasSideboard.value
  )

  try {
    await navigator.clipboard.writeText(decklistText)
    toast.add({
      title: 'Copiato!',
      description: 'Decklist copiata negli appunti',
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'Copia non riuscita',
      description: 'Impossibile copiare la decklist negli appunti',
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
      <template v-if="!props.headerOnly" #default>
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
              section="Sideboard"
              :cards="cardsBySection['Sideboard'] ?? []"
              :count="counts['Sideboard'] ?? 0"
            />
          </div>
        </div>
      </template>

      <!-- Footer -->
      <template v-if="!props.headerOnly" #footer>
        <div class="flex gap-2 flex-wrap">
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
          <UButton
            v-if="isMobile"
            icon="i-lucide-chart-column"
            size="sm"
            variant="subtle"
            class="cursor-pointer"
            aria-label="Mostra le statistiche del mazzo"
            label="Statistiche"
            @click="showStats = true"
          />
        </div>
      </template>
    </UCard>

    <!-- Mobile stats overlay -->
    <UModal
      v-if="isMobile"
      v-model:open="showStats"
      :title="`Statistiche - ${name}`"
      :description="`Statistiche del mazzo ${name}`"
    >
      <template #body>
        <DecklistStats :stats="deckStats" />
      </template>
    </UModal>
  </div>
</template>
