<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData(`doc-${route.params.slug}`, () =>
  queryCollection('docs').path(route.path).first()
)

const tocTitle = 'In questo articolo'
const pageHeadline = 'Documenti'

// OG Image for docs page
defineOgImage('Page.takumi', {
  title: data.value?.title || 'Documento',
  description: data.value?.description,
})
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
