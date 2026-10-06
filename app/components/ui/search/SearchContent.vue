<script setup lang="ts">

const { files, status, load } = useSearchIndex()
const { open } = useContentSearch()

// The index is not loaded with the page: it starts when the search opens or the button is near
watch(open, (isOpen) => {
  if (isOpen) load()
})

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
        to: deckPreviewPath(f.id, d.anchorId),
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
      :loading="status === 'pending'"
      :fuse="fuseOptions"
    >
      <template #empty>
        Nessun risultato trovato
      </template>
    </LazyUContentSearch>
  </ClientOnly>
</template>
