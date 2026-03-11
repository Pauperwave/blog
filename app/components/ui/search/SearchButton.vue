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
    size="md"
    color="neutral"
    variant="outline"
    class="w-full lg:w-64"
  />
</template>
