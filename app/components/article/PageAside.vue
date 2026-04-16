<!-- app\components\Article\PageAside.vue -->
<script setup lang="ts">
const tocTitle = 'In questo articolo'

defineProps<{
  data: { body: { toc?: { links?: any[] } } } | null | undefined
}>()
</script>

<template>
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
