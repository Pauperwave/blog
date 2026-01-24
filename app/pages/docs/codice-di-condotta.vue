<script setup lang="ts">
const { data: page } = await useAsyncData('code-of-conduct', () => 
  queryCollection('docs').where('id', '=', 'docs/codice-di-condotta.md').first()
)
</script>

<template>
  <div v-if="page">
    <ContentRenderer :value="page" />
  </div>
  <div v-else>
    <p>Page not found. Check console for available paths.</p>
  </div>
</template>
