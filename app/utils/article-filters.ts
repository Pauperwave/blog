type ArticleFilterFields = {
  tags?: unknown
  locations?: unknown
} | null | undefined

type ArticleLocationFields = {
  locations?: unknown
} | null | undefined

export const normalizeArticleFilterValue = (value: string) => value.trim().toLocaleLowerCase('it')

export const getArticleFilterStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

export const getNormalizedArticleLocationSet = (article: ArticleLocationFields) =>
  new Set(getArticleFilterStringArray(article?.locations).map(location => normalizeArticleFilterValue(location)))

export const buildGlobalNormalizedLocationSet = (articles: Iterable<ArticleLocationFields>) => {
  const normalizedLocations = new Set<string>()

  for (const article of articles) {
    getArticleFilterStringArray(article?.locations).forEach((location) => {
      normalizedLocations.add(normalizeArticleFilterValue(location))
    })
  }

  return normalizedLocations
}

export const buildArticleTopicTags = (
  article: ArticleFilterFields,
  globalNormalizedLocationSet?: ReadonlySet<string>
) => {
  const normalizedLocationSet = getNormalizedArticleLocationSet(article)

  return getArticleFilterStringArray(article?.tags).filter((tag) => {
    const normalizedTag = normalizeArticleFilterValue(tag)
    return !normalizedLocationSet.has(normalizedTag) && !globalNormalizedLocationSet?.has(normalizedTag)
  })
}

export const getArticleTagFilterQuery = (
  article: ArticleFilterFields,
  tag: string,
  options?: { globalNormalizedLocationSet?: ReadonlySet<string> }
): { location: string } | { tag: string } => {
  const globalNormalizedLocationSet = options?.globalNormalizedLocationSet
  const normalizedTag = normalizeArticleFilterValue(tag)
  const isKnownLocationTag =
    getNormalizedArticleLocationSet(article).has(normalizedTag) || !!globalNormalizedLocationSet?.has(normalizedTag)

  if (isKnownLocationTag) {
    const isTopicTag = buildArticleTopicTags(article, globalNormalizedLocationSet).some(
      articleTag => normalizeArticleFilterValue(articleTag) === normalizedTag
    )

    if (!isTopicTag) {
      return { location: tag }
    }
  }

  return { tag }
}
