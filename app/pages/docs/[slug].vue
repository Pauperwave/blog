<script setup lang="ts">
const route = useRoute()

// Costruisci il path del documento basandoti sullo slug dell'URL
const documentPath = computed(() => `docs/${route.params.slug}.md`)

const { data } = await useAsyncData(`doc-${route.params.slug}`, () =>
  queryCollection('docs').where('id', '=', documentPath.value).first()
)

const tocTitle = 'In questo articolo'
const pageHeadline = 'Documenti'
</script>

<template>
  <UPage :ui="{ center: 'lg:col-span-7!' }">
    <template #right>
      <UPageAside :ui="{ root: 'lg:col-span-3!' }">
        <UPageAnchors
          :links="[
            { label: 'Canale YouTube', icon: 'i-lucide-youtube', to: 'https://www.youtube.com/@alessandromoretti1177', target: '_blank' },
            { label: 'Tutti gli articoli', icon: 'i-lucide-book-open-text', to: '/articles' },
          ]"
        />
        <USeparator
          type="dotted"
          class="mt-4"
        />
        <UContentToc
          v-if="data"
          :title="tocTitle"
          :links="data.body.toc?.links"
          highlight
        />
      </UPageAside>
    </template>

    <UPageHeader
      :title="data?.title"
      :description="data?.description"
      :headline="pageHeadline"
    />

    <UPageBody>
      <ContentRenderer
        v-if="data"
        id="content"
        :value="data"
        class="markdown-content flex-1"
      />
    </UPageBody>
  </UPage>
</template>

<style scoped>
ol ol {
  list-style-type: lower-alpha;
}
</style>
