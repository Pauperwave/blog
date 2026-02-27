<script setup lang="ts">
interface AuthorCategoryStat {
  category: string
  count: number
}

interface VisibleSocialLink {
  key: string
  icon: string
  label: string
  url: string
}

interface FeaturedAuthor {
  name: string
  avatar: string
  description: string
  bio?: string
  articleCount: number
  latestArticleDate?: string
  latestArticleTitle?: string
  latestArticlePath?: string
  categories: AuthorCategoryStat[]
  socialCount: number
}

interface Props {
  author: FeaturedAuthor
  to: string
  categoryLabels: Record<string, string>
  visibleSocials: VisibleSocialLink[]
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
      class="h-full border-gray-200 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white dark:bg-gray-900 cursor-pointer"
      role="link"
      tabindex="0"
      @click="navigate"
      @keydown.enter.prevent="navigate"
    >
      <div class="flex flex-col gap-4">
        <div class="flex items-start gap-4">
          <UAvatar
            :src="props.author.avatar"
            :alt="props.author.name"
            size="xl"
            class="shrink-0 ring-2 ring-white dark:ring-gray-900"
          />

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="text-lg font-semibold truncate">
                  {{ props.author.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {{ props.author.description }}
                </p>
              </div>

              <UBadge
                color="primary"
                variant="soft"
              >
                {{ props.author.articleCount }} {{ props.author.articleCount === 1 ? 'articolo' : 'articoli' }}
              </UBadge>
            </div>

            <p
              v-if="props.author.bio"
              class="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3"
            >
              {{ props.author.bio }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="item in props.author.categories.slice(0, 3)"
            :key="`${props.author.name}-${item.category}`"
            color="neutral"
            variant="soft"
          >
            {{ props.categoryLabels[item.category] || item.category }}: {{ item.count }}
          </UBadge>
          <UBadge
            v-if="props.author.categories.length === 0"
            color="warning"
            variant="soft"
          >
            Nessun articolo pubblicato
          </UBadge>
        </div>

        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="text-sm text-gray-600 dark:text-gray-400 min-w-0">
            <span v-if="props.author.latestArticleTitle && props.author.latestArticleDate">
              Ultimo:
              <NuxtLink
                v-if="props.author.latestArticlePath"
                :to="props.author.latestArticlePath"
                class="font-medium text-primary hover:underline"
                @click.stop
              >
                {{ props.author.latestArticleTitle }}
              </NuxtLink>
              <span
                v-else
                class="font-medium text-gray-800 dark:text-gray-200"
              >
                {{ props.author.latestArticleTitle }}
              </span>
              <span class="whitespace-nowrap"> • {{ formatDateIT(props.author.latestArticleDate) }}</span>
            </span>
            <span v-else>Nessuna pubblicazione recente</span>
          </div>

          <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <a
              v-for="social in props.visibleSocials"
              :key="`${props.author.name}-${social.key}`"
              :href="social.url"
              :aria-label="social.label"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center hover:text-primary transition-colors"
              @click.stop
              @keydown.enter.stop
            >
              <UIcon
                :name="social.icon"
                class="w-4 h-4"
              />
            </a>
            <span class="text-xs">
              {{ props.author.socialCount }} social
            </span>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>
