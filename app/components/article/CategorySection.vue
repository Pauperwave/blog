<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'
import type { AnyArticle } from '~/constants/content-config'
import { getRecentArticleBadge as getArticleBadge } from '~/utils/article-badges'
import { normalizeAuthors } from '~/composables/useAuthor'

interface Props {
  title: string;
  category: string;
  articles: AnyArticle[];
  authorsMap: Record<string, Author>;
  maxItems?: number;
  viewAllText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxItems: 3,
  viewAllText: 'Vedi tutti'
})

const getAuthorData = (article: AnyArticle): Author[] => {
  const authorNames = normalizeAuthors(article.author)
  return authorNames.map(name => props.authorsMap[name.toLowerCase()]).filter((author): author is Author => Boolean(author))
}
</script>

<template>
  <section
    v-if="articles.length"
    class="space-y-2"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">{{ title }}</h2>
      <UButton
        :to="`/articles?category=${category}`"
        variant="link"
        size="sm"
      >
        <AnimatedArrow size="sm">
          {{ viewAllText }}
        </AnimatedArrow>
      </UButton>
    </div>
    <UBlogPosts>
      <ArticleCard
        v-for="article in articles.slice(0, maxItems)"
        :key="article._id"
        :article="article"
        :author-data="getAuthorData(article)"
        :topic-tags="article.tags || []"
        :badge="getArticleBadge(article.date)"
      />
    </UBlogPosts>
  </section>
</template>
