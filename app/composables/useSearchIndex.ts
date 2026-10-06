/**
 * The list of pages the search looks through, built on the client from every content collection.
 * It pulls in the Nuxt Content SQLite WASM and the dump of each collection (about 1 MB), so it is
 * not loaded on every page view: `load()` starts it when the search is about to be used.
 */
export function useSearchIndex() {
  const nuxtApp = useNuxtApp()

  const { data: files, status, execute } = useLazyAsyncData(
    'search',
    async () => {
      const [decklists, articles, reports, tutorials, spoilers, decklistDocs] = await Promise.all([
        queryCollectionSearchSections('decklists'),
        queryCollectionSearchSections('articles'),
        queryCollectionSearchSections('reports'),
        queryCollectionSearchSections('tutorials'),
        queryCollectionSearchSections('spoilers'),
        queryCollection('decklists').select('path', '_decks').all()
      ])

      const decksByPath = new Map(decklistDocs.map(doc => [doc.path, doc._decks ?? []]))

      return [
        ...decklists.map(f => ({ ...f, _collection: 'decklists' })),
        ...articles.map(f => ({ ...f, _collection: 'articles' })),
        ...reports.map(f => ({ ...f, _collection: 'reports' })),
        ...tutorials.map(f => ({ ...f, _collection: 'tutorials' })),
        ...spoilers.map(f => ({ ...f, _collection: 'spoilers' }))
      ]
        .filter(f => f.title?.trim() !== '' && !f.id.includes('template') && f.level === 1)
        .map(f => ({
          id: f.id,
          title: f.title,
          _collection: f._collection,
          _date: f.id.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? '',
          _summary: f.content?.trim().replace(/\s+/g, ' ').slice(0, 100) ?? '',
          _decks: decksByPath.get(f.id) ?? []
        }))
        .sort((a, b) => b._date.localeCompare(a._date))
    },
    {
      server: false,
      immediate: false,
      getCachedData: key => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    }
  )

  const load = () => {
    if (status.value === 'idle') execute()
  }

  return { files, status, load }
}
