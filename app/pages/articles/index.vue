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

const selectedCategory = computed<string | null>(() =>
  route.query.category ? String(route.query.category) : null
);
const selectedAuthor = computed<string | null>(() =>
  route.query.author ? String(route.query.author) : null
);
const selectedTag = computed<string | null>(() =>
  route.query.tag ? String(route.query.tag) : null
);
const categoryLabels = CATEGORY_LABELS;
const selectedCategoryLabel = computed<string | null>(() => {
  if (!selectedCategory.value) return null;
  return categoryLabels[selectedCategory.value as keyof typeof categoryLabels] || selectedCategory.value;
});
const selectedAuthorLabel = computed<string | null>(() => {
  if (!selectedAuthor.value) return null;

  const matchedAuthor = Object.values(authorsMap.value).find(
    author => getAuthorSlug(author.name) === selectedAuthor.value
  );

  return matchedAuthor?.name || getAuthorNameFromSlug(selectedAuthor.value);
});

const categoryFilterOptions = computed(() =>
  Object.entries(categoryLabels).map(([category, label]) => ({
    category,
    label,
    count: articles.value?.filter(article => article.category === category).length || 0
  }))
);
const authorFilterOptions = computed(() => {
  if (!articles.value) return [];

  const authorCounts = articles.value.reduce((acc, article) => {
    acc[article.author] = (acc[article.author] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(authorCounts)
    .map(([authorKey, count]) => {
      const authorName = authorsMap.value[authorKey]?.name || authorKey;

      return {
        name: authorName,
        slug: getAuthorSlug(authorName),
        count
      };
    })
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name, 'it');
    });
});
const tagFilterOptions = computed(() => {
  if (!articles.value) return [];

  const tagCounts = articles.value.reduce((acc, article) => {
    article.tags?.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag, 'it');
    });
});
const hasActiveFilters = computed(() =>
  !!selectedCategory.value || !!selectedAuthor.value || !!selectedTag.value
);

const filteredArticles = computed(() => {
  if (!articles.value) return [];

  return articles.value.filter((article) => {
    const matchesCategory = !selectedCategory.value || article.category === selectedCategory.value;
    const authorName = authorsMap.value[article.author]?.name || article.author;
    const matchesAuthor = !selectedAuthor.value || getAuthorSlug(authorName) === selectedAuthor.value;
    const matchesTag = !selectedTag.value || article.tags?.some(tag => tag === selectedTag.value);

    return matchesCategory && matchesAuthor && matchesTag;
  });
});

const updateFilters = (next: {
  category?: string | null
  author?: string | null
  tag?: string | null
}) => {
  const category = next.category === undefined ? selectedCategory.value : next.category;
  const author = next.author === undefined ? selectedAuthor.value : next.author;
  const tag = next.tag === undefined ? selectedTag.value : next.tag;

  const query: Record<string, string> = {};
  if (category) query.category = category;
  if (author) query.author = author;
  if (tag) query.tag = tag;
  navigateTo({ query }, { replace: true });
};

const setCategoryFilter = (category: string | null) => {
  updateFilters({ category });
};

const setAuthorFilter = (authorSlug: string | null) => {
  updateFilters({ author: authorSlug });
};

const setTagFilter = (tag: string | null) => {
  updateFilters({ tag });
};

const clearAllFilters = () => {
  updateFilters({ category: null, author: null, tag: null });
};
</script>

<template>
  <UPage>
    <UPageBody>
      <section class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-4 md:p-6 mb-6">
        <div class="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
              Filtri
            </p>
            <h2 class="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              Trova gli articoli piu rilevanti
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ filteredArticles.length }} risultati su {{ articles?.length || 0 }}
            </p>
          </div>

          <UButton
            v-if="hasActiveFilters"
            size="sm"
            color="error"
            variant="subtle"
            @click="clearAllFilters"
          >
            Reset filtri
          </UButton>
        </div>

        <div
          v-if="hasActiveFilters"
          class="mb-4 flex items-center gap-2 flex-wrap rounded-lg border border-warning-200/60 dark:border-warning-800/40 bg-warning-50/50 dark:bg-warning-950/10 px-3 py-2"
        >
          <span class="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-300">
            Filtri attivi
          </span>
          <UBadge
            v-if="selectedCategoryLabel"
            color="neutral"
            variant="soft"
          >
            Categoria: {{ selectedCategoryLabel }}
          </UBadge>
          <UBadge
            v-if="selectedAuthorLabel"
            color="warning"
            variant="soft"
          >
            Autore: {{ selectedAuthorLabel }}
          </UBadge>
          <UBadge
            v-if="selectedTag"
            color="primary"
            variant="soft"
          >
            Tag: {{ selectedTag }}
          </UBadge>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
              Categoria
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                size="xs"
                :variant="selectedCategory === null ? 'solid' : 'outline'"
                @click="setCategoryFilter(null)"
              >
                Tutte
              </UButton>
              <UButton
                v-for="item in categoryFilterOptions"
                :key="item.category"
                size="xs"
                :variant="selectedCategory === item.category ? 'solid' : 'outline'"
                @click="setCategoryFilter(item.category)"
              >
                {{ item.label }} ({{ item.count }})
              </UButton>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                Autore
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ authorFilterOptions.length }} autori
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                size="xs"
                :variant="selectedAuthor === null ? 'solid' : 'outline'"
                @click="setAuthorFilter(null)"
              >
                Tutti gli autori
              </UButton>
              <UButton
                v-for="author in authorFilterOptions"
                :key="author.slug"
                size="xs"
                :variant="selectedAuthor === author.slug ? 'solid' : 'outline'"
                @click="setAuthorFilter(author.slug)"
              >
                {{ author.name }} ({{ author.count }})
              </UButton>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                Tag
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ tagFilterOptions.length }} tag
              </p>
            </div>
            <div class="max-h-36 overflow-y-auto pr-1">
              <div class="flex flex-wrap gap-2">
                <UButton
                  size="xs"
                  :variant="selectedTag === null ? 'solid' : 'outline'"
                  @click="setTagFilter(null)"
                >
                  Tutti i tag
                </UButton>
                <UButton
                  v-for="tag in tagFilterOptions"
                  :key="tag.tag"
                  size="xs"
                  :variant="selectedTag === tag.tag ? 'solid' : 'outline'"
                  @click="setTagFilter(tag.tag)"
                >
                  {{ tag.tag }} ({{ tag.count }})
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <UEmpty
        v-if="(filteredArticles?.length ?? 0) <= 0"
        title="Nessun articolo trovato"
        :description="hasActiveFilters ? 'Nessun articolo corrisponde ai filtri selezionati.' : 'Non ci sono articoli disponibili.'"
        variant="naked"
        :actions="[{ label: 'Torna alla home', to: '/' }]"
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
