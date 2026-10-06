<script setup lang="ts">
import type { DeckStats } from '~/utils/deck-stats'

const { curve } = defineProps<{
  curve: DeckStats['curve']
}>()

const emit = defineEmits<{
  hover: [bucket: number | null]
}>()

const maxCount = computed(() => Math.max(...curve.map(bucket => bucket.count), 1))
</script>

<template>
  <div class="flex items-end gap-2" aria-label="Curva di mana">
    <div
      v-for="(bucket, index) in curve"
      :key="bucket.label"
      class="flex h-full w-7 flex-col items-center justify-end gap-1"
      :title="`Costo ${bucket.label}: ${bucket.count}`"
      @mouseenter="emit('hover', index)"
      @mouseleave="emit('hover', null)"
    >
      <span class="text-xs font-semibold leading-none">{{ bucket.count || '' }}</span>
      <div
        class="w-full rounded-t-sm bg-primary"
        :style="{ height: `${(bucket.count / maxCount) * 100}%` }"
      />
      <span class="text-xs leading-none">{{ bucket.label }}</span>
    </div>
  </div>
</template>
