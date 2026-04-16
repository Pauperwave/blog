// app\composables\useRelatedArticles.ts
import { intersection, orderBy, orderByMultiple } from "~/utils/array"
import type { Author } from '~/composables/useAuthor'
import type { AnyArticle } from '~/constants/content-config'
import {
  queryAllCollections,
  combineArticles
} from '~/constants/content-config'
import {
  buildGlobalNormalizedLocationSet,
  getArticleTagFilterQuery
} from '~/utils/article-filters'
import { normalizeAuthors } from '~/composables/useAuthor'

const MAX_RELATED_ARTICLES = 3

export const useRelatedArticles = (data: Ref<AnyArticle | null>) => {
  const route = useRoute()

  const { data: relatedData } = useAsyncData(`linked-${route.path}`, async () => {
    const collectionsData = await queryAllCollections()
    const allArticles: AnyArticle[] = combineArticles(collectionsData)
    const filterableArticles = allArticles.filter(a => a.published !== false)
    const publishedArticles = allArticles.filter(a => a.published === true)
    const globalNormalizedLocationSet = buildGlobalNormalizedLocationSet(filterableArticles)
    const filtered = publishedArticles.filter(a => a.path !== data.value?.path)

    const withCommonTags = filtered.map(a => ({
      article: a,
      commonTags: intersection(a.tags, data.value?.tags || []).length
    }))

    let sorted = orderByMultiple(
      withCommonTags,
      [item => item.commonTags, item => new Date(item.article.date).getTime()],
      ['desc', 'desc']
    ).map(item => item.article)

    if (sorted.length < MAX_RELATED_ARTICLES) {
      sorted = orderBy(filtered, a => new Date(a.date).getTime(), 'desc').slice(0, MAX_RELATED_ARTICLES)
    }

    const links = sorted.slice(0, MAX_RELATED_ARTICLES)

    // Fetch related authors in the same call
    const allNames = [...new Set(links.flatMap(a => normalizeAuthors(a.author)))]
    const authors = allNames.length
      ? await queryCollection('authors').where('name', 'IN', allNames).all()
      : []

    return {
      links,
      globalNormalizedLocationValues: Array.from(globalNormalizedLocationSet),
      relatedAuthors: authors
    }
  })

  const links = computed(() => relatedData.value?.links || [])
  const globalNormalizedLocationSet = computed(
    () => new Set(relatedData.value?.globalNormalizedLocationValues || [])
  )

  const getTagFilterLink = (tag: string) => ({
    path: '/articles',
    query: getArticleTagFilterQuery(data.value, tag, {
      globalNormalizedLocationSet: globalNormalizedLocationSet.value
    })
  })

  const relatedAuthorsMap = computed(() => {
    const map: Record<string, Author[]> = {}
    for (const article of links.value) {
      const names = normalizeAuthors(article.author)
      map[article.path] = names
        .map(name => relatedData.value?.relatedAuthors.find(
          a => a.name.toLowerCase() === name.toLowerCase()
        ))
        .filter(Boolean) as Author[]
    }
    return map
  })

  return {
    links,
    relatedAuthorsMap,
    globalNormalizedLocationSet,
    getTagFilterLink
  }
}
