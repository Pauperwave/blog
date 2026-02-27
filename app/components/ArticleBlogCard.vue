<!-- app/components/ArticleBlogCard.vue -->
<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'
import type { Author } from '~/composables/useAuthor'
import type { AnyArticle } from '~/constants/content-config'
import { getArticleFilterLocation, hasLeagueTag } from '~/utils/article-filters'

interface Props {
  article: AnyArticle
  authorData?: Author | null
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
      'group border rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] backdrop-blur-sm',
      isLeagueArticle
        ? 'border-sky-300/80 dark:border-sky-600/70 bg-sky-50/50 dark:bg-sky-500/5 hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-sky-500/10 dark:hover:shadow-sky-400/10'
        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-primary-500/10 dark:hover:shadow-primary-400/10'
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
          v-for="tag in displayedTopicTags"
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
      <AuthorCard
        :author="{
          name: props.authorData?.name || props.article.author,
          description: props.authorData?.description,
          avatar: props.authorData?.avatar,
          bio: props.authorData?.bio,
          socials: props.authorData?.socials
        }"
        :clickable="false"
      />
    </template>
  </UBlogPost>
</template>
