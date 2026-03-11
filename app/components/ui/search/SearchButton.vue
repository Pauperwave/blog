<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <SearchContent
    :collapsed="collapsed ?? false"
    label="Search..."
    size="sm"
    color="neutral"
    variant="outline"
  />
</template>
