// app\composables\useArticleData.ts
import type { Author } from '~/composables/useAuthor'
import { getCollectionNames } from '~/constants/content-config'
import { normalizeAuthors } from '~/composables/useAuthor'

export const useArticleData = async (path: string) => {
  const fetchArticle = async () => {
    for (const collection of getCollectionNames()) {
      const result = await queryCollection(collection).path(path).first()
      if (result) return result
    }
    return null
  }

  // Tutti i useAsyncData chiamati SINCRONAMENTO prima di qualsiasi await
  const articleAsync = useAsyncData(path, fetchArticle)
  const authorsAsync = useAsyncData<Author[]>(`authors-${path}`, async () => {
    const article = await fetchArticle()
    console.log('[DEBUG] Article author field:', article?.author)
    if (!article?.author) return []
    const names = normalizeAuthors(article.author)
    console.log('[DEBUG] Normalized author names:', names)
    const authors = await queryCollection('authors').where('name', 'IN', names).all()
    console.log('[DEBUG] Query returned authors:', authors.map(a => ({ name: a.name, avatar: a.avatar })))
    const mapped = names
      .map(name => authors.find(a => a.name.toLowerCase() === name.toLowerCase()))
      .filter(Boolean) as Author[]
    console.log('[DEBUG] Mapped authors:', mapped.map(a => ({ name: a.name, avatar: a.avatar })))
    return mapped
  })
  const surroundAsync = useAsyncData(`${path}-surround`, async () => {
    for (const collection of getCollectionNames()) {
      try {
        const result = await queryCollectionItemSurroundings(collection, path, {
          fields: ['description', 'published'],
        })
        // queryCollectionItemSurroundings ritorna [prev, next] anche con null items
        // Filter out unpublished articles
        const filtered = result?.filter(item => item?.published !== false)
        if (filtered && (filtered[0] || filtered[1])) return filtered
      } catch (e) {
        console.error(`[DEBUG] Error in collection ${collection}:`, e)
      }
    }
    return undefined
  })

  // Ora possiamo await
  const [{ data }, { data: authorsData }, { data: surround }] = await Promise.all([
    articleAsync,
    authorsAsync,
    surroundAsync
  ])

  return { data, authorsData, surround }
}
