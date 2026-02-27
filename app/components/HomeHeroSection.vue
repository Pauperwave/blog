<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'
import { getAuthorSlug } from '~/composables/useAuthorSlug'
import {
  type AnyArticle,
  type CategoryType,
  CATEGORY_LABELS
} from '~/constants/content-config'
import { getRecentArticleBadge as getArticleBadge } from '~/utils/article-badges'

interface HeroCategoryHighlight {
  category: CategoryType
  label: string
  count: number
}

interface Props {
  articles: AnyArticle[]
  freshThisWeekCount: number
  categoryHighlights: HeroCategoryHighlight[]
  authorsMap: Record<string, Author>
}

const props = defineProps<Props>()

const articles = computed(() => props.articles)
const topCategoryHighlights = computed(() => props.categoryHighlights)

const featuredArticle = computed(() => articles.value[0] || null)
const heroSecondaryArticles = computed(() => articles.value.slice(1, 5))
const featuredThumbnailSrc = computed(() =>
  featuredArticle.value ? getThumbnailSrc(featuredArticle.value.thumbnail) : undefined
)
const heroSecondaryCards = computed(() =>
  heroSecondaryArticles.value.map(article => ({
    article,
    badge: getArticleBadge(article.date)
  }))
)

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
</script>

<template>
  <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 md:p-5 lg:p-6 mb-6">
    <div class="relative overflow-visible space-y-4">
      <div class="relative grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
        <div class="min-w-0 xl:col-span-12">
          <div class="mb-3">
            <UBadge
              color="warning"
              variant="subtle"
            >
              {{ props.freshThisWeekCount }} nuovi questa settimana
            </UBadge>
          </div>

          <h1 class="text-3xl md:text-4xl xl:text-5xl font-bold text-balance leading-tight text-gray-900 dark:text-white">
            Pauper, meta e community
          </h1>

          <p class="mt-3 text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-3xl text-pretty">
            Decklists, report, tutorial e approfondimenti: esplora gli ultimi articoli, segui gli autori più attivi e entra subito nella sezione che ti interessa.
          </p>

          <div class="mt-4 flex flex-wrap gap-2.5">
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

          <div class="mt-3 flex flex-wrap gap-2">
            <NuxtLink
              v-for="item in topCategoryHighlights"
              :key="`hero-category-${item.category}`"
              :to="`/articles?category=${item.category}`"
              class="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 px-3 py-1.5 text-xs md:text-sm text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary transition-colors"
            >
              <span>{{ item.label }}</span>
              <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] md:text-xs text-primary">
                {{ item.count }}
              </span>
            </NuxtLink>
          </div>
        </div>

        <div class="min-w-0 xl:col-span-7">
          <NuxtLink
            v-if="featuredArticle"
            :to="featuredArticle.path"
            custom
            v-slot="{ navigate }"
          >
            <UCard
              class="relative h-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-400/10 hover:-translate-y-1 active:scale-[0.995]"
              role="link"
              tabindex="0"
              @click="navigate"
              @keydown.enter.prevent="navigate"
              @keydown.space.prevent="navigate"
            >
              <div class="space-y-3">
                <div
                  v-if="featuredThumbnailSrc"
                  class="overflow-hidden rounded-xl border border-gray-200/70 dark:border-gray-800/70"
                >
                  <img
                    :src="featuredThumbnailSrc"
                    :alt="featuredArticle.title"
                    class="h-48 md:h-52 w-full object-cover"
                  >
                </div>

                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <UBadge
                    color="primary"
                    variant="soft"
                  >
                    In evidenza
                  </UBadge>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatDateIT(featuredArticle.date) }}
                  </span>
                </div>

                <div class="space-y-1.5">
                  <p class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                    {{ CATEGORY_LABELS[featuredArticle.category as CategoryType] }}
                  </p>
                  <NuxtLink
                    :to="featuredArticle.path"
                    class="block text-lg md:text-xl font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors text-balance leading-snug"
                  >
                    {{ featuredArticle.title }}
                  </NuxtLink>
                  <p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {{ featuredArticle.description }}
                  </p>
                </div>

                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <NuxtLink
                    :to="`/authors/${getAuthorSlug(props.authorsMap[featuredArticle.author]?.name || featuredArticle.author)}`"
                    class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                    @click.stop
                    @keydown.enter.stop
                  >
                    <UAvatar
                      :src="props.authorsMap[featuredArticle.author]?.avatar"
                      :alt="props.authorsMap[featuredArticle.author]?.name || featuredArticle.author"
                      size="sm"
                    />
                    <span>{{ props.authorsMap[featuredArticle.author]?.name || featuredArticle.author }}</span>
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
        </div>

        <aside class="xl:col-span-5">
          <div class="w-full h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 p-3 md:p-4 flex flex-col">
            <div class="flex items-center justify-between gap-2 mb-2.5">
              <p class="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400 font-semibold">
                Ultime pubblicazioni
              </p>
              <UButton
                to="/articles"
                variant="link"
                size="xs"
                color="neutral"
              >
                Vedi tutto
              </UButton>
            </div>

            <div class="grid grid-cols-1 gap-2.5 md:gap-3">
              <NuxtLink
                v-for="{ article, badge } in heroSecondaryCards"
                :key="`hero-secondary-${article._id}`"
                :to="article.path"
                class="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-3 hover:border-primary-400 transition-colors"
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
                        v-if="badge"
                        :color="badge.color"
                        variant="soft"
                      >
                        {{ badge.label }}
                      </UBadge>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {{ article.title }}
                    </h3>
                    <p class="mt-1 text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
                      {{ article.description }}
                    </p>
                  </div>
                  <span class="shrink-0 text-[11px] md:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {{ formatDateIT(article.date) }}
                  </span>
                </div>
              </NuxtLink>
              <p
                v-if="heroSecondaryCards.length === 0"
                class="text-sm text-gray-600 dark:text-gray-400"
              >
                Ancora nessun contenuto recente disponibile.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>
