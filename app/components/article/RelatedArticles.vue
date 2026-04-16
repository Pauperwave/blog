<!-- app\components\Article\RelatedArticles.vue -->
<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'
import type { AnyArticle } from '~/constants/content-config'
import type { ContentNavigationItem } from '@nuxt/content'
import { getRecentArticleBadge as getBadge } from '~/utils/article-badges'

const relatedArticlesString = "Altri articoli correlati"

defineProps<{
  links: AnyArticle[]
  relatedAuthorsMap: Record<string, Author[]>
  surround: ContentNavigationItem[] | undefined
}>()
</script>

<template>
  <USeparator class="mt-4 mb-4" />
  <p class="font-semibold mb-4">
    {{ relatedArticlesString }}
  </p>
  <UBlogPosts id="related-articles">
    <ArticleCard
      v-for="article in links"
      :key="article.path"
      :article="article"
      :author-data="relatedAuthorsMap[article.path]"
      :badge="getBadge(article.date)"
    />
  </UBlogPosts>
  <USeparator class="mt-4 mb-4" />
  <UContentSurround :surround="surround" />
</template>
