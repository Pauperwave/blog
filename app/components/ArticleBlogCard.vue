<script setup lang="ts">
import type { BadgeProps } from '@nuxt/ui'
import type { Author } from '~/composables/useAuthor'
import type { AnyArticle } from '~/constants/content-config'
import { getArticleFilterLocation } from '~/utils/article-filters'

interface Props {
  article: AnyArticle
  authorData?: Author | null
  topicTags?: string[]
  badge?: string | BadgeProps
}

const props = withDefaults(defineProps<Props>(), {
  authorData: null,
  topicTags: () => [],
  badge: undefined
})

const showAuthors = computed(() => {
  const category = props.article.category
  return category !== 'decklist' && category !== 'report'
})

const articleLocation = computed(() => getArticleFilterLocation(props.article))
</script>

<template>
  <UBlogPost
    :title="props.article.title"
    :image="props.article.thumbnail"
    :badge="props.badge"
    :date="props.article.date"
    :to="props.article.path"
    variant="naked"
    class="group border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-400/10 hover:-translate-y-1 hover:scale-[1.02] bg-white dark:bg-gray-900/50 backdrop-blur-sm"
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
          v-if="articleLocation"
          :key="`${props.article.path}-location-${articleLocation}`"
          color="info"
          variant="soft"
        >
          {{ articleLocation }}
        </UBadge>
        <UBadge
          v-for="tag in props.topicTags"
          :key="`${props.article.path}-tag-${tag}`"
          color="primary"
          variant="soft"
        >
          {{ tag }}
        </UBadge>
      </div>
    </template>
    <template
      v-if="showAuthors"
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
