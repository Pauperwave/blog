<script setup lang="ts">
import type { AuthorSocials } from '~/constants/author-socials'
// Explicit import needed: auto-imports used only in <template> aren't resolved by
// `nuxt typecheck` (vue-tsc -b project references) — https://github.com/nuxt/cli/issues/1224
import { formatDateIT } from '#imports'

interface AuthorCategoryStat {
  category: string
  count: number
}

interface FeaturedAuthor {
  name: string
  avatar: string
  description: string
  bio: string
  articleCount: number
  latestArticleDate?: string
  latestArticleTitle?: string
  latestArticlePath?: string
  categories: AuthorCategoryStat[]
  socials?: AuthorSocials
}

interface Props {
  author: FeaturedAuthor
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
      class="h-full border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-900 cursor-pointer"
      role="link"
      tabindex="0"
      @click="navigate"
      @keydown.enter.prevent="navigate"
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-start gap-4">
          <UAvatar
            :as="{ img: 'img' }"
            :src="author.avatar"
            :alt="author.name"
            size="xl"
            class="shrink-0 ring-2 ring-white dark:ring-gray-900"
          />

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="text-lg font-semibold truncate">
                  {{ author.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {{ author.description }}
                </p>
              </div>

              <UBadge
                color="primary"
                variant="soft"
              >
                {{ author.articleCount }} {{ author.articleCount === 1 ? 'articolo' : 'articoli' }}
              </UBadge>
            </div>

            <p
              v-if="author.bio"
              class="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3"
            >
              {{ author.bio }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="item in author.categories.slice(0, 3)"
            :key="`${author.name}-${item.category}`"
            color="neutral"
            variant="soft"
          >
            {{ categoryLabels[item.category] || item.category }}: {{ item.count }}
          </UBadge>
          <UBadge
            v-if="author.categories.length === 0"
            color="warning"
            variant="soft"
          >
            Nessun articolo pubblicato
          </UBadge>
        </div>

        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="text-sm text-gray-600 dark:text-gray-400 min-w-0">
            <span v-if="author.latestArticleTitle && author.latestArticleDate">
              Ultimo:
              <NuxtLink
                v-if="author.latestArticlePath"
                :to="author.latestArticlePath"
                class="font-medium text-primary hover:underline"
                @click.stop
              >
                {{ author.latestArticleTitle }}
              </NuxtLink>
              <span
                v-else
                class="font-medium text-gray-800 dark:text-gray-200"
              >
                {{ author.latestArticleTitle }}
              </span>
              <span class="whitespace-nowrap"> • {{ formatDateIT(author.latestArticleDate) }}</span>
            </span>
            <span v-else>Nessuna pubblicazione recente</span>
          </div>

          <AuthorSocialLinks
            :socials="author.socials"
            variant="icons"
            :show-count="true"
            count-label="social"
          />
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
