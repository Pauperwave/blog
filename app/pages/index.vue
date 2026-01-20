<script lang="ts" setup>
import { 
  type AnyArticle, 
  type CategoryType, 
  queryAllCollections, 
  combineArticles, 
  getHomeSections,
  initializeCategories
} from '~/constants/content-config';

// Query all collections and combine them
const { data: allArticles } = await useAsyncData('home-articles', async () => {
  const collectionsData = await queryAllCollections();
  
  // Combine all articles, filter out drafts, and sort by date
  const combined: AnyArticle[] = combineArticles(collectionsData)
    .filter(article => article.published !== false);
  
  return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const articlesByCategory = computed(() => {
  const categories = initializeCategories();

  allArticles.value?.forEach((article) => {
    if (article.category && categories[article.category as CategoryType]) {
      categories[article.category as CategoryType].push(article);
    }
  });

  return categories;
});

// Get sections from centralized config
const sections = getHomeSections();
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