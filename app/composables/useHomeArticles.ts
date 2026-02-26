import type { AnyArticle } from '~/constants/content-config'
import { combineArticles, queryAllCollections } from '~/constants/content-config'
import { isRecentArticle } from '~/utils/article-badges'

interface HomeArticlesData {
  articles: AnyArticle[]
  freshThisWeekCount: number
}

const hasLeagueTag = (tags: unknown) => {
  return Array.isArray(tags)
    && tags.some((tag: unknown) =>
      typeof tag === 'string' && tag.trim().toLowerCase() === 'league'
    )
}

export const useHomeArticles = async () => {
  return await useAsyncData<HomeArticlesData>('home-articles', async () => {
    const collectionsData = await queryAllCollections()

    const publishedArticles: AnyArticle[] = combineArticles(collectionsData)
      .filter(article => article.published)

    const freshThisWeekCount = publishedArticles
      .filter(article => isRecentArticle(article.date))
      .length

    const articles = publishedArticles
      .filter((article) => {
        if (article.category !== 'decklist') return true
        return !hasLeagueTag(article.tags)
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      articles,
      freshThisWeekCount
    }
  })
}
