<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'
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
const authorsMap = ref<Record<string, Author>>({})

if (articles.value) {
  const uniqueAuthors = [...new Set(articles.value.map(article => article.author))]
  for (const authorName of uniqueAuthors) {
    try {
      const authorInfo = await useAuthor(authorName)
      authorsMap.value[authorName] = authorInfo
    } catch (e) {
      console.error(`Failed to load author data for ${authorName}:`, e)
    }
  }
}

const {
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
  hasActiveFilters,
  filteredArticles,
  getArticleTopicTags,
  setCategoryFilter,
  setAuthorFilter,
  setLocationFilter,
  setTagFilter,
  clearAllFilters
} = useArticlesFilters({ articles, authorsMap })
</script>

<template>
  <UPage>
    <UPageBody>
      <ArticlesFiltersPanel
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
        :category-filter-options="categoryFilterOptions"
        :author-filter-options="authorFilterOptions"
        :location-filter-options="locationFilterOptions"
        :tag-filter-options="tagFilterOptions"
        @set-category="setCategoryFilter"
        @set-author="setAuthorFilter"
        @set-location="setLocationFilter"
        @set-tag="setTagFilter"
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
        <ArticleBlogCard
          v-for="article in filteredArticles"
          :key="article.path"
          :article="article"
          :author-data="authorsMap[article.author]"
          :topic-tags="getArticleTopicTags(article)"
          :badge="getBadge(article.date)"
        />
      </UBlogPosts>
    </UPageBody>
  </UPage>
</template>
