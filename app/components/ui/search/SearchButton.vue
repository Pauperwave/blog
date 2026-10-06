<!-- app/components/ui/search/Button.vue (the visible button) -->
<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

// Start loading the search index as the button is approached, so it is usually ready at the click
const { load } = useSearchIndex()
</script>

<template>
  <UContentSearchButton
    :collapsed="collapsed ?? false"
    label="Cerca..."
    class="lg:w-sm cursor-pointer"
    @pointerenter="load"
    @focusin="load"
  />
</template>
