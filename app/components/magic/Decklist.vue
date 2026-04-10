<script setup lang="ts">
import MagicCardTypesIcon from './card/TypesIcon.vue'
import MagicCardManaSymbol, { type ManaCombination } from './card/ManaSymbol.vue'

const props = defineProps<{
  name: string
  player?: string
  placement?: string
  parsedCards?: string
  sectionCounts?: string
  headerGradient?: ManaCombination
}>()

const anchorId = computed(() =>
  props.player
    ? `deck-${slugify(props.name)}-${slugify(props.player)}`
    : `deck-${slugify(props.name)}`
)

const toast = useToast()

const SECTIONS = ['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments', 'Lands', 'Sideboard'] as const

const GRADIENT_CLASSES: Record<ManaCombination, string> = {
  // Mono colors
  monowhite: 'bg-gradient-to-r from-amber-100 via-amber-100 to-transparent',
  monoblue: 'bg-gradient-to-r from-blue-600 via-blue-600 to-transparent',
  monoblack: 'bg-gradient-to-r from-gray-950 via-gray-950 to-transparent',
  monored: 'bg-gradient-to-r from-red-600 via-red-600 to-transparent',
  monogreen: 'bg-gradient-to-r from-green-600 via-green-600 to-transparent',
  colorless: 'bg-gradient-to-r from-gray-300 via-gray-300 to-transparent',

  // Two-color combinations (Ally colors - adiacenti nel cerchio di mana)
  azorius: 'bg-gradient-to-r from-amber-100 to-blue-600',
  dimir: 'bg-gradient-to-r from-blue-600 to-gray-950',
  rakdos: 'bg-gradient-to-r from-gray-950 to-red-600',
  gruul: 'bg-gradient-to-r from-red-600 to-green-600',
  selesnya: 'bg-gradient-to-r from-green-600 to-amber-100',

  // Two-color combinations (Enemy colors - opposti nel cerchio di mana)
  orzhov: 'bg-gradient-to-r from-amber-100 to-gray-950',
  golgari: 'bg-gradient-to-r from-gray-950 to-green-600',
  simic: 'bg-gradient-to-r from-green-600 to-blue-600',
  izzet: 'bg-gradient-to-r from-blue-600 to-red-600',
  boros: 'bg-gradient-to-r from-red-600 to-amber-100',

  // Three-color combinations (Shards)
  esper: 'bg-gradient-to-r from-amber-100 via-blue-600 to-gray-950',
  grixis: 'bg-gradient-to-r from-blue-600 via-gray-950 to-red-600',
  jund: 'bg-gradient-to-r from-gray-950 via-red-600 to-green-600',
  naya: 'bg-gradient-to-r from-red-600 via-green-600 to-amber-100',
  bant: 'bg-gradient-to-r from-green-600 via-amber-100 to-blue-600',

  // Three-color combinations (Wedges)
  mardu: 'bg-gradient-to-r from-amber-100 via-gray-950 to-red-600',
  temur: 'bg-gradient-to-r from-blue-600 via-red-600 to-green-600',
  sultai: 'bg-gradient-to-r from-gray-950 via-green-600 to-blue-600',
  jeskai: 'bg-gradient-to-r from-red-600 via-amber-100 to-blue-600',
  abzan: 'bg-gradient-to-r from-amber-100 via-gray-950 to-green-600'
}

const headerClass = computed(() =>
  props.headerGradient ? GRADIENT_CLASSES[props.headerGradient] : undefined
)

// Heading/Subheading con testo chiaro in dark mode
const LIGHT_TEXT = new Set<ManaCombination>([
  'monoblue', 'monoblack', 'monored', 'monogreen', 'gruul',
  'dimir', 'izzet', 'selesnya', 'boros', 'simic', 'sultai', 'jeskai', 'bant',
  'golgari', 'rakdos', 'grixis', 'jund', 'temur', 'naya'
])

// Mono colori: scuro in light mode, chiaro in dark mode
const MONO_PLACEMENT = new Set<ManaCombination>([
  'monowhite', 'monoblue', 'monoblack', 'monored', 'monogreen', 'colorless'
])

// Placement scuro in entrambe le modalità
// Note: boros, selesnya, naya use light heading text but dark placement text
const DARK_PLACEMENT = new Set<ManaCombination>([
  'boros', 'selesnya', 'naya'
])

const textClasses = computed(() => {
  const hg = props.headerGradient

  const lightText = hg && LIGHT_TEXT.has(hg)

  const placement = !hg || DARK_PLACEMENT.has(hg)
    ? 'text-gray-900'
    : MONO_PLACEMENT.has(hg)
      ? 'text-gray-900 dark:text-gray-100'
      : 'text-gray-100'

  return {
    heading: lightText ? 'text-gray-100' : 'text-gray-900',
    subheading: lightText ? 'text-gray-300' : 'text-gray-700',
    placement
  }
})

// Parse data from transformer
function safeParse<T>(json: string | undefined, fallback: T, label: string): T {
  if (!json) return fallback
  try { return JSON.parse(json) as T }
  catch (e) { console.error(`Failed to parse ${label}:`, e); return fallback }
}

const cardsBySection = computed(() =>
  safeParse<Record<string, ParsedCard[]>>(props.parsedCards, {}, 'parsedCards')
)

const counts = computed(() =>
  safeParse<Record<string, number>>(props.sectionCounts, {}, 'sectionCounts')
)

// Separate main deck and sideboard
const mainDeckSections = computed(() =>
  SECTIONS.filter(s => s !== 'Sideboard' && (cardsBySection.value[s] ?? []).length > 0)
)

const hasSideboard = computed(() => (cardsBySection.value['Sideboard'] ?? []).length > 0)

// Copy decklist to clipboard (MTGO format)
async function copyDecklist() {
  const mainLines = mainDeckSections.value.flatMap(section =>
    (cardsBySection.value[section] ?? []).map(c => `${c.quantity} ${c.name}`)
  )

  const sideLines = hasSideboard.value
    ? ['', 'Sideboard', ...(cardsBySection.value['Sideboard'] ?? []).map(c => `${c.quantity} ${c.name}`)]
    : []

  const decklistText = [...mainLines, ...sideLines].join('\n')

  try {
    await navigator.clipboard.writeText(decklistText)
    toast.add({
      title: 'Copied!',
      description: 'Decklist copied to clipboard',
      icon: 'i-lucide-check',
      color: 'success'
    })
  } catch {
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
      class="max-w-4xl mx-auto mb-6"
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
              <div class="flex items-center gap-2">
                <h2
                  class="text-xl font-semibold leading-tight m-0"
                  :class="textClasses.heading"
                >
                  {{ name }}
                </h2>
                <MagicCardManaSymbol
                  v-if="headerGradient"
                  :combination="headerGradient"
                />
              </div>
              <p
                v-if="player"
                class="text-base font-semibold leading-tight m-0"
                :class="textClasses.subheading"
              >
                {{ player }}
              </p>
            </div>
            <div
              v-if="placement"
              class="text-right text-base font-semibold"
              :class="textClasses.placement"
            >
              {{ placement }}
            </div>
          </div>
        </div>
      </template>

      <!-- Body - Two-column layout -->
      <template #default>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
          <!-- Main Deck (Left) -->
          <div>
            <div v-for="section in mainDeckSections" :key="section" class="mb-2">
              <h2 class="mt-2.5 first:mt-0 mb-0.5 text-base font-bold inline-flex items-center gap-1.5">
                <MagicCardTypesIcon :type="section" size="md" class="inline-flex" />
                {{ section }} <span class="font-medium opacity-80">({{ counts[section] }})</span>
              </h2>
              <ul class="list-none p-0 mt-0.5 mb-1.5">
                <li
                  v-for="(card, index) in cardsBySection[section]"
                  :key="`${section}-${index}`"
                  class="grid grid-cols-[auto_1fr_auto] items-center gap-2 m-0 p-0 leading-snug text-base font-medium"
                >
                  <span class="font-mono font-semibold">{{ card.quantity }}</span>
                  <MagicCardTooltip :name="card.name" :image="card.imageUrl" />
                  <MagicCardManaCost v-if="card.manaCost" :cost="card.manaCost" class="min-w-16 justify-start" />
                </li>
              </ul>
            </div>
          </div>

          <!-- Sideboard (Right) -->
          <div v-if="hasSideboard">
            <div class="mb-2">
              <h2 class="mt-2.5 first:mt-0 mb-0.5 text-base font-bold inline-flex items-center gap-1.5">
                <MagicCardTypesIcon type="Sideboard" size="md" class="inline-flex" />
                Sideboard <span class="font-medium opacity-80">({{ counts['Sideboard'] }})</span>
              </h2>
              <ul class="list-none p-0 mt-0.5 mb-1.5">
                <li
                  v-for="(card, index) in cardsBySection['Sideboard']"
                  :key="`sideboard-${index}`"
                  class="grid grid-cols-[auto_1fr_auto] items-center gap-2 m-0 p-0 leading-snug text-base font-medium"
                >
                  <span class="font-mono font-semibold">{{ card.quantity }}</span>
                  <MagicCardTooltip :name="card.name" :image="card.imageUrl" />
                  <MagicCardManaCost v-if="card.manaCost" :cost="card.manaCost" class="min-w-16 justify-start" />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>

      <!-- Footer -->
      <template #footer>
        <div class="flex gap-2 flex-wrap" data-html2canvas-ignore>
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
