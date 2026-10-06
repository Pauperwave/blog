<script setup lang="ts">
defineProps<{
  counts: { section: string; count: number }[]
}>()

const emit = defineEmits<{
  hover: [section: string | null]
}>()
</script>

<template>
  <div class="flex items-center gap-4 text-base font-semibold tabular-nums">
    <span
      v-for="type in counts"
      :key="type.section"
      class="inline-flex items-center gap-1.5"
      :title="type.section"
      @mouseenter="emit('hover', type.section)"
      @mouseleave="emit('hover', null)"
    >
      <span class="inline-flex size-7 items-center justify-center rounded-full bg-white text-gray-900 ring-1 ring-black/20">
        <MagicCardTypesIcon :type="type.section" size="md" />
      </span>
      {{ type.count }}
    </span>
  </div>
</template>
