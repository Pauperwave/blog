<script setup lang="ts">
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
  categoryFilterOptions: CategoryFilterOption[]
  authorFilterOptions: AuthorFilterOption[]
  locationFilterOptions: LocationFilterOption[]
  tagFilterOptions: TagFilterOption[]
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'set-category' | 'set-author' | 'set-location' | 'set-tag', value: string | null): void
  (e: 'clear-all'): void
}>();

const normalizeFilterValue = (value: string) => value.trim().toLocaleLowerCase('it');

const isSelectedLocationValue = (location: string) =>
  !!props.selectedLocation && normalizeFilterValue(location) === normalizeFilterValue(props.selectedLocation);

const isSelectedTagValue = (tag: string) =>
  !!props.selectedTag && normalizeFilterValue(tag) === normalizeFilterValue(props.selectedTag);
</script>

<template>
  <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-4 md:p-6 mb-6">
    <div class="flex items-start justify-between gap-3 flex-wrap mb-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
          Filtri
        </p>
        <h2 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
          Trova gli articoli piu rilevanti
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ resultsCount }} risultati su {{ totalCount }}
        </p>
      </div>

      <UButton
        v-if="hasActiveFilters"
        size="sm"
        color="error"
        variant="subtle"
        @click="emit('clear-all')"
      >
        Reset filtri
      </UButton>
    </div>

    <div
      v-if="hasActiveFilters"
      class="mb-4 flex items-center gap-2 flex-wrap rounded-lg border border-warning-200/60 dark:border-warning-800/40 bg-warning-50/50 dark:bg-warning-950/10 px-3 py-2"
    >
      <span class="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">
        Filtri attivi
      </span>
      <UBadge
        v-if="selectedCategoryLabel"
        color="neutral"
        variant="soft"
      >
        Categoria: {{ selectedCategoryLabel }}
      </UBadge>
      <UBadge
        v-if="selectedAuthorLabel"
        color="neutral"
        variant="soft"
      >
        Autore: {{ selectedAuthorLabel }}
      </UBadge>
      <UBadge
        v-if="selectedLocationLabel"
        color="warning"
        variant="soft"
      >
        Luogo: {{ selectedLocationLabel }}
      </UBadge>
      <UBadge
        v-if="selectedTagLabel"
        color="primary"
        variant="soft"
      >
        Tag: {{ selectedTagLabel }}
      </UBadge>
    </div>

    <div class="space-y-4">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <p class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Categoria
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ categoryFilterOptions.length }} categorie
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            size="xs"
            color="neutral"
            :variant="selectedCategory === null ? 'solid' : 'outline'"
            @click="emit('set-category', null)"
          >
            Tutte le categorie
          </UButton>
          <UButton
            v-for="item in categoryFilterOptions"
            :key="item.category"
            size="xs"
            color="neutral"
            :variant="selectedCategory === item.category ? 'solid' : 'outline'"
            @click="emit('set-category', item.category)"
          >
            {{ item.label }} ({{ item.count }})
          </UButton>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <p class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Autore
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ authorFilterOptions.length }} autori
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            size="xs"
            color="neutral"
            :variant="selectedAuthor === null ? 'solid' : 'outline'"
            @click="emit('set-author', null)"
          >
            Tutti gli autori
          </UButton>
          <UButton
            v-for="author in authorFilterOptions"
            :key="author.slug"
            size="xs"
            color="neutral"
            :variant="selectedAuthor === author.slug ? 'solid' : 'outline'"
            @click="emit('set-author', author.slug)"
          >
            {{ author.name }} ({{ author.count }})
          </UButton>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <p class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Luogo
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ locationFilterOptions.length }} localita
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            size="xs"
            color="warning"
            :variant="selectedLocation === null ? 'solid' : 'outline'"
            @click="emit('set-location', null)"
          >
            Tutte le localita
          </UButton>
          <UButton
            v-for="location in locationFilterOptions"
            :key="location.location"
            size="xs"
            color="warning"
            :variant="isSelectedLocationValue(location.location) ? 'solid' : 'outline'"
            @click="emit('set-location', location.location)"
          >
            {{ location.location }} ({{ location.count }})
          </UButton>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <p class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            Tag
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ tagFilterOptions.length }} tag
          </p>
        </div>
        <div class="max-h-36 overflow-y-auto pr-1">
          <div class="flex flex-wrap gap-2">
            <UButton
              size="xs"
              color="primary"
              :variant="selectedTag === null ? 'solid' : 'outline'"
              @click="emit('set-tag', null)"
            >
              Tutti i tag
            </UButton>
            <UButton
              v-for="tag in tagFilterOptions"
              :key="tag.tag"
              size="xs"
              color="primary"
              :variant="isSelectedTagValue(tag.tag) ? 'solid' : 'outline'"
              @click="emit('set-tag', tag.tag)"
            >
              {{ tag.tag }} ({{ tag.count }})
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
