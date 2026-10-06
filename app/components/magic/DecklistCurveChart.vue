<script setup lang="ts">
import { curveTooltip } from '~/utils/curve-display'
import type { DeckStats } from '~/utils/deck-stats'
import type { DeckColor } from '~/utils/mana-cost'
import DecklistCurveBar from './DecklistCurveBar.vue'

const { curve, average, highlightBucket = null, highlightColor = null } = defineProps<{
  curve: DeckStats['curve']
  /** Average mana value of the non-land cards */
  average: number
  /** The other columns turn grayscale */
  highlightBucket?: number | null
  /** While a color is hovered elsewhere, the other colors turn grayscale */
  highlightColor?: DeckColor | null
}>()

const emit = defineEmits<{
  hover: [bucket: number | null]
}>()

const maxCount = computed(() => Math.max(...curve.map(bucket => bucket.count), 1))

// The average label sits over the last columns: if one is nearly as tall as the highest,
// the bars make room for it
const LABEL_COLUMNS = 4
const TALL_SHARE = 0.75
const roomForLabel = computed(() =>
  curve.slice(-LABEL_COLUMNS).some(bucket => bucket.count >= maxCount.value * TALL_SHARE)
)

</script>

<template>
  <div class="relative flex items-end gap-1.5" aria-label="Curva di mana">
    <!-- Over the top right corner, where the curve is usually lowest, so it takes no width -->
    <p class="absolute top-3 right-3 m-0 text-xs leading-none">
      Costo medio <span class="font-semibold tabular-nums">{{ average.toFixed(2) }}</span>
    </p>
    <UTooltip
      v-for="(bucket, index) in curve"
      :key="bucket.label"
      :text="curveTooltip(bucket)"
    >
      <div
        class="flex h-full flex-1 cursor-pointer flex-col items-center justify-end gap-1"
        :class="{ 'pt-4': roomForLabel }"
        @mouseenter="emit('hover', index)"
        @mouseleave="emit('hover', null)"
      >
        <span class="text-xs font-semibold leading-none">{{ bucket.count || '' }}</span>
        <DecklistCurveBar
          v-if="bucket.count"
          :bucket="bucket"
          :highlight-color="highlightColor"
          class="w-full motion-safe:transition-[filter] motion-safe:duration-400"
          :class="{ grayscale: highlightBucket !== null && highlightBucket !== index }"
          :style="{ height: `${(bucket.count / maxCount) * 100}%` }"
        />
        <span class="text-xs leading-none">{{ bucket.label }}</span>
      </div>
    </UTooltip>
  </div>
</template>
