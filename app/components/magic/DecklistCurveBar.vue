<script setup lang="ts">
import { curveSegments, type CurveColor, type DeckColor } from '~/utils/deck-stats'

const { colors, highlightColor = null } = defineProps<{
  /** Cards of the column per color; the segments stack from the bottom in color order */
  colors: Partial<Record<CurveColor, number>>
  /** The other colors turn grayscale */
  highlightColor?: DeckColor | null
}>()

const segments = computed(() => curveSegments(colors))
</script>

<template>
  <!-- The ring keeps the white and black segments visible; size and position come from the parent -->
  <div class="flex flex-col-reverse overflow-hidden rounded-t-sm ring-1 ring-default">
    <div
      v-for="segment in segments"
      :key="segment.color"
      class="motion-safe:transition-[filter] motion-safe:duration-400"
      :class="[segment.fill, { grayscale: highlightColor && highlightColor !== segment.color }]"
      :style="{ flexGrow: segment.count, flexBasis: 0 }"
    />
  </div>
</template>
