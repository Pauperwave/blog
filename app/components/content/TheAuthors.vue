<template>
  <div>
    
  </div>
</template>

<script lang="ts" setup>
// Get all authors
const { data: authors } = await useAsyncData('authors', () => {
  return queryCollection('authors')
    .order('name', 'DESC')
    .all()
})
</script>

<style>

</style>