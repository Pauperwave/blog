<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'
import { normalizeAuthors } from '~/composables/useAuthor'
import {
  type AnyArticle,
  queryAllCollections,
  combineArticles
} from '~/constants/content-config'
import { getRecentArticleBadge as getBadge } from '~/utils/article-badges'

// Query all collections and combine them
const { data: articles } = await useAsyncData("articles-index", async () => {
  const collectionsData = await queryAllCollections()

  // Combine all articles, filter out drafts, and sort by date
  const allArticles: AnyArticle[] = combineArticles(collectionsData)
    .filter(article => article.published !== false)

  return allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Fetch author data for all unique authors
const { data: authorsMapData } = await useAsyncData<Record<string, Author>>(
  'articles-authors-map',
  async () => {
    if (!articles.value) return {}

    const uniqueNames = [...new Set(
      articles.value.flatMap(article => normalizeAuthors(article.author))
    )]

    if (!uniqueNames.length) return {}

    const authors = await queryCollection('authors')
      .where('name', 'IN', uniqueNames)
      .all()

    return Object.fromEntries(
      authors.map(a => [a.name, a as Author])
    )
  }
)

const authorsMap = computed(() => authorsMapData.value ?? {})

const {
  selectedCategory,
  selectedAuthor,
  selectedLocation,
  selectedTag,
  selectedDeck,
  selectedCategoryLabel,
  selectedAuthorLabel,
  selectedLocationLabel,
  selectedTagLabel,
  selectedDeckLabel,
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
  setDeckFilter,
  clearAllFilters
} = useArticlesFilters({ articles, authorsMap })
</script>

<template>
  <UPage>
    <UPageBody>
      <ArticleFiltersPanel
        :results-count="filteredArticles.length"
        :total-count="articles?.length || 0"
        :has-active-filters="hasActiveFilters"
        :selected-category="selectedCategory"
        :selected-category-label="selectedCategoryLabel"
        :selected-author="selectedAuthor"
        :selected-author-label="selectedAuthorLabel"
        :selected-location="selectedLocation"
        :selected-location-label="selectedLocationLabel"
        :selected-tag="selectedTag"
        :selected-tag-label="selectedTagLabel"
        :selected-deck="selectedDeck"
        :selected-deck-label="selectedDeckLabel"
        :category-filter-options="categoryFilterOptions"
        :author-filter-options="authorFilterOptions"
        :location-filter-options="locationFilterOptions"
        :tag-filter-options="tagFilterOptions"
        :deck-filter-options="deckFilterOptions"
        @set-category="setCategoryFilter"
        @set-author="setAuthorFilter"
        @set-location="setLocationFilter"
        @set-tag="setTagFilter"
        @set-deck="setDeckFilter"
        @clear-all="clearAllFilters"
      />

      <UEmpty
        v-if="(filteredArticles?.length ?? 0) <= 0"
        title="Nessun articolo trovato"
        :description="hasActiveFilters ? 'Nessun articolo corrisponde ai filtri selezionati.' : 'Non ci sono articoli disponibili.'"
        variant="naked"
        :actions="[{ label: 'Torna alla home', to: '/' }]"
      />
      <UBlogPosts
        v-else
        class="gap-2 sm:gap-4 lg:gap-6 sm:grid-cols-3 lg:grid-cols-4"
      >
        <ArticleCard
          v-for="article in filteredArticles"
          :key="article.path"
          :article="article"
          :author-data="normalizeAuthors(article.author).map(name => authorsMap[name]).filter((author): author is Author => Boolean(author))"
          :topic-tags="getArticleTopicTags(article)"
          :badge="getBadge(article.date)"
        />
      </UBlogPosts>
    </UPageBody>
  </UPage>
</template>
