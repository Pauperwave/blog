<script setup lang="ts">
import type { AuthorSocials } from '~/constants/author-socials'

interface AuthorCategoryStat {
  category: string
  count: number
}

interface AuthorGridItem {
  name: string
  avatar: string
  description: string
  nickname?: string
  bio?: string
  articleCount: number
  latestArticleDate?: string
  categories: AuthorCategoryStat[]
  socials?: AuthorSocials
}

interface Props {
  author: AuthorGridItem
  to: string
  categoryLabels: Record<string, string>
}

const props = defineProps<Props>()
</script>

<template>
  <NuxtLink
    :to="props.to"
    custom
    v-slot="{ navigate }"
  >
    <UCard
      class="h-full border-gray-200 dark:border-gray-800 transition-all duration-300 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      role="link"
      tabindex="0"
      @click="navigate"
      @keydown.enter.prevent="navigate"
    >
      <div class="flex items-start gap-4">
        <UAvatar
          :src="props.author.avatar"
          :alt="props.author.name"
          size="lg"
          class="shrink-0"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="text-lg font-semibold truncate">
                {{ props.author.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ props.author.description }}
              </p>
            </div>
            <span
              class="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
              :class="props.author.articleCount > 0 ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'"
            />
          </div>

          <p
            v-if="props.author.nickname"
            class="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            {{ props.author.nickname }}
          </p>
        </div>
      </div>

      <p
        v-if="props.author.bio"
        class="mt-4 text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
      >
        {{ props.author.bio }}
      </p>

      <div class="mt-4 flex items-center gap-2 flex-wrap">
        <UBadge
          color="primary"
          variant="soft"
        >
          {{ props.author.articleCount }} {{ props.author.articleCount === 1 ? 'articolo' : 'articoli' }}
        </UBadge>

        <UBadge
          v-if="props.author.latestArticleDate"
          color="neutral"
          variant="soft"
        >
          {{ formatDateIT(props.author.latestArticleDate) }}
        </UBadge>

        <UBadge
          v-if="props.author.categories[0]"
          color="neutral"
          variant="soft"
        >
          {{ props.categoryLabels[props.author.categories[0].category] || props.author.categories[0].category }}
        </UBadge>
      </div>

      <AuthorSocialLinks
        :socials="props.author.socials"
        variant="icons"
        :max-items="4"
        :show-count="true"
        count-label="link social"
        class="mt-4 justify-between gap-3"
      />
    </UCard>
  </NuxtLink>
</template>
