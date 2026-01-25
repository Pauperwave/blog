<script setup lang="ts">
import {
  type AnyArticle,
  queryAllCollections,
  combineArticles,
  CATEGORY_LABELS
} from '~/constants/content-config';

const route = useRoute();

const getBadge = (date: string) => {
  return Math.abs(new Date().getTime() - new Date(date).getTime()) < 8.64e7 * 7
    ? { label: "Nuovo", color: "primary" as const }
    : undefined;
};

// Query all collections and combine them
const { data: articles } = await useAsyncData("articles-index", async () => {
  const collectionsData = await queryAllCollections();

  // Combine all articles, filter out drafts, and sort by date
  const allArticles: AnyArticle[] = combineArticles(collectionsData)
    .filter(article => article.published !== false);

  return allArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// Fetch author data for all unique authors
const authorsMap = ref<Record<string, any>>({});

if (articles.value) {
  const uniqueAuthors = [...new Set(articles.value.map(article => article.author))];
  for (const authorName of uniqueAuthors) {
    try {
      const authorInfo = await useAuthor(authorName);
      authorsMap.value[authorName] = authorInfo;
    } catch (e) {
      console.error(`Failed to load author data for ${authorName}:`, e);
    }
  }
}

const selectedCategory = ref<string | null>(
  route.query.category ? String(route.query.category) : null
);

const categoryLabels = CATEGORY_LABELS;

const filteredArticles = computed(() => {
  if (!articles.value) return [];
  if (!selectedCategory.value) return articles.value;

  return articles.value.filter(article => article.category === selectedCategory.value);
});

// Update URL when category changes
watch(selectedCategory, (newCategory) => {
  const query = newCategory ? { category: newCategory } : {};
  navigateTo({ query }, { replace: true });
});
</script>

<template>
  <UPage>
    <UPageBody>
      <!-- Category Filter -->
      <div class="flex items-center gap-4 mb-6 flex-wrap">
        <UButton
          v-for="(label, category) in { null: 'All', ...categoryLabels }"
          :key="category"
          :variant="selectedCategory === category ? 'solid' : 'outline'"
          @click="selectedCategory = category === 'null' ? null : category"
        >
          {{ label }}
        </UButton>
      </div>

      <UEmpty
        v-if="(filteredArticles?.length ?? 0) <= 0"
        title="No articles found"
        description="No articles match the selected category."
        variant="naked"
        :actions="[{ label: 'Go back home', to: '/' }]"
      />
      <UBlogPosts
        v-else
        class="gap-4 lg:gap-6 sm:grid-cols-3 lg:grid-cols-4"
      >
        <UBlogPost
          v-for="article in filteredArticles"
          :key="article.path"
          :title="article.title"
          :image="article.thumbnail"
          :badge="getBadge(article.date)"
          :date="article.date"
          :to="article.path"
          variant="naked"
          class="group border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-400/10 hover:-translate-y-1 hover:scale-[1.02] bg-white dark:bg-gray-900/50 backdrop-blur-sm"
        >
          <template #date>
            {{useState(`article-date-${article.path}`, () => formatDateIT(article.date)).value}}
          </template>
          <template #description>
            <p class="mt-1 text-base text-pretty">
              {{ article.description }}
            </p>
            <div class="flex flex-row gap-2 items-center flex-wrap mt-3">
              <UBadge
                v-for="tag in article.tags"
                :key="tag"
                color="primary"
                variant="soft"
              >
                {{ tag }}
              </UBadge>
            </div>
          </template>
          <template #authors>
            <AuthorCard
              :author="{
                name: authorsMap[article.author]?.name || article.author,
                description: authorsMap[article.author]?.description,
                avatar: authorsMap[article.author]?.avatar,
                bio: authorsMap[article.author]?.bio,
                socials: authorsMap[article.author]?.socials
              }"
              :clickable="false"
            />
          </template>
        </UBlogPost>
      </UBlogPosts>
    </UPageBody>
  </UPage>
</template>
