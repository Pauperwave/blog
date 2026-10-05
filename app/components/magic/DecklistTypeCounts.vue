<script setup lang="ts">
defineProps<{
  counts: { section: string; count: number }[]
}>()
</script>

<template>
  <div class="flex items-center gap-3 text-sm font-semibold">
    <span
      v-for="type in counts"
      :key="type.section"
      class="inline-flex items-center gap-1"
      :title="type.section"
    >
      <span class="inline-flex size-7 items-center justify-center rounded-full bg-white text-gray-900 ring-1 ring-black/20">
        <MagicCardTypesIcon :type="type.section" size="md" />
      </span>
      {{ type.count }}
    </span>
  </div>
</template>
