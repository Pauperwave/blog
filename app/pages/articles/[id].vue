<!-- app\pages\articles\[id].vue -->
<script setup lang="ts">
const route = useRoute()

const { data, authorsData, surround } = await useArticleData(route.path)
const { links, relatedAuthorsMap, getTagFilterLink } = useRelatedArticles(data)

const formattedDate = useState(`article-date-${route.path}`, () => {
  return data.value?.date ? formatDateIT(data.value.date) : 'Data non disponibile'
})

useArticleMeta(data, authorsData)
</script>

<template>
  <UPage :ui="{ center: 'lg:col-span-7!' }">

    <template #right>
      <Article-PageAside :data="data" />
    </template>

    <Article-PageHeader
      :data="data"
      :authors="authorsData ?? []"
      :formatted-date="formattedDate"
      :get-tag-filter-link="getTagFilterLink"
    />

    <UPageBody>
      <ContentRenderer
        v-if="data"
        id="content"
        :value="data"
        class="markdown-content flex-1"
      />
      <Article-AuthorsSection
        :authors="authorsData ?? []"
      />
      <Article-RelatedArticles
        :links="links"
        :related-authors-map="relatedAuthorsMap"
        :surround="surround"
      />
    </UPageBody>
  </UPage>
</template>

<style lang="css">
@reference "~/assets/css/main.css";

/* Create custom max-lg variant for screens smaller than 1024px */
@custom-variant max-lg (@media (max-width: 1023px));

/* Apply the variant to all elements in this component */
* {
  scroll-margin-top: calc(var(--ui-header-height) + 1rem);

  @variant max-lg {
    scroll-margin-top: calc(var(--ui-header-height) + 4rem) !important;
  }
}
</style>
