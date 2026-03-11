<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () =>
  queryCollectionNavigation('docs')
)

const { data: files } = useLazyAsyncData(
  'search',
  async () => {
    const [docs, articles, tutorials, decklists, reports, spoilers] = await Promise.all([
      queryCollectionSearchSections('docs'),
      queryCollectionSearchSections('articles'),
      queryCollectionSearchSections('tutorials'),
      queryCollectionSearchSections('decklists'),
      queryCollectionSearchSections('reports'),
      queryCollectionSearchSections('spoilers'),
    ])
    return [...docs, ...articles, ...tutorials, ...decklists, ...reports, ...spoilers]
  },
  { server: false }
)

const searchTerm = ref('')

const links = [
  { label: 'Docs', icon: 'i-lucide-book-open', to: '/docs' },
  { label: 'Articoli', icon: 'i-lucide-newspaper', to: '/articles' },
  { label: 'Tutorial', icon: 'i-lucide-graduation-cap', to: '/articles?category=tutorial' },
  { label: 'Decklist', icon: 'i-lucide-layers', to: '/articles?category=decklist' },
  { label: 'Report', icon: 'i-lucide-chart-bar', to: '/articles?category=report' },
  { label: 'Spoiler', icon: 'i-lucide-sparkles', to: '/articles?category=spoiler' },
]
</script>

<template>
  <ClientOnly>
    <LazyUContentSearch
      v-model:search-term="searchTerm"
      :files="files ?? []"
      :navigation="navigation ?? []"
      :links="links"
      :fuse="{ resultLimit: 42, fuseOptions: { threshold: 0.3 } }"
      shortcut="meta_k"
      placeholder="Cerca articoli, guide, decklist..."
      empty-state="Nessun risultato trovato"
      :groups="[
        { label: 'Collegamenti rapidi', commands: links },
      ]"
    />
  </ClientOnly>
</template>