type ArticleFilterFields = {
  tags?: unknown
  location?: unknown
} | null | undefined

type ArticleLocationFields = {
  location?: unknown
} | null | undefined

export const normalizeArticleFilterValue = (value: string) => value.trim().toLowerCase()

export const getArticleFilterStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

export const getArticleFilterString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null

  const trimmedValue = value.trim()
  if (trimmedValue.length <= 0) return null

  const normalizedValue = normalizeArticleFilterValue(trimmedValue)
  if (normalizedValue === 'undefined' || normalizedValue === 'null') return null

  return trimmedValue
}

export const getArticleFilterLocation = (article: ArticleLocationFields): string | null =>
  getArticleFilterString(article?.location)

export const getNormalizedArticleLocation = (article: ArticleLocationFields): string | null => {
  const location = getArticleFilterLocation(article)
  return location ? normalizeArticleFilterValue(location) : null
}

export const buildGlobalNormalizedLocationSet = (articles: Iterable<ArticleLocationFields>) => {
  const normalizedLocations = new Set<string>()

  for (const article of articles) {
    const normalizedLocation = getNormalizedArticleLocation(article)
    if (normalizedLocation) normalizedLocations.add(normalizedLocation)
  }

  return normalizedLocations
}

export const buildArticleTopicTags = (
  article: ArticleFilterFields,
  globalNormalizedLocationSet?: ReadonlySet<string>
) => {
  const normalizedLocation = getNormalizedArticleLocation(article)

  return getArticleFilterStringArray(article?.tags).filter((tag) => {
    const normalizedTag = normalizeArticleFilterValue(tag)
    return (
      normalizedTag !== 'undefined'
      && normalizedTag !== 'null'
      && normalizedTag !== normalizedLocation
      && !globalNormalizedLocationSet?.has(normalizedTag)
    )
  })
}

export const getArticleTagFilterQuery = (
  article: ArticleFilterFields,
  tag: string,
  options?: { globalNormalizedLocationSet?: ReadonlySet<string> }
): { location: string } | { tag: string } => {
  const globalNormalizedLocationSet = options?.globalNormalizedLocationSet
  const normalizedTag = normalizeArticleFilterValue(tag)
  const normalizedArticleLocation = getNormalizedArticleLocation(article)
  const isKnownLocationTag =
    normalizedArticleLocation === normalizedTag || !!globalNormalizedLocationSet?.has(normalizedTag)

  if (isKnownLocationTag) {
    const isTopicTag = buildArticleTopicTags(article, globalNormalizedLocationSet).some(
      articleTag => normalizeArticleFilterValue(articleTag) === normalizedTag
    )

    if (!isTopicTag) {
      return { location: normalizedTag }
    }
  }

  return { tag: normalizedTag }
}

export const hasArticleTag = (article: ArticleFilterFields, tag: string) => {
  const normalizedTag = normalizeArticleFilterValue(tag)

  return getArticleFilterStringArray(article?.tags).some(
    articleTag => normalizeArticleFilterValue(articleTag) === normalizedTag
  )
}

export const hasLeagueTag = (article: ArticleFilterFields) => hasArticleTag(article, 'league')
