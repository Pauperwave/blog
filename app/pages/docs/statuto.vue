<script setup lang="ts">
const { data: page } = await useAsyncData('statute', () => 
  queryCollection('docs').where('id', '=', 'docs/statuto.md').first()
)
</script>

<template>
  <template v-if="page">
    <ContentToc :value="page" />
  </template>
  <div v-if="page">
    <ContentRenderer :value="page" />
  </div>
  <div v-else>
    <p>Page not found. Check console for available paths.</p>
  </div>
</template>

<style>
ol ol {
  list-style-type: lower-alpha;
}
</style>