<script setup lang="ts">
import { CURVE_COLORS, type DeckColor, type DeckStats } from '~/utils/deck-stats'

const { curve, average, highlightColor = null } = defineProps<{
  curve: DeckStats['curve']
  /** Average mana value of the non-land cards */
  average: number
  /** While a color is hovered elsewhere, the other colors turn grayscale */
  highlightColor?: DeckColor | null
}>()

const emit = defineEmits<{
  hover: [bucket: number | null]
}>()

const maxCount = computed(() => Math.max(...curve.map(bucket => bucket.count), 1))

// The average label sits over the last columns: if one of them is nearly as tall as the highest, the bars make room for it
const LABEL_COLUMNS = 4
const TALL_SHARE = 0.75
const roomForLabel = computed(() => curve.slice(-LABEL_COLUMNS).some(bucket => bucket.count >= maxCount.value * TALL_SHARE))

const buckets = computed(() => curve.map((bucket) => {
  const segments = CURVE_COLORS
    .map(color => ({ color, count: bucket.colors[color] ?? 0, ...CURVE_COLOR_STYLES[color] }))
    .filter(segment => segment.count > 0)
  const breakdown = segments.map(segment => `${segment.name} ${segment.count}`).join(', ')
  return {
    ...bucket,
    segments,
    tooltip: `Costo ${bucket.label}: ${bucket.count}${breakdown ? ` (${breakdown})` : ''}`
  }
}))
</script>

<template>
  <div class="relative flex items-end gap-1.5" aria-label="Curva di mana">
    <!-- Over the top right corner, where the curve is usually lowest, so it takes no width -->
    <p class="absolute top-3 right-3 m-0 text-xs leading-none">
      Costo medio <span class="font-semibold tabular-nums">{{ average.toFixed(2) }}</span>
    </p>
    <UTooltip
      v-for="(bucket, index) in buckets"
      :key="bucket.label"
      :text="bucket.tooltip"
    >
      <div
        class="flex h-full flex-1 cursor-pointer flex-col items-center justify-end gap-1"
        :class="{ 'pt-4': roomForLabel }"
        @mouseenter="emit('hover', index)"
        @mouseleave="emit('hover', null)"
      >
        <span class="text-xs font-semibold leading-none">{{ bucket.count || '' }}</span>
        <!-- Segments stack from the bottom in color order; the ring keeps the white and black ones visible -->
        <div
          v-if="bucket.count"
          class="flex w-full flex-col-reverse overflow-hidden rounded-t-sm ring-1 ring-default"
          :style="{ height: `${(bucket.count / maxCount) * 100}%` }"
        >
          <div
            v-for="segment in bucket.segments"
            :key="segment.color"
            :class="[segment.fill, { grayscale: highlightColor && highlightColor !== segment.color }]"
            class="motion-safe:transition-[filter] motion-safe:duration-400"
            :style="{ flexGrow: segment.count, flexBasis: 0 }"
          />
        </div>
        <span class="text-xs leading-none">{{ bucket.label }}</span>
      </div>
    </UTooltip>
  </div>
</template>
