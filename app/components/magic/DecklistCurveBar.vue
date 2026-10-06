<script setup lang="ts">
import { curveSegments, type DeckColor, type DeckStats } from '~/utils/deck-stats'

const { bucket, highlightColor = null } = defineProps<{
  /** Column of the curve; its segments stack from the bottom in color order */
  bucket: DeckStats['curve'][number]
  /** The other colors turn grayscale */
  highlightColor?: DeckColor | null
}>()

const segments = computed(() => curveSegments(bucket, highlightColor))
</script>

<template>
  <!-- The ring keeps the white and black segments visible; size and position come from the parent -->
  <div class="flex flex-col-reverse overflow-hidden rounded-t-sm ring-1 ring-default">
    <div
      v-for="segment in segments"
      :key="`${segment.color}-${segment.dimmed}`"
      class="motion-safe:transition-[filter] motion-safe:duration-400"
      :class="[segment.fill, { grayscale: segment.dimmed }]"
      :style="{ flexGrow: segment.count, flexBasis: 0 }"
    />
  </div>
</template>
