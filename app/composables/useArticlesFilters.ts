import type { Ref } from 'vue'
import type { Author } from '~/composables/useAuthor'
import { getAuthorNameFromSlug, getAuthorSlug } from '~/composables/useAuthorSlug'
import { normalizeAuthors } from '~/composables/useAuthor'
import { type AnyArticle, CATEGORY_LABELS } from '~/constants/content-config'
import {
  buildArticleTopicTags,
  buildGlobalNormalizedLocationSet,
  getArticleFilterLocation,
  getNormalizedArticleLocation,
  normalizeArticleFilterValue
} from '~/utils/article-filters'

interface UseArticlesFiltersOptions {
  articles: Ref<AnyArticle[] | null | undefined>
  authorsMap: Ref<Record<string, Author>>
}

interface PreparedArticleFilterData {
  article: AnyArticle
  authorSlug: string
  normalizedLocation: string | null
  topicTags: string[]
  normalizedTopicTagSet: Set<string>
}

export const useArticlesFilters = ({ articles, authorsMap }: UseArticlesFiltersOptions) => {
  const route = useRoute()
  const italianCollator = new Intl.Collator('it')

  const globalNormalizedLocationSet = computed(() =>
    buildGlobalNormalizedLocationSet(articles.value || [])
  )

  const selectedCategory = computed<string | null>(() =>
    route.query.category ? String(route.query.category) : null
  )
  const selectedAuthor = computed<string | null>(() =>
    route.query.author ? String(route.query.author) : null
  )
  const selectedLocation = computed<string | null>(() =>
    route.query.location ? String(route.query.location) : null
  )
  const selectedTag = computed<string | null>(() =>
    route.query.tag ? String(route.query.tag) : null
  )

  const categoryLabels = CATEGORY_LABELS

  const preparedArticleFilters = computed<PreparedArticleFilterData[]>(() => {
    if (!articles.value) return []

    return articles.value.map((article) => {
      const authorNames = normalizeAuthors(article.author)
      const primaryAuthorName = authorNames[0] || 'Unknown'
      const authorName = authorsMap.value[primaryAuthorName]?.name || primaryAuthorName
      const authorSlug = getAuthorSlug(authorName)
      const normalizedLocation = getNormalizedArticleLocation(article)
      const topicTags = buildArticleTopicTags(article, globalNormalizedLocationSet.value)
      const normalizedTopicTagSet = new Set(topicTags.map(tag => normalizeArticleFilterValue(tag)))

      return {
        article,
        authorSlug,
        normalizedLocation,
        topicTags,
        normalizedTopicTagSet
      }
    })
  })

  const preparedArticleFiltersByRef = computed(() => {
    const lookup = new WeakMap<AnyArticle, PreparedArticleFilterData>()

    preparedArticleFilters.value.forEach((item) => {
      lookup.set(item.article, item)
    })

    return lookup
  })

  const filterCounts = computed(() => {
    const categoryCounts: Record<string, number> = {}
    const authorCounts: Record<string, number> = {}
    const locationCounts: Record<string, number> = {}
    const tagCounts: Record<string, number> = {}
    const deckCounts: Record<string, number> = {}

    preparedArticleFilters.value.forEach(({ article, topicTags }) => {
      if (typeof article.category === 'string') {
        categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1
      }

      // Count each author separately for multi-author articles
      const authorNames = normalizeAuthors(article.author)
      authorNames.forEach((authorName) => {
        authorCounts[authorName] = (authorCounts[authorName] || 0) + 1
      })

      const location = getArticleFilterLocation(article)
      if (location) {
        locationCounts[location] = (locationCounts[location] || 0) + 1
      }

      topicTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })

      // Count deck tags from the decks field
      if (article.decks && Array.isArray(article.decks)) {
        article.decks.forEach((deck) => {
          deckCounts[deck] = (deckCounts[deck] || 0) + 1
        })
      }
    })

    return {
      categoryCounts,
      authorCounts,
      locationCounts,
      tagCounts,
      deckCounts
    }
  })

  const categoryFilterOptions = computed<Array<{ category: string; label: string; count: number }>>(() =>
    Object.entries(categoryLabels).map(([category, label]) => ({
      category,
      label,
      count: filterCounts.value.categoryCounts[category] || 0
    }))
  )

  const locationFilterOptions = computed<Array<{ location: string; count: number }>>(() => {
    return (Object.entries(filterCounts.value.locationCounts) as Array<[string, number]>)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => italianCollator.compare(a.location, b.location))
  })

  const getArticleTopicTags = (article: AnyArticle) =>
    preparedArticleFiltersByRef.value.get(article)?.topicTags || buildArticleTopicTags(article, globalNormalizedLocationSet.value)

  const getArticleDeckTags = (article: AnyArticle) => {
    return article.decks || []
  }

  const getArticleCommonTags = (article: AnyArticle) => {
    return article.tags || []
  }

  const authorFilterOptions = computed<Array<{ name: string; slug: string; count: number }>>(() => {
    return (Object.entries(filterCounts.value.authorCounts) as Array<[string, number]>)
      .map(([authorKey, count]) => {
        const authorName = authorsMap.value[authorKey]?.name || authorKey

        return {
          name: authorName,
          slug: getAuthorSlug(authorName),
          count
        }
      })
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return italianCollator.compare(a.name, b.name)
      })
  })

  const tagFilterOptions = computed<Array<{ tag: string; count: number }>>(() => {
    // Get all deck names to exclude from generic tags
    const deckNames = new Set<string>()
    Object.keys(filterCounts.value.deckCounts).forEach(deck => deckNames.add(deck))

    const options: Array<{ tag: string; count: number }> = []

    // Add common tags, excluding deck tags
    Object.entries(filterCounts.value.tagCounts).forEach(([tag, count]) => {
      if (!deckNames.has(tag)) {
        options.push({ tag, count: count as number })
      }
    })

    return options.sort((a, b) => italianCollator.compare(a.tag, b.tag))
  })

  const deckFilterOptions = computed<Array<{ tag: string; count: number }>>(() => {
    return (Object.entries(filterCounts.value.deckCounts) as Array<[string, number]>)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => italianCollator.compare(a.tag, b.tag))
  })

  const authorSlugToName = computed<Record<string, string>>(() =>
    Object.values(authorsMap.value).reduce((acc, author) => {
      const slug = getAuthorSlug(author.name)
      if (!acc[slug]) acc[slug] = author.name
      return acc
    }, {} as Record<string, string>)
  )

  const selectedCategoryLabel = computed<string | null>(() => {
    if (!selectedCategory.value) return null
    return categoryLabels[selectedCategory.value as keyof typeof categoryLabels] || selectedCategory.value
  })

  const selectedAuthorLabel = computed<string | null>(() => {
    if (!selectedAuthor.value) return null
    return authorSlugToName.value[selectedAuthor.value] || getAuthorNameFromSlug(selectedAuthor.value)
  })

  const selectedLocationLabel = computed<string | null>(() => {
    if (!selectedLocation.value) return null
    const normalizedSelectedLocation = normalizeArticleFilterValue(selectedLocation.value)

    const matchedLocation = locationFilterOptions.value.find(
      item => normalizeArticleFilterValue(item.location) === normalizedSelectedLocation
    )

    return matchedLocation?.location || selectedLocation.value
  })

  const selectedTagLabel = computed<string | null>(() => {
    if (!selectedTag.value) return null
    const normalizedSelectedTag = normalizeArticleFilterValue(selectedTag.value)

    const matchedTag = tagFilterOptions.value.find(
      item => normalizeArticleFilterValue(item.tag) === normalizedSelectedTag
    )

    return matchedTag?.tag || selectedTag.value
  })

  const hasActiveFilters = computed(() =>
    !!selectedCategory.value || !!selectedAuthor.value || !!selectedLocation.value || !!selectedTag.value
  )

  const filteredArticles = computed(() => {
    const category = selectedCategory.value
    const author = selectedAuthor.value
    const normalizedSelectedLocation = selectedLocation.value ? normalizeArticleFilterValue(selectedLocation.value) : null
    const normalizedSelectedTag = selectedTag.value ? normalizeArticleFilterValue(selectedTag.value) : null

    const filtered: AnyArticle[] = []

    preparedArticleFilters.value.forEach((item) => {
      const matchesCategory = !category || item.article.category === category
      const matchesAuthor = !author || item.authorSlug === author
      const matchesLocation = !normalizedSelectedLocation || item.normalizedLocation === normalizedSelectedLocation
      const matchesTag = !normalizedSelectedTag || item.normalizedTopicTagSet.has(normalizedSelectedTag)

      if (matchesCategory && matchesAuthor && matchesLocation && matchesTag) {
        filtered.push(item.article)
      }
    })

    return filtered
  })

  const updateFilters = (next: {
    category?: string | null
    author?: string | null
    location?: string | null
    tag?: string | null
  }) => {
    const category = next.category === undefined ? selectedCategory.value : next.category
    const author = next.author === undefined ? selectedAuthor.value : next.author
    const location = next.location === undefined ? selectedLocation.value : next.location
    const tag = next.tag === undefined ? selectedTag.value : next.tag

    const query: Record<string, string> = {}
    if (category) query.category = category
    if (author) query.author = author
    if (location) query.location = normalizeArticleFilterValue(location)
    if (tag) query.tag = normalizeArticleFilterValue(tag)
    void navigateTo({ query }, { replace: true })
  }

  const setCategoryFilter = (category: string | null) => {
    updateFilters({ category })
  }

  const setAuthorFilter = (author: string | null) => {
    updateFilters({ author })
  }

  const setLocationFilter = (location: string | null) => {
    updateFilters({ location })
  }

  const setTagFilter = (tag: string | null) => {
    updateFilters({ tag })
  }

  const clearAllFilters = () => {
    updateFilters({ category: null, author: null, location: null, tag: null })
  }

  return {
    selectedCategory,
    selectedAuthor,
    selectedLocation,
    selectedTag,
    selectedCategoryLabel,
    selectedAuthorLabel,
    selectedLocationLabel,
    selectedTagLabel,
    categoryFilterOptions,
    authorFilterOptions,
    locationFilterOptions,
    tagFilterOptions,
    deckFilterOptions,
    hasActiveFilters,
    filteredArticles,
    getArticleTopicTags,
    setCategoryFilter,
    setAuthorFilter,
    setLocationFilter,
    setTagFilter,
    clearAllFilters
  }
}
