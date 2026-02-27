import type { AnyArticle } from '~/constants/content-config'
import { combineArticles, queryAllCollections } from '~/constants/content-config'
import { isRecentArticle } from '~/utils/article-badges'

interface HomeArticlesData {
  articles: AnyArticle[]
  freshThisWeekCount: number
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
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      articles,
      freshThisWeekCount
    }
  })
}
