<script setup lang="ts">
const { data: navigation } = await useAsyncData('navigation', () =>
  Promise.all([
    queryCollectionNavigation('articles'),
    queryCollectionNavigation('decklists'),
    queryCollectionNavigation('reports'),
    queryCollectionNavigation('tutorials'),
    queryCollectionNavigation('spoilers')
  ]).then(results => results.flat())
)

const { data: files } = useLazyAsyncData(
  'search',
  async () => {
    const [decklists, articles, reports, tutorials, spoilers] = await Promise.all([
      queryCollectionSearchSections('decklists'),
      queryCollectionSearchSections('articles'),
      queryCollectionSearchSections('reports'),
      queryCollectionSearchSections('tutorials'),
      queryCollectionSearchSections('spoilers')
    ])
    return [...decklists, ...articles, ...reports, ...tutorials, ...spoilers]
      .filter(f => f.title?.trim() !== '' && !f.id.includes('template'))
  },
  { server: false }
)

const searchTerm = ref('')

// const categoryIcons: Record<string, string> = {
//   decklists: 'i-lucide-layers',
//   articles: 'i-lucide-newspaper',
//   reports: 'i-lucide-chart-bar',
//   tutorials: 'i-lucide-graduation-cap',
//   spoilers: 'i-lucide-sparkles',
// }

// function getItemIcon(item: any): string {
//   // I link hanno già l'icona giusta
//   if (item.group === 'links') return item.icon

//   // Per i file usa il group (es. "/articles" → "articles")
//   const collection = item.group?.replace('/', '')
//   return categoryIcons[collection] ?? 'i-lucide-file-text'
// }

const links = [
  { label: 'Articoli', icon: 'i-lucide-newspaper', to: '/articles' },
  { label: 'Tutorial', icon: 'i-lucide-graduation-cap', to: '/articles?category=tutorial' },
  { label: 'Decklist', icon: 'i-lucide-layers', to: '/articles?category=decklist' },
  { label: 'Report', icon: 'i-lucide-chart-bar', to: '/articles?category=report' },
  { label: 'Spoiler', icon: 'i-lucide-sparkles', to: '/articles?category=spoiler' }
]
</script>

<template>
  <ClientOnly>
    <LazyUContentSearch
      v-model:search-term="searchTerm"
      :files="files ?? []"
      :navigation="navigation ?? []"
      :links="links"
      :fuse="{ resultLimit: 25 }"
      shortcut="meta_k"
      placeholder="Cerca articoli, guide, decklist..."
    >
      <!-- <template #item-leading="{ item }">
        <UIcon :name="getItemIcon(item)" class="w-4 h-4" />
        {{ console.log('item:', JSON.stringify(item)) }}
      </template> -->

      <template #empty>
        Nessun risultato trovato
      </template>
    </LazyUContentSearch>
  </ClientOnly>
</template>
