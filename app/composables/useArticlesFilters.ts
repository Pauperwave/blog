import type { Ref } from 'vue';
import type { Author } from '~/composables/useAuthor';
import { getAuthorNameFromSlug, getAuthorSlug } from '~/composables/useAuthorSlug';
import { type AnyArticle, CATEGORY_LABELS } from '~/constants/content-config';

interface UseArticlesFiltersOptions {
  articles: Ref<AnyArticle[] | null | undefined>
  authorsMap: Ref<Record<string, Author>>
}

export const useArticlesFilters = ({ articles, authorsMap }: UseArticlesFiltersOptions) => {
  const route = useRoute();

  const normalizeFilterValue = (value: string) => value.trim().toLocaleLowerCase('it');

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

  const setAuthorFilter = (author: string | null) => {
    updateFilters({ author });
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

  return {
    selectedCategory,
    selectedAuthor,
    selectedLocation,
    selectedTag,
    selectedCategoryLabel,
    selectedAuthorLabel,
    selectedLocationLabel,
    selectedTagLabel,
    categoryFilterOptions,
    authorFilterOptions,
    locationFilterOptions,
    tagFilterOptions,
    hasActiveFilters,
    filteredArticles,
    getArticleTopicTags,
    setCategoryFilter,
    setAuthorFilter,
    setLocationFilter,
    setTagFilter,
    clearAllFilters
  };
};
