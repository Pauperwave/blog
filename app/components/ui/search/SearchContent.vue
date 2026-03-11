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
  { label: 'Articles', icon: 'i-lucide-newspaper', to: '/articles' },
  { label: 'Tutorials', icon: 'i-lucide-graduation-cap', to: '/articles?category=tutorial' },
  { label: 'Decklists', icon: 'i-lucide-layers', to: '/articles?category=decklist' },
  { label: 'Reports', icon: 'i-lucide-chart-bar', to: '/articles?category=report' },
  { label: 'Spoilers', icon: 'i-lucide-sparkles', to: '/articles?category=spoiler' },
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
    />
  </ClientOnly>
</template>
