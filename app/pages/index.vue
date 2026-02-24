<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'
import { getAuthorSlug } from '~/composables/useAuthorSlug'
import { getRecentArticleBadge as getArticleBadge, isRecentArticle } from '~/utils/article-badges'
import {
  type AnyArticle,
  type CategoryType,
  CATEGORY_LABELS,
  CONTENT_TYPE_ORDER,
  queryAllCollections,
  combineArticles,
  getHomeSections,
  initializeCategories
} from '~/constants/content-config'

// Query all collections and combine them
const { data: allArticles } = await useAsyncData('home-articles', async () => {
  const collectionsData = await queryAllCollections()

  // Combine all articles, filter out drafts, and sort by date
  const combined: AnyArticle[] = combineArticles(collectionsData)
    .filter(article => article.published !== false)

  return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// Fetch author data for all unique authors
const authorsMap = ref<Record<string, Author>>({})

if (allArticles.value) {
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

const getThumbnailSrc = (thumbnail: unknown) => {
  if (typeof thumbnail === 'string') return thumbnail
  if (
    thumbnail
    && typeof thumbnail === 'object'
    && 'src' in thumbnail
    && typeof (thumbnail as { src?: unknown }).src === 'string'
  ) {
    return (thumbnail as { src: string }).src
  }

  return undefined
}

const articles = computed(() => allArticles.value || [])
const normalizeFilterValue = (value: string) => value.trim().toLocaleLowerCase('it')
const getStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
const globalNormalizedLocationSet = computed(() => {
  const normalizedLocations = new Set<string>()

  articles.value.forEach((article) => {
    getStringArray(article.locations).forEach((location) => {
      normalizedLocations.add(normalizeFilterValue(location))
    })
  })

  return normalizedLocations
})
const getArticleTopicTags = (article: AnyArticle) => {
  const normalizedLocationSet = new Set(
    getStringArray(article.locations).map(location => normalizeFilterValue(location))
  )

  return getStringArray(article.tags).filter((tag) => {
    const normalizedTag = normalizeFilterValue(tag)
    return !normalizedLocationSet.has(normalizedTag) && !globalNormalizedLocationSet.value.has(normalizedTag)
  })
}

const articlesByCategory = computed(() => {
  const categories = initializeCategories()

  allArticles.value?.forEach((article) => {
    if (article.category && categories[article.category as CategoryType]) {
      categories[article.category as CategoryType].push(article)
    }
  })

  return categories
})

const featuredArticle = computed(() => articles.value[0] || null)
const heroSecondaryArticles = computed(() => articles.value.slice(1, 4))
const latestArticles = computed(() => articles.value.slice(0, 6))
const freshThisWeekCount = computed(() => articles.value.filter(article => isRecentArticle(article.date)).length)
const activeAuthorsCount = computed(() => new Set(articles.value.map(article => article.author)).size)

const categoryHighlights = computed(() =>
  CONTENT_TYPE_ORDER
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      count: articlesByCategory.value[category].length,
      latest: articlesByCategory.value[category][0] || null
    }))
    .filter(item => item.count > 0)
)

const topAuthors = computed(() => {
  const counts = articles.value.reduce((acc, article) => {
    acc[article.author] = (acc[article.author] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(counts)
    .map(([authorKey, count]) => {
      const authorInfo = authorsMap.value[authorKey]
      const name = authorInfo?.name || authorKey

      return {
        key: authorKey,
        name,
        slug: getAuthorSlug(name),
        count,
        avatar: authorInfo?.avatar,
        description: authorInfo?.description
      }
    })
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.name.localeCompare(b.name, 'it')
    })
    .slice(0, 6)
})

const trendingTags = computed(() => {
  const recentTagCounts = articles.value.slice(0, 24).reduce((acc, article) => {
    getArticleTopicTags(article).forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const totalTagCounts = articles.value.reduce((acc, article) => {
    getArticleTopicTags(article).forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  return Object.entries(recentTagCounts)
    .filter(([tag]) => (totalTagCounts[tag] || 0) > 5)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return a[0].localeCompare(b[0], 'it')
    })
    .slice(0, 10)
    .map(([tag]) => ({ tag, count: totalTagCounts[tag] || 0 }))
})

// Get sections from centralized config
const sections = getHomeSections()
</script>

<template>
  <UPage>
    <UPageBody
      :ui="{
        body: 'space-y-0 my-0'
      }"
    >
      <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-6 mb-6">
        <div class="relative overflow-hidden">
          <div class="relative grid grid-cols-1 xl:grid-cols-[1.1fr_.9fr] gap-6 lg:gap-8">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-4">
                <UBadge
                  color="neutral"
                  variant="subtle"
                >
                  {{ articles.length }} contenuti pubblicati
                </UBadge>
                <UBadge
                  color="warning"
                  variant="subtle"
                >
                  {{ freshThisWeekCount }} nuovi questa settimana
                </UBadge>
              </div>

              <h1 class="text-3xl md:text-5xl font-bold text-balance leading-tight text-gray-900 dark:text-white">
                Pauper, meta e community:
                <span class="text-primary">contenuti aggiornati ogni settimana</span>
              </h1>

              <p class="mt-4 text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-2xl text-pretty">
                Deck tech, report, tutorial e approfondimenti: esplora gli ultimi articoli, segui gli autori più attivi e entra subito nella sezione che ti interessa.
              </p>

              <div class="mt-5 flex flex-wrap gap-3">
                <UButton
                  to="/articles"
                  color="primary"
                  size="lg"
                >
                  Esplora tutti gli articoli
                </UButton>
                <UButton
                  to="/authors"
                  variant="soft"
                  color="neutral"
                  size="lg"
                >
                  Scopri gli autori
                </UButton>
              </div>

              <div class="mt-6">
                <p class="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-3">
                  Naviga per categoria
                </p>
                <div class="flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="item in categoryHighlights"
                    :key="`hero-category-${item.category}`"
                    :to="`/articles?category=${item.category}`"
                    class="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 px-3 py-1.5 text-sm hover:border-primary-400 hover:text-primary transition-colors"
                  >
                    <span>{{ item.label }}</span>
                    <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300">
                      {{ item.count }}
                    </span>
                  </NuxtLink>
                </div>
              </div>

              <div
                v-if="topAuthors.length"
                class="mt-6"
              >
                <p class="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-3">
                  Autori più prolifici
                </p>
                <div class="flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="author in topAuthors"
                    :key="`hero-author-${author.key}`"
                    :to="`/authors/${author.slug}`"
                    class="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 px-2.5 py-1.5 hover:border-primary-400 transition-colors"
                  >
                    <UAvatar
                      :src="author.avatar"
                      :alt="author.name"
                      size="sm"
                    />
                    <span class="text-sm text-gray-900 dark:text-gray-100">{{ author.name }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ author.count }}</span>
                  </NuxtLink>
                </div>
                
                <UCard
                  v-if="trendingTags.length"
                  class="mt-4 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/65 backdrop-blur-sm"
                >
                  <div class="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <p class="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 font-semibold">
                        Tag recenti
                      </p>
                      <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                        Temi caldi
                      </h2>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <NuxtLink
                      v-for="item in trendingTags"
                      :key="`tag-${item.tag}`"
                      :to="{ path: '/articles', query: { tag: item.tag } }"
                      :aria-label="`Filtra articoli per tag ${item.tag}`"
                      class="inline-flex"
                    >
                      <UBadge
                        color="primary"
                        variant="subtle"
                        class="cursor-pointer transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/40"
                      >
                        {{ item.tag }} · {{ item.count }}
                      </UBadge>
                    </NuxtLink>
                  </div>
                </UCard>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
              <NuxtLink
                v-if="featuredArticle"
                :to="featuredArticle.path"
                custom
                v-slot="{ navigate }"
              >
                <UCard
                  class="relative overflow-hidden border-gray-200 dark:border-gray-800 bg-white/85 dark:bg-gray-900/75 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-lg active:scale-[0.995]"
                  role="link"
                  tabindex="0"
                  @click="navigate"
                  @keydown.enter.prevent="navigate"
                  @keydown.space.prevent="navigate"
                >
                  <div class="space-y-4">
                    <div
                      v-if="getThumbnailSrc(featuredArticle.thumbnail)"
                      class="overflow-hidden rounded-xl border border-gray-200/70 dark:border-gray-800/70"
                    >
                      <img
                        :src="getThumbnailSrc(featuredArticle.thumbnail)"
                        :alt="featuredArticle.title"
                        class="h-44 w-full object-cover"
                      >
                    </div>

                    <div class="flex items-center justify-between gap-3 flex-wrap">
                      <UBadge
                        color="primary"
                        variant="soft"
                      >
                        In evidenza
                      </UBadge>
                      <span class="text-sm text-gray-500 dark:text-gray-400">
                        {{ formatDateIT(featuredArticle.date) }}
                      </span>
                    </div>

                    <div class="space-y-2">
                      <p class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                        {{ CATEGORY_LABELS[featuredArticle.category as CategoryType] }}
                      </p>
                      <NuxtLink
                        :to="featuredArticle.path"
                        class="block text-xl font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors text-balance"
                      >
                        {{ featuredArticle.title }}
                      </NuxtLink>
                      <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {{ featuredArticle.description }}
                      </p>
                    </div>

                    <div class="flex items-center justify-between gap-3 flex-wrap">
                      <NuxtLink
                        :to="`/authors/${getAuthorSlug(authorsMap[featuredArticle.author]?.name || featuredArticle.author)}`"
                        class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                        @click.stop
                        @keydown.enter.stop
                      >
                        <UAvatar
                          :src="authorsMap[featuredArticle.author]?.avatar"
                          :alt="authorsMap[featuredArticle.author]?.name || featuredArticle.author"
                          size="sm"
                        />
                        <span>{{ authorsMap[featuredArticle.author]?.name || featuredArticle.author }}</span>
                      </NuxtLink>
                      <UButton
                        :to="featuredArticle.path"
                        size="sm"
                        color="primary"
                        variant="soft"
                        @click.stop
                      >
                        Leggi ora
                      </UButton>
                    </div>
                  </div>
                </UCard>
              </NuxtLink>

              <div class="grid grid-cols-1 gap-3">
                <NuxtLink
                  v-for="article in heroSecondaryArticles"
                  :key="`hero-secondary-${article._id}`"
                  :to="article.path"
                  class="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/65 p-4 hover:border-primary-400 dark:hover:border-primary-500 transition-all hover:shadow-lg"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="flex items-center gap-2 flex-wrap mb-2">
                        <UBadge
                          color="neutral"
                          variant="soft"
                        >
                          {{ CATEGORY_LABELS[article.category as CategoryType] }}
                        </UBadge>
                        <UBadge
                          v-if="getArticleBadge(article.date)"
                          :color="getArticleBadge(article.date)?.color"
                          variant="soft"
                        >
                          {{ getArticleBadge(article.date)?.label }}
                        </UBadge>
                      </div>
                      <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                        {{ article.title }}
                      </h3>
                      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {{ article.description }}
                      </p>
                    </div>
                    <span class="shrink-0 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {{ formatDateIT(article.date) }}
                    </span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mb-4">
        <div class="flex items-end justify-between gap-3 mb-5">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
              Esplora
            </p>
            <h2 class="text-2xl md:text-3xl font-bold">
              Sezioni del blog
            </h2>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Tutte le categorie, ordinate per priorità editoriale
          </p>
        </div>
      </section>

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
    </UPageBody>
  </UPage>
</template>
