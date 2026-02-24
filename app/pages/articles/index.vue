<script setup lang="ts">
import type { Author } from '~/composables/useAuthor';
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
const authorsMap = ref<Record<string, Author>>({});

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
const selectedAuthor = computed<string | null>(() =>
  route.query.author ? String(route.query.author) : null
);
const selectedAuthorLabel = computed<string | null>(() => {
  if (!selectedAuthor.value) return null;

  const matchedAuthor = Object.values(authorsMap.value).find(
    author => getAuthorSlug(author.name) === selectedAuthor.value
  );

  return matchedAuthor?.name || getAuthorNameFromSlug(selectedAuthor.value);
});

const categoryLabels = CATEGORY_LABELS;
const authorFilterOptions = computed(() => {
  if (!articles.value) return [];

  return [...new Set(articles.value.map(article => article.author))]
    .map((authorKey) => {
      const authorName = authorsMap.value[authorKey]?.name || authorKey;

      return {
        name: authorName,
        slug: getAuthorSlug(authorName)
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

const filteredArticles = computed(() => {
  if (!articles.value) return [];

  return articles.value.filter((article) => {
    const matchesCategory = !selectedCategory.value || article.category === selectedCategory.value;
    const authorName = authorsMap.value[article.author]?.name || article.author;
    const matchesAuthor = !selectedAuthor.value || getAuthorSlug(authorName) === selectedAuthor.value;

    return matchesCategory && matchesAuthor;
  });
});

// Update URL when category changes
watch(selectedCategory, (newCategory) => {
  const query: Record<string, string> = {};
  if (newCategory) query.category = newCategory;
  if (selectedAuthor.value) query.author = selectedAuthor.value;
  navigateTo({ query }, { replace: true });
});

const setAuthorFilter = (authorSlug: string | null) => {
  const query: Record<string, string> = {};
  if (selectedCategory.value) query.category = selectedCategory.value;
  if (authorSlug) query.author = authorSlug;
  navigateTo({ query }, { replace: true });
};

const clearAuthorFilter = () => {
  setAuthorFilter(null);
};
</script>

<template>
  <UPage>
    <UPageBody>
      <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-4 md:p-6 mb-6">
        <!-- Category Filter -->
        <div class="flex items-center gap-4 mb-4 flex-wrap">
          <UButton
            v-for="(label, category) in { null: 'All', ...categoryLabels }"
            :key="category"
            :variant="selectedCategory === category ? 'solid' : 'outline'"
            @click="selectedCategory = category === 'null' ? null : category"
          >
            {{ label }}
          </UButton>
        </div>

        <!-- Author Filter -->
        <div class="flex items-center gap-3 flex-wrap">
          <span class="text-sm text-gray-700 dark:text-gray-200">Author</span>
          <UButton
            size="xs"
            :variant="selectedAuthor === null ? 'solid' : 'outline'"
            @click="setAuthorFilter(null)"
          >
            All authors
          </UButton>
          <UButton
            v-for="author in authorFilterOptions"
            :key="author.slug"
            size="xs"
            :variant="selectedAuthor === author.slug ? 'solid' : 'outline'"
            @click="setAuthorFilter(author.slug)"
          >
            {{ author.name }}
          </UButton>
        </div>

        <div
          v-if="selectedAuthor"
          class="mt-4 flex items-center gap-3 flex-wrap rounded-lg border border-primary-200/60 dark:border-primary-800/60 bg-primary-50/60 dark:bg-primary-950/20 px-4 py-3"
        >
          <span class="text-sm text-gray-700 dark:text-gray-200">Filtering by author</span>
          <UBadge
            color="primary"
            variant="soft"
          >
            {{ selectedAuthorLabel }}
          </UBadge>
          <UButton
            size="xs"
            variant="ghost"
            @click="clearAuthorFilter"
          >
            Clear author filter
          </UButton>
        </div>
      </section>

      <UEmpty
        v-if="(filteredArticles?.length ?? 0) <= 0"
        title="No articles found"
        :description="selectedAuthorLabel ? `No articles match the selected filters for ${selectedAuthorLabel}.` : 'No articles match the selected category.'"
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
