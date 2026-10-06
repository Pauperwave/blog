<script setup lang="ts">
import type { AuthorSocials } from '~/constants/author-socials'
// Explicit import needed: auto-imports used only in <template> aren't resolved by
// `nuxt typecheck` (vue-tsc -b project references) — https://github.com/nuxt/cli/issues/1224
import { formatDateIT } from '#imports'

interface AuthorCategoryStat {
  category: string
  count: number
}

interface AuthorGridItem {
  name: string
  avatar: string
  description: string
  nickname: string
  bio: string
  socials?: AuthorSocials
  articleCount: number
  latestArticleDate?: string
  categories: AuthorCategoryStat[]
}

interface Props {
  author: AuthorGridItem
  to: string
  categoryLabels: Record<string, string>
}

const { author, to, categoryLabels } = defineProps<Props>()
</script>

<template>
  <NuxtLink
    :to="to"
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
          :as="{ img: 'img' }"
          :src="author.avatar"
          :alt="author.name"
          size="lg"
          class="shrink-0"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="text-lg font-semibold truncate">
                {{ author.name }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ author.description }}
              </p>
            </div>
            <span
              class="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
              :class="author.articleCount > 0 ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'"
            />
          </div>

          <p
            v-if="author.nickname"
            class="mt-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            {{ author.nickname }}
          </p>
        </div>
      </div>

      <p
        v-if="author.bio"
        class="mt-4 text-sm text-gray-700 dark:text-gray-300 line-clamp-2"
      >
        {{ author.bio }}
      </p>

      <div class="mt-4 flex items-center gap-2 flex-wrap">
        <UBadge
          color="primary"
          variant="soft"
        >
          {{ author.articleCount }} {{ author.articleCount === 1 ? 'articolo' : 'articoli' }}
        </UBadge>

        <UBadge
          v-if="author.latestArticleDate"
          color="neutral"
          variant="soft"
        >
          {{ formatDateIT(author.latestArticleDate) }}
        </UBadge>

        <UBadge
          v-if="author.categories[0]"
          color="neutral"
          variant="soft"
        >
          {{ categoryLabels[author.categories[0].category] || author.categories[0].category }}
        </UBadge>
      </div>

      <AuthorSocialLinks
        :socials="author.socials"
        variant="icons"
        :max-items="4"
        :show-count="true"
        count-label="link social"
        class="mt-4 justify-between gap-3"
      />
    </UCard>
  </NuxtLink>
</template>
