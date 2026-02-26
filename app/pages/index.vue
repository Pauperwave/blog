<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'
import {
  CATEGORY_LABELS,
  CONTENT_TYPE_ORDER,
  type CategoryType,
  getHomeSections,
  initializeCategories
} from '~/constants/content-config'

const { data: homeArticlesData } = await useHomeArticles()
const allArticles = computed(() => homeArticlesData.value?.articles || [])
const freshThisWeekCount = computed(() => homeArticlesData.value?.freshThisWeekCount ?? 0)

// Fetch author data for all unique authors
const authorsMap = ref<Record<string, Author>>({})

if (allArticles.value.length) {
  const uniqueAuthors = [...new Set(allArticles.value.map(article => article.author))]
  for (const authorName of uniqueAuthors) {
    try {
      const authorInfo = await useAuthor(authorName)
      authorsMap.value[authorName] = authorInfo
    } catch (e) {
      console.error(`Failed to load author data for ${authorName}:`, e)
    }
  }
}

const articlesByCategory = computed(() => {
  const categories = initializeCategories()

  allArticles.value.forEach((article) => {
    if (article.category && categories[article.category as CategoryType]) {
      categories[article.category as CategoryType].push(article)
    }
  })

  return categories
})

const categoryHighlights = computed(() =>
  CONTENT_TYPE_ORDER
    .map(category => ({
      category,
      label: CATEGORY_LABELS[category],
      count: articlesByCategory.value[category].length
    }))
    .filter(item => item.count > 0)
)

// Get sections from centralized config
const sections = getHomeSections()
</script>

<template>
  <UPage>
    <UPageBody
      :ui="{
        base: 'mt-4 pb-0 space-y-0'
      }"
    >
      <HomeHeroSection
        :articles="allArticles"
        :fresh-this-week-count="freshThisWeekCount"
        :category-highlights="categoryHighlights"
        :authors-map="authorsMap"
      />

      <section class="mb-4">
        <div class="flex items-end justify-between gap-3 mb-5">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
              Esplora
            </p>
            <h1 class="text-3xl md:text-3xl font-bold">
              Sezioni del blog
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Tutte le categorie, ordinate per priorità editoriale
            </p>
          </div>
        </div>
        
        <div class="space-y-12 pb-2">
          <ArticleCategorySection
            v-for="section in sections"
            :key="section.category"
            :title="section.title"
            :category="section.category"
            :articles="articlesByCategory[section.category]"
            :authors-map="authorsMap"
          />
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>
