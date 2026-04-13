<script setup lang="ts">
import { normalizeArticleFilterValue } from '~/utils/article-filters'

interface CategoryFilterOption {
  category: string
  label: string
  count: number
}

interface AuthorFilterOption {
  slug: string
  name: string
  count: number
}

interface LocationFilterOption {
  location: string
  count: number
}

interface TagFilterOption {
  tag: string
  count: number
}

interface DeckFilterOption {
  tag: string
  count: number
}

interface Props {
  resultsCount: number
  totalCount: number
  hasActiveFilters: boolean
  selectedCategory: string | null
  selectedCategoryLabel: string | null
  selectedAuthor: string | null
  selectedAuthorLabel: string | null
  selectedLocation: string | null
  selectedLocationLabel: string | null
  selectedTag: string | null
  selectedTagLabel: string | null
  selectedDeck: string | null
  selectedDeckLabel: string | null
  categoryFilterOptions: CategoryFilterOption[]
  authorFilterOptions: AuthorFilterOption[]
  locationFilterOptions: LocationFilterOption[]
  tagFilterOptions: TagFilterOption[]
  deckFilterOptions: DeckFilterOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'set-category': [value: string | null]
  'set-author': [value: string | null]
  'set-location': [value: string | null]
  'set-tag': [value: string | null]
  'set-deck': [value: string | null]
  'clear-all': []
}>()

// Stato per il collapsible principale
const mainPanelOpen = ref(true)

// Transform options for FilterSection component
const categoryOptions = computed(() =>
  props.categoryFilterOptions.map(item => ({
    value: item.category,
    label: item.label,
    count: item.count
  }))
)

const authorOptions = computed(() =>
  props.authorFilterOptions.map(author => ({
    value: author.slug,
    label: author.name,
    count: author.count
  }))
)

const locationOptions = computed(() =>
  props.locationFilterOptions.map(location => ({
    value: normalizeArticleFilterValue(location.location),
    label: location.location,
    count: location.count
  }))
)

const tagOptions = computed(() =>
  props.tagFilterOptions.map(tag => ({
    value: normalizeArticleFilterValue(tag.tag),
    label: tag.tag,
    count: tag.count
  }))
)

const deckOptions = computed(() =>
  props.deckFilterOptions.map(deck => ({
    value: normalizeArticleFilterValue(deck.tag),
    label: deck.tag,
    count: deck.count
  }))
)

// Active filters for badges
const activeFilters = computed(() => {
  const filters = []

  if (props.selectedCategoryLabel) {
    filters.push({
      type: 'Categoria',
      label: props.selectedCategoryLabel,
      color: 'neutral' as const,
      clear: () => emit('set-category', null)
    })
  }

  if (props.selectedAuthorLabel) {
    filters.push({
      type: 'Autore',
      label: props.selectedAuthorLabel,
      color: 'neutral' as const,
      clear: () => emit('set-author', null)
    })
  }

  if (props.selectedLocationLabel) {
    filters.push({
      type: 'Luogo',
      label: props.selectedLocationLabel,
      color: 'info' as const,
      clear: () => emit('set-location', null)
    })
  }

  if (props.selectedTagLabel) {
    filters.push({
      type: 'Tag',
      label: props.selectedTagLabel,
      color: 'primary' as const,
      clear: () => emit('set-tag', null)
    })
  }

  return filters
})
</script>

<template>
  <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-3 md:p-6 mb-4 md:mb-6">
    <UCollapsible :default-open="true">
      <!-- Header sempre visibile -->
      <div class="mb-4">
        <div
          class="flex items-center gap-2 cursor-pointer"
          @click="mainPanelOpen = !mainPanelOpen"
        >
          <UIcon
            :name="mainPanelOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
            class="w-5 h-5 text-primary shrink-0"
          />
          <div class="flex-1">
            <p class="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
              Filtri
            </p>
            <h2 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-1">
              Trova gli articoli piu rilevanti
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ resultsCount }} risultati su {{ totalCount }}
            </p>
          </div>
        </div>
      </div>

      <!-- Filtri attivi sempre visibili -->
      <div
        v-if="hasActiveFilters"
        class="mb-4 flex items-center gap-2 flex-wrap rounded-lg border border-warning/40 dark:border-warning/50 bg-warning/10 dark:bg-warning/15 px-2 py-1.5 md:px-3 md:py-2 shadow-sm"
      >
        <span class="rounded-md bg-warning/15 dark:bg-warning/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-warning">
          Filtri attivi
        </span>

        <UBadge
          v-for="(filter, index) in activeFilters"
          :key="index"
          :color="filter.color"
          variant="solid"
          class="cursor-pointer transition-colors hover:bg-error/10 hover:text-error hover:ring hover:ring-inset hover:ring-error/25"
          @click="filter.clear()"
        >
          {{ filter.type }}: {{ filter.label }}
        </UBadge>

        <!-- Bottone Reset filtri -->
        <UButton
          size="sm"
          color="error"
          variant="subtle"
          class="ml-auto cursor-pointer"
          @click="emit('clear-all')"
        >
          Reset filtri
        </UButton>
      </div>

      <!-- Contenuto collassabile -->
      <template #content>
        <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <!-- Categoria -->
          <FilterSection
            label="Categoria (piu articoli)"
            plural-label="categorie"
            all-label="Tutte le categorie"
            color="neutral"
            :options="categoryOptions"
            :selected-value="selectedCategory"
            @select="emit('set-category', $event)"
          />

          <!-- Autore -->
          <FilterSection
            label="Autore (piu articoli)"
            plural-label="autori"
            all-label="Tutti gli autori"
            color="neutral"
            :options="authorOptions"
            :selected-value="selectedAuthor"
            :default-open="false"
            @select="emit('set-author', $event)"
          />

          <!-- Luogo -->
          <FilterSection
            label="Luogo (A-Z)"
            plural-label="localita"
            all-label="Tutte le localita"
            color="info"
            :options="locationOptions"
            :selected-value="selectedLocation"
            :default-open="false"
            @select="emit('set-location', $event)"
          />

          <!-- Deck -->
          <FilterSection
            v-if="deckOptions.length > 0"
            label="Deck (A-Z)"
            plural-label="deck"
            color="warning"
            :options="deckOptions"
            :selected-value="selectedDeck"
            all-label="Tutti i deck"
            :default-open="false"
            :max-height="true"
            @select="emit('set-deck', $event)"
          />

          <!-- Tags -->
          <FilterSection
            v-if="tagOptions.length > 0"
            label="Tag (A-Z)"
            plural-label="tag"
            color="primary"
            :options="tagOptions"
            :selected-value="selectedTag"
            all-label="Tutti i tag"
            :max-height="true"
            @select="emit('set-tag', $event)"
          />
        </div>
      </template>
    </UCollapsible>
  </section>
</template>
