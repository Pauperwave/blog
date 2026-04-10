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
    class="lg:w-sm cursor-pointer"
  />
</template>
