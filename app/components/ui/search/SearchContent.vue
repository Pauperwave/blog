<script setup lang="ts">

const nuxtApp = useNuxtApp()

const { data: files } = useLazyAsyncData(
  'search',
  async () => {

    const [decklists, articles, reports, tutorials, spoilers, decklistDocs] = await Promise.all([
      queryCollectionSearchSections('decklists'),
      queryCollectionSearchSections('articles'),
      queryCollectionSearchSections('reports'),
      queryCollectionSearchSections('tutorials'),
      queryCollectionSearchSections('spoilers'),
      queryCollection('decklists').select('path', '_decks').all(),
    ])

    // 4. NUOVO: costruisce la mappa path -> deck
    const decksByPath = new Map(decklistDocs.map(doc => [doc.path, doc._decks ?? []]))

    return [
      ...decklists.map(f => ({ ...f, _collection: 'decklists' })),
      ...articles.map(f => ({ ...f, _collection: 'articles' })),
      ...reports.map(f => ({ ...f, _collection: 'reports' })),
      ...tutorials.map(f => ({ ...f, _collection: 'tutorials' })),
      ...spoilers.map(f => ({ ...f, _collection: 'spoilers' })),
    ]
      .filter(f => f.title?.trim() !== '' && !f.id.includes('template') && f.level === 1)
      .map(f => ({
        id: f.id,
        title: f.title,
        _collection: f._collection,
        _date: f.id.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '',
        _summary: f.content?.trim().replace(/\s+/g, ' ').slice(0, 100) ?? '',
        _decks: decksByPath.get(f.id) ?? [],
      }))
      .sort((a, b) => b._date.localeCompare(a._date))
  },
  {
    server: false,
    getCachedData: key => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
  }
)

const searchTerm = ref('')

const collections = [
  { key: 'decklists', label: 'Decklist', icon: 'i-lucide-layers' },
  { key: 'articles',  label: 'Articoli', icon: 'i-lucide-newspaper' },
  { key: 'reports',   label: 'Report',   icon: 'i-lucide-chart-bar' },
  { key: 'tutorials', label: 'Tutorial', icon: 'i-lucide-graduation-cap' },
  { key: 'spoilers',  label: 'Spoiler',  icon: 'i-lucide-sparkles' },
]

const filesByCollection = computed(() => {
  const map: Record<string, typeof files.value> = {}
  for (const f of files.value ?? []) {
    if (!map[f._collection]) map[f._collection] = []
    map[f._collection]!.push(f)
  }
  return map
})

const LINKS_GROUP = {
  id: 'collegamenti',
  label: 'Collegamenti',
  items: [
    { label: 'Eventi',    icon: 'i-lucide-calendar',      to: '/articles?category=decklist' },
    { label: 'Articoli',  icon: 'i-lucide-newspaper',      to: '/articles?category=article' },
    { label: 'Report',    icon: 'i-lucide-chart-bar',       to: '/articles?category=report' },
    { label: 'Tutorial',  icon: 'i-lucide-graduation-cap', to: '/articles?category=tutorial' },
    { label: 'Spoiler',   icon: 'i-lucide-sparkles',        to: '/articles?category=spoiler' },
  ]
}

const groups = computed(() => [
  LINKS_GROUP,
  // Articoli eventi (ex decklists)
  {
    id: 'eventi',
    label: 'Eventi',
    items: (filesByCollection.value['decklists'] ?? [])
      .map(f => ({
        label: f.title,
        suffix: f._summary,
        to: f.id,
        icon: 'i-lucide-newspaper',
      }))
  },
  // Singoli mazzi estratti dagli eventi
  {
    id: 'decklist',
    label: 'Decklist',
    items: (filesByCollection.value['decklists'] ?? [])
      .flatMap(f => f._decks.map(d => ({
        label: d.name,
        suffix: [d.player, f.title].filter(Boolean).join(' · '),
        to: `${f.id}#${d.anchorId}`,
        icon: 'i-lucide-layers',
      })))
  },
  ...collections
    .filter(c => c.key !== 'decklists')
    .map(({ key, label, icon }) => ({
      id: key,
      label,
      items: (filesByCollection.value[key] ?? [])
        .map(f => ({
          label: f.title,
          suffix: f._summary,
          to: f.id,
          icon,
        }))
    }))
])

const fuseOptions = {
  resultLimit: 25,
  fuseOptions: {
    threshold: 0.3,
    keys: ['label', 'suffix'],
  },
}
</script>

<template>
  <ClientOnly>
    <LazyUContentSearch
      v-model:search-term="searchTerm"
      shortcut="meta_k"
      placeholder="Cerca..."
      :groups="groups"
      :color-mode="false"
      :fuse="fuseOptions"
    >
      <template #empty>
        Nessun risultato trovato
      </template>
    </LazyUContentSearch>
  </ClientOnly>
</template>
