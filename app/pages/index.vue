<script lang="ts" setup>
import type { ArticlesCollectionItem, TutorialsCollectionItem, DecklistsCollectionItem, ReportsCollectionItem, SpoilersCollectionItem } from '#content';

// Union type for all article types
type AnyArticle =
  | ArticlesCollectionItem
  | TutorialsCollectionItem
  | DecklistsCollectionItem
  | ReportsCollectionItem
  | SpoilersCollectionItem;

// Define valid category types
type CategoryType = 'article' | 'tutorial' | 'decklist' | 'report' | 'spoiler';

// Query all collections and combine them
const { data: allArticles } = await useAsyncData('home-articles', async () => {
  const [articlesData, tutorialsData, decklistsData, reportsData, spoilersData] = await Promise.all([
    queryCollection('articles').all(),
    queryCollection('tutorials').all(),
    queryCollection('decklists').all(),
    queryCollection('reports').all(),
    queryCollection('spoilers').all(),
  ]);

  // Combine all articles, filter out drafts, and sort by date
  // Using concat() for better performance with large datasets (1000+ articles)
  const combined: AnyArticle[] = (articlesData as ArticlesCollectionItem[])
    .concat(tutorialsData as TutorialsCollectionItem[],
      decklistsData as DecklistsCollectionItem[],
      reportsData as ReportsCollectionItem[],
      spoilersData as SpoilersCollectionItem[])
    .filter(article => article.published !== false);
  return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const articlesByCategory = computed(() => {
  const categories: Record<CategoryType, AnyArticle[]> = {
    article: [],
    tutorial: [],
    decklist: [],
    report: [],
    spoiler: []
  };

  allArticles.value?.forEach((article) => {
    if (article.category && categories[article.category as CategoryType]) {
      categories[article.category as CategoryType].push(article);
    }
  });

  return categories;
});

// Define the order and configuration of sections
const sections: Array<{ title: string; category: CategoryType }> = [
  { title: 'Ultimi articoli', category: 'article' },
  { title: 'Top Decklists', category: 'decklist' },
  { title: 'Resoconti dei tornei', category: 'report' },
  { title: 'Spoilers & Set Reviews', category: 'spoiler' },
  { title: 'Tutorial', category: 'tutorial' },
];
</script>

<template>
  <UPage>
    <UPageBody :ui="{
      body: 'space-y-0 my-0'
    }">
      <!-- <div id="home-articles" class="border border-8 border-amber-100 flex flex-col gap-2 items-stretch w-full"> -->
      <ArticleCategorySection
        v-for="section in sections"
        :key="section.category"
        :title="section.title"
        :category="section.category"
        :articles="articlesByCategory[section.category]"
      />
      <!-- </div> -->
    </UPageBody>
  </UPage>
</template>