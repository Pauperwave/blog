<!-- app\pages\articles\[id].vue -->
<script setup lang="ts">
import { intersection, orderBy, orderByMultiple } from "~/utils/array"
import type { Author } from '~/composables/useAuthor'
import {
  type AnyArticle,
  queryAllCollections,
  combineArticles,
  getCollectionNames
} from '~/constants/content-config'
import { getRecentArticleBadge as getBadge } from '~/utils/article-badges'
import {
  buildGlobalNormalizedLocationSet,
  getArticleTagFilterQuery
} from '~/utils/article-filters'
import { normalizeAuthors } from '~/composables/useAuthor'

import appMeta from "~/app.meta"

const route = useRoute()
const tocTitle = 'In questo articolo'

const { data } = await useAsyncData(route.path, async () => {
  const collections = getCollectionNames()
  for (const collection of collections) {
    const result = await queryCollection(collection).path(route.path).first()
    if (result) return result
  }
  return null
})

// Single query for all article authors
const { data: authorsData } = await useAsyncData<Author[]>(
  `authors-${route.path}`,
  async () => {
    if (!data.value?.author) return []
    const names = normalizeAuthors(data.value.author)
    const authors = await queryCollection('authors')
      .where('name', 'IN', names)
      .all()

    // Restore original frontmatter order
    return names
      .map(name => authors.find(a => a.name.toLowerCase() === name.toLowerCase()))
      .filter(Boolean) as Author[]
  }
)

const formattedDate = useState(`article-date-${route.path}`, () => {
  return data.value?.date ? formatDateIT(data.value.date) : 'Data non disponibile'
})

const MAX_RELATED_ARTICLES = 3
const relatedArticlesString = "Altri articoli correlati"

const { data: relatedArticlesData } = await useAsyncData(`linked-${route.path}`, async () => {
  const collectionsData = await queryAllCollections()
  const allArticles: AnyArticle[] = combineArticles(collectionsData)
  const filterableArticles = allArticles.filter(a => a.published !== false)
  const publishedArticles = allArticles.filter(a => a.published === true)
  const globalNormalizedLocationSet = buildGlobalNormalizedLocationSet(filterableArticles)
  const filtered = publishedArticles.filter(a => a.path !== data.value?.path)

  const withCommonTags = filtered.map(a => ({
    article: a,
    commonTags: intersection(a.tags, data.value?.tags || []).length
  }))

  let sorted = orderByMultiple(
    withCommonTags,
    [item => item.commonTags, item => new Date(item.article.date).getTime()],
    ['desc', 'desc']
  ).map(item => item.article)

  if (sorted.length < MAX_RELATED_ARTICLES) {
    sorted = orderBy(filtered, a => new Date(a.date).getTime(), 'desc').slice(0, MAX_RELATED_ARTICLES)
  }

  return {
    links: sorted.slice(0, MAX_RELATED_ARTICLES),
    globalNormalizedLocationValues: Array.from(globalNormalizedLocationSet)
  }
})

const links = computed(() => relatedArticlesData.value?.links || [])
const globalNormalizedLocationSet = computed(
  () => new Set(relatedArticlesData.value?.globalNormalizedLocationValues || [])
)

const getTagFilterLink = (tag: string) => ({
  path: '/articles',
  query: getArticleTagFilterQuery(data.value, tag, {
    globalNormalizedLocationSet: globalNormalizedLocationSet.value
  })
})

// Single query for all related article authors
const { data: relatedAuthorsData } = await useAsyncData<Author[]>(
  `related-authors-${route.path}`,
  async () => {
    const allNames = [...new Set(
      (links.value || []).flatMap(article => normalizeAuthors(article.author))
    )]
    if (!allNames.length) return []
    const authors = await queryCollection('authors')
      .where('name', 'IN', allNames)
      .all()

    return allNames
      .map(name => authors.find(a => a.name.toLowerCase() === name.toLowerCase()))
      .filter(Boolean) as Author[]
  }
)

const relatedAuthorsMap = computed(() => {
  const map: Record<string, Author[]> = {}
  for (const article of links.value || []) {
    const names = normalizeAuthors(article.author)
    map[article.path] = names
      .map(name =>
        relatedAuthorsData.value?.find(
          a => a.name.toLowerCase() === name.toLowerCase()
        )
      )
      .filter(Boolean) as Author[]
  }
  return map
})

const { data: surround } = await useAsyncData(`${route.path}-surround`, async () => {
  const collections = getCollectionNames()
  for (const collection of collections) {
    try {
      const result = await queryCollectionItemSurroundings(collection, route.path, {
        fields: ["description"],
      })
      if (result) return result
    } catch (e) {
      console.error(`[DEBUG] Error in collection ${collection}:`, e)
    }
  }
  return undefined
})

updateMeta()

function updateMeta() {
  useSchemaOrg([
    defineArticle({
      headline: data.value?.title,
      description: data.value?.description,
      image: data.value?.thumbnail,
      keywords: data.value?.tags,
      author: {
        name: authorsData.value?.[0]?.name,
        description: authorsData.value?.[0]?.description,
        image: authorsData.value?.[0]?.avatar,
      },
      publisher: definePerson({
        name: appMeta.author.name,
        description: appMeta.author.description,
        image: appMeta.author.image,
        url: appMeta.author.url,
      }),
    }),
  ])

  useSeoMeta({
    title: data.value?.title,
    description: data.value?.description,
    ogImage: data.value?.thumbnail,
    ogImageWidth: 1200,
    ogImageHeight: 630,
    twitterCard: 'summary_large_image',
    twitterImage: data.value?.thumbnail,
  })

  defineOgImageComponent("Article", {
    thumbnail: data.value?.thumbnail,
    title: data.value?.title,
    author: {
      name: authorsData.value?.[0]?.name,
      image: authorsData.value?.[0]?.avatar,
    },
  })
}

</script>

<template>
  <UPage :ui="{ center: 'lg:col-span-7!' }">

    <template #right>
      <UPageAside :ui="{ root: 'lg:col-span-3!' }">
        <UPageAnchors
          :links="[
            { label: 'Canale YouTube', icon: 'i-lucide-youtube', to: 'https://www.youtube.com/@alessandromoretti1177', target: '_blank' },
            { label: 'Tutti gli articoli', icon: 'i-lucide-book-open-text', to: '/articles' },
          ]"
        />
        <USeparator
          type="dotted"
          class="mt-4"
        />
        <UContentToc
          v-if="data"
          :title="tocTitle"
          :links="data.body.toc?.links"
          highlight
        />
      </UPageAside>
    </template>

    <UPageHeader
      :title="data?.title"
      :description="data?.description"
      headline="Blog"
    >
      <div class="flex items-end flex-wrap gap-4 justify-between mt-4">
        <div class="flex flex-col gap-4">
          <div class="flex flex-row gap-2 items-center flex-wrap">
            <NuxtLink
              v-for="tag in data?.tags"
              :key="tag"
              :to="getTagFilterLink(tag)"
              class="rounded-full focus-visible:outline focus-visible:outline-primary"
            >
              <UBadge
                color="primary"
                variant="soft"
                class="cursor-pointer transition-opacity hover:opacity-80"
              >
                {{ tag }}
              </UBadge>
            </NuxtLink>
          </div>
          <div class="flex flex-wrap gap-2">
            <AuthorCard
              v-for="author in authorsData"
              :key="author.name"
              :author="author"
              :clickable="true"
              @click="navigateTo(`/authors/${getAuthorSlug(author.name)}`)"
            />
          </div>
        </div>
        <div class="flex flex-row items-center gap-4">
          <p class="flex flex-row items-center gap-1 typ-sublabel">
            <icon
              name="i-lucide-calendar"
              class="text-primary"
            /> {{ formattedDate }}
          </p>
          <!-- <p class="flex flex-row items-center gap-1 typ-sublabel"><icon name="i-lucide-alarm-clock" class="text-primary"></icon> {{ readingTimeText }}</p> -->
        </div>
        <NuxtImg
          v-if="data?.thumbnail"
          :src="data.thumbnail"
          :alt="data.title"
          class="w-full h-auto rounded-lg shadow-lg aspect-video object-cover"
          loading="lazy"
        />
      </div>
    </UPageHeader>

    <UPageBody>
      <ContentRenderer
        v-if="data"
        id="content"
        :value="data"
        class="markdown-content flex-1"
      />
      <template v-if="authorsData && authorsData.length > 0">
        <div class="flex flex-col gap-4">
          <AuthorAboutCard
            v-for="author in authorsData"
            :key="author.name"
            :src="author.avatar"
            :name="author.name"
            :description="author.description"
            :url="author.url"
            :socials="author.socials"
          >
            <template
              v-if="author.bio"
              #body
            >
              <p class="text-sm text-muted mt-2">
                {{ author.bio }}
              </p>
            </template>
          </AuthorAboutCard>
        </div>
      </template>
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
    </UPageBody>
  </UPage>
</template>

<style lang="css">
@reference "~/assets/css/main.css";

/* Create custom max-lg variant for screens smaller than 1024px */
@custom-variant max-lg (@media (max-width: 1023px));

/* Apply the variant to all elements in this component */
* {
  scroll-margin-top: calc(var(--ui-header-height) + 1rem);

  @variant max-lg {
    scroll-margin-top: calc(var(--ui-header-height) + 4rem) !important;
  }
}
</style>
