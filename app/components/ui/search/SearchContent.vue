<script setup lang="ts">
const { data: files } = useLazyAsyncData(
  'search',
  async () => {
    const [decklists, articles, reports, tutorials, spoilers] = await Promise.all([
      queryCollectionSearchSections('decklists'),
      queryCollectionSearchSections('articles'),
      queryCollectionSearchSections('reports'),
      queryCollectionSearchSections('tutorials'),
      queryCollectionSearchSections('spoilers'),
    ])
    return [
      ...decklists.map(f => ({ ...f, _collection: 'decklists' })),
      ...articles.map(f => ({ ...f, _collection: 'articles' })),
      ...reports.map(f => ({ ...f, _collection: 'reports' })),
      ...tutorials.map(f => ({ ...f, _collection: 'tutorials' })),
      ...spoilers.map(f => ({ ...f, _collection: 'spoilers' })),
    ].filter(f => f.title?.trim() !== '' && !f.id.includes('template') && f.level === 1)
  },
  { server: false }
)


const searchTerm = ref('')

const collections = [
  { key: 'decklists', label: 'Decklist', icon: 'i-lucide-layers' },
  { key: 'articles',  label: 'Articoli', icon: 'i-lucide-newspaper' },
  { key: 'reports',   label: 'Report',   icon: 'i-lucide-chart-bar' },
  { key: 'tutorials', label: 'Tutorial', icon: 'i-lucide-graduation-cap' },
  { key: 'spoilers',  label: 'Spoiler',  icon: 'i-lucide-sparkles' },
]

const groups = computed(() => [
  {
    id: 'collegamenti',
    label: 'Collegamenti',
    items: [
      { label: 'Decklist',  icon: 'i-lucide-layers', to: '/articles?category=decklist' },
      { label: 'Articoli',  icon: 'i-lucide-newspaper', to: '/articles?category=article' },
      { label: 'Report',    icon: 'i-lucide-chart-bar', to: '/articles?category=report' },
      { label: 'Tutorial',  icon: 'i-lucide-graduation-cap', to: '/articles?category=tutorial' },
      { label: 'Spoiler',   icon: 'i-lucide-sparkles', to: '/articles?category=spoiler' },
    ]
  },
  ...collections.map(({ key, label, icon }) => ({
    id: key,
    label,
    items: (files.value ?? [])
      .filter(f => f._collection === key)
      .sort((a, b) => {
        const dateA = a.id.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? ''
        const dateB = b.id.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? ''
        return dateB.localeCompare(dateA)
      })
      .slice(0, 5)
      .map(f => ({
        label: f.title,
        suffix: f.content?.slice(0, 100),
        to: f.id,
        icon,
      }))
  }))
])
</script>

<template>
  <ClientOnly>
    <LazyUContentSearch
      v-model:search-term="searchTerm"
      shortcut="meta_k"
      placeholder="Cerca articoli, guide, decklist..."
      :groups="groups"
      :color-mode="false"
      :fuse="{
        resultLimit: 25,
        fuseOptions: {
          threshold: 0.3,
          keys: ['label', 'suffix']
        }
      }"
    >
      <template #empty>
        Nessun risultato trovato
      </template>
    </LazyUContentSearch>
  </ClientOnly>
</template>
