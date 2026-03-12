<!-- app/components/ui/search/Button.vue (the visible button) -->
<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()
</script>

<template>
  <UContentSearchButton
    :collapsed="collapsed ?? false"
    label="Cerca..."
    placeholder="Cerca nel blog..."
    color="neutral"
    class="w-xs"
  />
</template>
