<script setup lang="ts">
import type { DeckColor, DeckStats } from '~/utils/deck-stats'

const { pips, highlightColor = null } = defineProps<{
  pips: DeckStats['pips']
  /** The other colors turn grayscale */
  highlightColor?: DeckColor | null
}>()

const emit = defineEmits<{
  hover: [color: DeckColor | null]
}>()

// Below this share the segment is too narrow to fit the mana symbol and the pip count
const MIN_PERCENT_FOR_LABEL = 16

const totalPips = computed(() => pips.reduce((total, pip) => total + pip.count, 0))

const segments = computed(() => pips.map((pip) => {
  const percent = Math.round((pip.count / totalPips.value) * 100)
  return {
    ...pip,
    ...MANA_COLOR_STYLES[pip.color],
    percent,
    showLabel: percent >= MIN_PERCENT_FOR_LABEL
  }
}))
</script>

<template>
  <!-- One bar at 100%, fixed width so it is the same in every decklist -->
  <div
    v-if="segments.length"
    class="flex h-6 w-72 shrink-0 overflow-hidden rounded-lg ring-1 ring-default"
    role="img"
    :aria-label="segments.map(segment => `${segment.name} ${segment.percent}%`).join(', ')"
  >
    <UTooltip
      v-for="segment in segments"
      :key="segment.color"
      :text="`${segment.name}: ${segment.count} simboli (${segment.percent}%)`"
    >
      <div
        class="flex min-w-0 cursor-pointer items-center justify-center gap-1 text-sm font-semibold tabular-nums [--mana-size:16px] motion-safe:transition-[filter] motion-safe:duration-400"
        :class="[segment.fill, { grayscale: highlightColor && highlightColor !== segment.color }]"
        :style="{ flexGrow: segment.count, flexBasis: 0 }"
        @mouseenter="emit('hover', segment.color)"
        @mouseleave="emit('hover', null)"
      >
        <template v-if="segment.showLabel">
          <MagicCardManaSymbol
            :symbol="`{${segment.color}}`"
            plain
          />
          {{ segment.count }}
        </template>
      </div>
    </UTooltip>
  </div>
</template>
