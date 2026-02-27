<script setup lang="ts">
import {
  type AnyArticle,
  type CategoryType,
  CATEGORY_LABELS,
  CONTENT_TYPE_ORDER,
  queryAllCollections,
  combineArticles
} from '~/constants/content-config'
import { AUTHOR_SOCIAL_LINKS, type AuthorSocials } from '~/constants/author-socials'

interface AuthorRecord {
  name: string
  avatar: string
  description: string
  bio?: string
  url?: string
  nickname?: string
  socials?: AuthorSocials
}

interface AuthorCategoryStat {
  category: CategoryType
  count: number
}

interface AuthorWithStats extends AuthorRecord {
  articleCount: number
  latestArticleDate?: string
  latestArticleTitle?: string
  latestArticlePath?: string
  categories: AuthorCategoryStat[]
  socialCount: number
}

type SortMode = 'articles' | 'recent' | 'name';

const searchQuery = ref('')
const showOnlyActive = ref(false)
const sortMode = ref<SortMode>('articles')

const { data: authors } = await useAsyncData('authors-index', () =>
  queryCollection('authors').all()
)

const { data: allArticles } = await useAsyncData('authors-index-articles', async () => {
  const collectionsData = await queryAllCollections()
  return combineArticles(collectionsData)
})

const publishedArticles = computed(() =>
  [...(allArticles.value || [])]
    .filter((article: AnyArticle) => article.published !== false)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
)

const authorsWithStats = computed<AuthorWithStats[]>(() => {
  if (!authors.value) return []

  return (authors.value as AuthorRecord[])
    .map((author) => {
      const authorArticles = publishedArticles.value.filter(
        article => article.author.toLowerCase() === author.name.toLowerCase()
      )

      const latestArticle = authorArticles[0]
      const categoryCounts = authorArticles.reduce((acc, article) => {
        const category = article.category as CategoryType
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Partial<Record<CategoryType, number>>)

      const categories = CONTENT_TYPE_ORDER
        .map(category => ({
          category,
          count: categoryCounts[category] || 0
        }))
        .filter(item => item.count > 0)

      const socialCount = AUTHOR_SOCIAL_LINKS.filter(link => !!author.socials?.[link.key]).length

      return {
        ...author,
        articleCount: authorArticles.length,
        latestArticleDate: latestArticle?.date,
        latestArticleTitle: latestArticle?.title,
        latestArticlePath: latestArticle?.path,
        categories,
        socialCount
      }
    })
    .sort((a, b) => {
      if (b.articleCount !== a.articleCount) return b.articleCount - a.articleCount
      return a.name.localeCompare(b.name, 'it')
    })
})

const filteredAuthors = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  let list = [...authorsWithStats.value]

  if (showOnlyActive.value) {
    list = list.filter(author => author.articleCount > 0)
  }

  if (query) {
    list = list.filter((author) => {
      const haystack = [
        author.name,
        author.nickname,
        author.description,
        author.bio
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }

  if (sortMode.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name, 'it'))
    return list
  }

  if (sortMode.value === 'recent') {
    list.sort((a, b) => {
      const aTime = a.latestArticleDate ? new Date(a.latestArticleDate).getTime() : 0
      const bTime = b.latestArticleDate ? new Date(b.latestArticleDate).getTime() : 0
      if (bTime !== aTime) return bTime - aTime
      if (b.articleCount !== a.articleCount) return b.articleCount - a.articleCount
      return a.name.localeCompare(b.name, 'it')
    })
    return list
  }

  list.sort((a, b) => {
    if (b.articleCount !== a.articleCount) return b.articleCount - a.articleCount
    const aTime = a.latestArticleDate ? new Date(a.latestArticleDate).getTime() : 0
    const bTime = b.latestArticleDate ? new Date(b.latestArticleDate).getTime() : 0
    if (bTime !== aTime) return bTime - aTime
    return a.name.localeCompare(b.name, 'it')
  })

  return list
})

const featuredAuthors = computed(() => filteredAuthors.value.slice(0, 2))
const remainingAuthors = computed(() => filteredAuthors.value.slice(featuredAuthors.value.length))

const totalPublishedArticles = computed(() => publishedArticles.value.length)
const activeAuthors = computed(() =>
  authorsWithStats.value.filter(author => author.articleCount > 0).length
)
const topAuthor = computed(() =>
  authorsWithStats.value.find(author => author.articleCount > 0) || authorsWithStats.value[0]
)
const newestPublishedArticle = computed(() => publishedArticles.value[0])

const overallCategoryStats = computed(() =>
  CONTENT_TYPE_ORDER
    .map(category => ({
      category,
      count: publishedArticles.value.filter(article => article.category === category).length
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
)

const hasActiveFilters = computed(() =>
  showOnlyActive.value || !!searchQuery.value.trim() || sortMode.value !== 'articles'
)

const clearFilters = () => {
  searchQuery.value = ''
  showOnlyActive.value = false
  sortMode.value = 'articles'
}

const setSortMode = (mode: SortMode) => {
  sortMode.value = mode
}

useSeoMeta({
  title: 'Autori',
  description: 'Scopri tutti gli autori del sito e i loro articoli pubblicati.',
  ogTitle: 'Autori',
  ogDescription: 'Scopri tutti gli autori del sito e i loro articoli pubblicati.'
})
</script>

<template>
  <UPage>
    <UPageHeader
      title="Autori"
      description="Il team editoriale con i rispettivi contributi pubblicati."
    >
      <template #headline>
        <UBadge
          variant="soft"
          color="primary"
        >
          Team
        </UBadge>
      </template>
    </UPageHeader>

    <UPageBody>
      <UEmpty
        v-if="authorsWithStats.length === 0"
        title="Nessun autore trovato"
        description="Non ci sono ancora autori disponibili."
        variant="naked"
        :actions="[{ label: 'Torna alla home', to: '/' }]"
      />

      <template v-else>
        <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-6 mb-6">
          <div class="relative grid grid-cols-1 lg:grid-cols-[1.25fr_.75fr] gap-6">
            <div>
              <p class="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-2">
                Redazione
              </p>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-balance">
                Voci, deck tech e report della community
              </h2>
              <p class="mt-3 text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-2xl">
                Cerca gli autori, scopri chi pubblica di piu e accedi ai loro profili con articoli recenti e categorie principali.
              </p>

              <div class="mt-4 flex flex-wrap gap-2">
                <UBadge
                  v-for="item in overallCategoryStats.slice(0, 4)"
                  :key="item.category"
                  variant="soft"
                  color="neutral"
                >
                  {{ CATEGORY_LABELS[item.category] }}: {{ item.count }}
                </UBadge>
              </div>

              <div
                v-if="newestPublishedArticle"
                class="mt-4 text-sm text-gray-700 dark:text-gray-300"
              >
                Ultimo contenuto pubblicato:
                <NuxtLink
                  :to="newestPublishedArticle.path"
                  class="font-medium text-primary hover:underline"
                >
                  {{ newestPublishedArticle.title }}
                </NuxtLink>
                ({{ formatDateIT(newestPublishedArticle.date) }})
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <UCard class="bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm">
                <p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Autori</p>
                <p class="mt-1 text-2xl font-bold">{{ authorsWithStats.length }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ activeAuthors }} attivi
                </p>
              </UCard>

              <UCard class="bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm">
                <p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Articoli</p>
                <p class="mt-1 text-2xl font-bold">{{ totalPublishedArticles }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Pubblicati
                </p>
              </UCard>

              <UCard class="bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm">
                <p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Top autore</p>
                <p class="mt-1 text-lg font-bold truncate">
                  {{ topAuthor?.name || 'N/D' }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ topAuthor ? `${topAuthor.articleCount} articoli pubblicati` : 'Nessun dato disponibile' }}
                </p>
              </UCard>
            </div>
          </div>
        </section>

        <UCard class="mb-6">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col lg:flex-row lg:items-center gap-3">
              <div class="w-full lg:max-w-md">
                <UInput
                  v-model="searchQuery"
                  placeholder="Cerca per nome, nickname o bio..."
                  class="w-full"
                />
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <UButton
                  :variant="showOnlyActive ? 'solid' : 'outline'"
                  color="primary"
                  size="sm"
                  @click="showOnlyActive = !showOnlyActive"
                >
                  Solo autori attivi
                </UButton>

                <UButton
                  :variant="sortMode === 'articles' ? 'solid' : 'outline'"
                  color="neutral"
                  size="sm"
                  @click="setSortMode('articles')"
                >
                  Piu articoli
                </UButton>

                <UButton
                  :variant="sortMode === 'recent' ? 'solid' : 'outline'"
                  color="neutral"
                  size="sm"
                  @click="setSortMode('recent')"
                >
                  Piu recenti
                </UButton>

                <UButton
                  :variant="sortMode === 'name' ? 'solid' : 'outline'"
                  color="neutral"
                  size="sm"
                  @click="setSortMode('name')"
                >
                  A-Z
                </UButton>

                <UButton
                  v-if="hasActiveFilters"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  @click="clearFilters"
                >
                  Reset
                </UButton>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 flex-wrap text-sm text-gray-600 dark:text-gray-400">
              <span>{{ filteredAuthors.length }} risultati</span>
              <span v-if="searchQuery.trim()">
                Ricerca: "{{ searchQuery.trim() }}"
              </span>
            </div>
          </div>
        </UCard>

        <UEmpty
          v-if="filteredAuthors.length === 0"
          title="Nessun risultato"
          description="Prova a cambiare ricerca o filtri."
          variant="naked"
        />
        <div
          v-if="filteredAuthors.length === 0"
          class="mt-4 flex justify-center"
        >
          <UButton
            variant="outline"
            color="neutral"
            @click="clearFilters"
          >
            Reset filtri
          </UButton>
        </div>

        <template v-else>
          <section
            v-if="featuredAuthors.length > 0"
            class="mb-8"
          >
            <div class="flex items-end justify-between gap-3 mb-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
                  In evidenza
                </p>
                <h2 class="text-xl md:text-2xl font-bold">
                  Autori principali
                </h2>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Ordinati per {{ sortMode === 'name' ? 'nome' : sortMode === 'recent' ? 'attivita recente' : 'numero di articoli' }}
              </p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <FeaturedAuthorCard
                v-for="author in featuredAuthors"
                :key="`featured-${author.name}`"
                :author="author"
                :to="`/authors/${getAuthorSlug(author.name)}`"
                :category-labels="CATEGORY_LABELS"
              />
            </div>
          </section>

          <section v-if="remainingAuthors.length > 0">
            <div class="flex items-end justify-between gap-3 mb-4">
              <h2 class="text-xl md:text-2xl font-bold">
                Tutti gli autori
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ remainingAuthors.length }} profili aggiuntivi
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AuthorGridCard
                v-for="author in remainingAuthors"
                :key="author.name"
                :to="`/authors/${getAuthorSlug(author.name)}`"
                :author="author"
                :category-labels="CATEGORY_LABELS"
              />
            </div>
          </section>
        </template>
      </template>
    </UPageBody>
  </UPage>
</template>
