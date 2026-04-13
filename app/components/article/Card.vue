<!-- app/components/article/Card.vue -->
<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'
import type { Author } from '~/composables/useAuthor'
import type { AnyArticle } from '~/constants/content-config'
import { getArticleFilterLocation, hasLeagueTag } from '~/utils/article-filters'
import { normalizeAuthors } from '~/composables/useAuthor'

interface Props {
  article: AnyArticle
  authorData?: Author | Author[] | null
  topicTags?: string[]
  badge?: string | BadgeProps
  showAuthor?: boolean
  categoryLabel?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  authorData: null,
  topicTags: () => [],
  badge: undefined,
  showAuthor: true,
  categoryLabel: null
})

const authorsList = computed<Author[]>(() => {
  if (props.authorData) {
    return Array.isArray(props.authorData) ? props.authorData : [props.authorData]
  }
  // Fallback to article.author names
  const authorNames = normalizeAuthors(props.article.author)
  return authorNames.map(name => ({ name, description: '', avatar: '', bio: '', url: '', socials: undefined }))
})

const shouldShowAuthor = computed(() => {
  if (!props.showAuthor) return false
  const category = props.article.category
  return category !== 'decklist' && category !== 'report'
})

const articleLocation = computed(() => getArticleFilterLocation(props.article))
const isLeagueArticle = computed(() => hasLeagueTag(props.article))
const displayedTopicTags = computed(() => {
  const normalizedLocation = articleLocation.value?.trim().toLowerCase() || null
  const seen = new Set<string>()

  return props.topicTags.filter((tag) => {
    if (typeof tag !== 'string') return false
    const normalizedTag = tag.trim().toLowerCase()
    if (!normalizedTag) return false
    if (normalizedTag === 'league') return false
    if (normalizedLocation && normalizedTag === normalizedLocation) return false
    if (seen.has(normalizedTag)) return false
    seen.add(normalizedTag)
    return true
  })
})

const deckTags = computed(() => props.article.decks || [])
const commonTags = computed(() => props.article.tags || [])

const cardVariantClasses = computed(() =>
  isLeagueArticle.value
    ? 'border-sky-300/80 dark:border-sky-600/70 bg-sky-50/50 dark:bg-sky-500/5 hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-sky-500/10 dark:hover:shadow-sky-400/10'
    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-primary-500/10 dark:hover:shadow-primary-400/10'
)
</script>

<template>
  <UBlogPost
    :title="props.article.title"
    :image="props.article.thumbnail"
    :badge="props.badge"
    :date="props.article.date"
    :to="props.article.path"
    variant="naked"
    :class="[
      'group border rounded-xl p-4 backdrop-blur-sm',
      'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]',
      cardVariantClasses
    ]"
  >
    <template #date>
      {{ useState(`article-date-${props.article.path}`, () => formatDateIT(props.article.date)).value }}
    </template>
    <template #description>
      <p class="mt-1 text-base text-pretty">
        {{ props.article.description }}
      </p>
      <div class="flex flex-row gap-2 items-center flex-wrap mt-3">
        <UBadge
          v-if="props.categoryLabel"
          :key="`${props.article.path}-category-${props.categoryLabel}`"
          color="neutral"
          variant="soft"
        >
          {{ props.categoryLabel }}
        </UBadge>
        <UBadge
          v-if="isLeagueArticle"
          :key="`${props.article.path}-league`"
          color="info"
          variant="soft"
        >
          League
        </UBadge>
        <UBadge
          v-if="articleLocation"
          :key="`${props.article.path}-location-${articleLocation}`"
          color="info"
          variant="soft"
        >
          {{ articleLocation }}
        </UBadge>
        <UBadge
          v-if="deckTags.length === 1"
          :key="`${props.article.path}-deck-single`"
          color="warning"
          variant="soft"
        >
          Deck: {{ deckTags[0] }}
        </UBadge>
        <div
          v-if="deckTags.length > 1"
          :key="`${props.article.path}-deck-multiple`"
          class="flex flex-row gap-2 items-center"
        >
          <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">Decks:</span>
          <UBadge
            v-for="tag in deckTags"
            :key="`${props.article.path}-deck-${tag}`"
            color="warning"
            variant="soft"
          >
            {{ tag }}
          </UBadge>
        </div>
        <UBadge
          v-for="tag in commonTags"
          :key="`${props.article.path}-tag-${tag}`"
          color="primary"
          variant="soft"
        >
          {{ tag }}
        </UBadge>
      </div>
    </template>
    <template
      v-if="shouldShowAuthor"
      #authors
    >
      <div class="flex flex-wrap gap-2">
        <AuthorCard
          v-for="author in authorsList"
          :key="author.name"
          :author="author"
          :clickable="false"
        />
      </div>
    </template>
  </UBlogPost>
</template>
