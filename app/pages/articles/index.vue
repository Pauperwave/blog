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

const normalizeFilterValue = (value: string) => value.trim().toLocaleLowerCase('it');

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
const selectedLocation = computed<string | null>(() =>
  route.query.location ? String(route.query.location) : null
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
const selectedLocationLabel = computed<string | null>(() => {
  if (!selectedLocation.value) return null;

  const matchedLocation = locationFilterOptions.value.find(
    item => normalizeFilterValue(item.location) === normalizeFilterValue(selectedLocation.value)
  );

  return matchedLocation?.location || selectedLocation.value;
});
const selectedTagLabel = computed<string | null>(() => {
  if (!selectedTag.value) return null;

  const matchedTag = tagFilterOptions.value.find(
    item => normalizeFilterValue(item.tag) === normalizeFilterValue(selectedTag.value)
  );

  return matchedTag?.tag || selectedTag.value;
});

const categoryFilterOptions = computed<Array<{ category: string; label: string; count: number }>>(() =>
  Object.entries(categoryLabels).map(([category, label]) => ({
    category,
    label,
    count: articles.value?.filter(article => article.category === category).length || 0
  }))
);
const locationFilterOptions = computed<Array<{ location: string; count: number }>>(() => {
  if (!articles.value) return [];

  const locationCounts = articles.value.reduce((acc, article) => {
    article.locations?.forEach((location) => {
      acc[location] = (acc[location] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (Object.entries(locationCounts) as Array<[string, number]>)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.location.localeCompare(b.location, 'it');
    });
});

const getArticleTopicTags = (article: AnyArticle) => {
  const locationSet = new Set((article.locations || []).map(location => normalizeFilterValue(location)));
  return (article.tags || []).filter(tag => !locationSet.has(normalizeFilterValue(tag)));
};
const authorFilterOptions = computed<Array<{ name: string; slug: string; count: number }>>(() => {
  if (!articles.value) return [];

  const authorCounts = articles.value.reduce((acc, article) => {
    acc[article.author] = (acc[article.author] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (Object.entries(authorCounts) as Array<[string, number]>)
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
const tagFilterOptions = computed<Array<{ tag: string; count: number }>>(() => {
  if (!articles.value) return [];

  const tagCounts = articles.value.reduce((acc, article) => {
    getArticleTopicTags(article).forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (Object.entries(tagCounts) as Array<[string, number]>)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag, 'it');
    });
});
const hasActiveFilters = computed(() =>
  !!selectedCategory.value || !!selectedAuthor.value || !!selectedLocation.value || !!selectedTag.value
);

const filteredArticles = computed(() => {
  if (!articles.value) return [];

  return articles.value.filter((article) => {
    const matchesCategory = !selectedCategory.value || article.category === selectedCategory.value;
    const authorName = authorsMap.value[article.author]?.name || article.author;
    const matchesAuthor = !selectedAuthor.value || getAuthorSlug(authorName) === selectedAuthor.value;
    const matchesLocation = !selectedLocation.value || (article.locations || []).some(
      location => normalizeFilterValue(location) === normalizeFilterValue(selectedLocation.value)
    );
    const matchesTag = !selectedTag.value || getArticleTopicTags(article).some(
      tag => normalizeFilterValue(tag) === normalizeFilterValue(selectedTag.value)
    );

    return matchesCategory && matchesAuthor && matchesLocation && matchesTag;
  });
});

const updateFilters = (next: {
  category?: string | null
  author?: string | null
  location?: string | null
  tag?: string | null
}) => {
  const category = next.category === undefined ? selectedCategory.value : next.category;
  const author = next.author === undefined ? selectedAuthor.value : next.author;
  const location = next.location === undefined ? selectedLocation.value : next.location;
  const tag = next.tag === undefined ? selectedTag.value : next.tag;

  const query: Record<string, string> = {};
  if (category) query.category = category;
  if (author) query.author = author;
  if (location) query.location = location;
  if (tag) query.tag = tag;
  navigateTo({ query }, { replace: true });
};

const setCategoryFilter = (category: string | null) => {
  updateFilters({ category });
};

const setAuthorFilter = (authorSlug: string | null) => {
  updateFilters({ author: authorSlug });
};

const setLocationFilter = (location: string | null) => {
  updateFilters({ location });
};

const setTagFilter = (tag: string | null) => {
  updateFilters({ tag });
};

const clearAllFilters = () => {
  updateFilters({ category: null, author: null, location: null, tag: null });
};
</script>

<template>
  <UPage>
    <UPageBody>
      <ArticlesFiltersPanel
        :results-count="filteredArticles.length"
        :total-count="articles?.length || 0"
        :has-active-filters="hasActiveFilters"
        :selected-category="selectedCategory"
        :selected-category-label="selectedCategoryLabel"
        :selected-author="selectedAuthor"
        :selected-author-label="selectedAuthorLabel"
        :selected-location="selectedLocation"
        :selected-location-label="selectedLocationLabel"
        :selected-tag="selectedTag"
        :selected-tag-label="selectedTagLabel"
        :category-filter-options="categoryFilterOptions"
        :author-filter-options="authorFilterOptions"
        :location-filter-options="locationFilterOptions"
        :tag-filter-options="tagFilterOptions"
        @set-category="setCategoryFilter"
        @set-author="setAuthorFilter"
        @set-location="setLocationFilter"
        @set-tag="setTagFilter"
        @clear-all="clearAllFilters"
      />

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
                v-for="location in article.locations || []"
                :key="`${article.path}-location-${location}`"
                color="warning"
                variant="soft"
              >
                {{ location }}
              </UBadge>
              <UBadge
                v-for="tag in getArticleTopicTags(article)"
                :key="`${article.path}-tag-${tag}`"
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
