<script setup lang="ts">
import {
  type AnyArticle,
  queryAllCollections,
  combineArticles,
  CATEGORY_LABELS,
  type CategoryType
} from '~/constants/content-config'
import { getRecentArticleBadge as getBadge } from '~/utils/article-badges'
import { buildArticleTopicTags, buildGlobalNormalizedLocationSet } from '~/utils/article-filters'
import { normalizeAuthors } from '~/composables/useAuthor'

const route = useRoute()
const slug = route.params.slug as string

// Convert slug back to author name (e.g., "pietro-bragioto" -> "Pietro Bragioto")
const authorName = getAuthorNameFromSlug(slug)

// Fetch author data
const authorData = await useAuthor(authorName)

if (!authorData) {
  throw createError({
    statusCode: 404,
    message: `Author "${authorName}" not found`
  })
}

// Query all articles and filter by this author
const { data: authorArticles } = await useAsyncData(`author-articles-${slug}`, async () => {
  const collectionsData = await queryAllCollections()
  const allArticles: AnyArticle[] = combineArticles(collectionsData)
    .filter(article => {
      const authorNames = normalizeAuthors(article.author)
      return article.published !== false &&
        authorNames.some((name: string) => name.toLowerCase() === authorName.toLowerCase())
    })

  return allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Count articles by category
const articleCounts = computed(() => {
  if (!authorArticles.value) return {}

  const counts: Record<string, number> = {}
  authorArticles.value.forEach(article => {
    const category = article.category
    counts[category] = (counts[category] || 0) + 1
  })

  return counts
})

// Total articles count
const totalArticles = computed(() => authorArticles.value?.length || 0)

// Recent articles (limit to 4)
const recentArticles = computed(() => authorArticles.value?.slice(0, 4) || [])
const authorArticlesLocationSet = computed(() =>
  buildGlobalNormalizedLocationSet(authorArticles.value || [])
)
const getArticleTopicTags = (article: AnyArticle) =>
  buildArticleTopicTags(article, authorArticlesLocationSet.value)

// SEO meta tags
useSeoMeta({
  title: `${authorData.name} - Autore`,
  description: authorData.bio || authorData.description,
  ogTitle: `${authorData.name} - Autore`,
  ogDescription: authorData.bio || authorData.description,
  ogImage: authorData.avatar,
})
</script>

<template>
  <UPage>
    <UPageHeader
      :title="authorData.name"
      :description="authorData.description"
    >
      <template #headline>
        <UBadge
          variant="soft"
          color="primary"
        >
          Autore
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <!-- Author Info Section -->
      <UCard class="mb-8">
        <div class="flex flex-col md:flex-row gap-6">
          <UAvatar
            :src="authorData.avatar"
            :alt="authorData.name"
            size="2xl"
            class="shrink-0"
          />

          <div class="flex-1">
            <div class="flex flex-col gap-4">
              <!-- Bio -->
              <p
                v-if="authorData.bio"
                class="text-base text-gray-700 dark:text-gray-300"
              >
                {{ authorData.bio }}
              </p>

              <!-- Social Links -->
              <AuthorSocialLinks
                :socials="authorData.socials"
                variant="labels"
              />

              <!-- Article Stats -->
              <div class="flex items-center gap-6 flex-wrap">
                <div class="flex items-center gap-2">
                  <Icon
                    name="i-lucide-book-open-text"
                    class="w-5 h-5 text-primary"
                  />
                  <UButton
                    :to="`/articles?author=${getAuthorSlug(authorData.name)}`"
                    variant="link"
                    color="primary"
                    class="p-0 text-sm font-semibold"
                  >
                    {{ totalArticles }} articoli totali
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Article Counts by Category -->
      <div
        v-if="Object.keys(articleCounts).length > 0"
        class="mb-8"
      >
        <h2 class="text-2xl font-bold mb-4">Articoli per categoria</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <NuxtLink
            v-for="(count, category) in articleCounts"
            :key="category"
            :to="`/articles?category=${category}&author=${getAuthorSlug(authorData.name)}`"
            class="block"
          >
            <UCard
              class="text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div class="flex flex-col gap-2">
                <p class="text-3xl font-bold text-primary">{{ count }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ CATEGORY_LABELS[category as CategoryType] }}
                </p>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Articles -->
      <div v-if="recentArticles.length > 0">
        <h2 class="text-2xl font-bold mb-4">Ultimi articoli</h2>
        <UBlogPosts class="gap-2 sm:gap-4 lg:gap-6 sm:grid-cols-3 lg:grid-cols-4">
          <ArticleCard
            v-for="article in recentArticles"
            :key="article.path"
            :article="article"
            :badge="getBadge(article.date)"
            :show-author="false"
            :category-label="CATEGORY_LABELS[article.category as CategoryType]"
            :topic-tags="getArticleTopicTags(article)"
          />
        </UBlogPosts>
      </div>

      <!-- Empty State -->
      <UEmpty
        v-else
        title="Nessun articolo"
        description="Questo autore non ha ancora pubblicato articoli."
        variant="naked"
        :actions="[{ label: 'Torna alla home', to: '/' }]"
      />
    </UPageBody>
  </UPage>
</template>
