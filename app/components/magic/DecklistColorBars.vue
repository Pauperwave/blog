<script setup lang="ts">
import type { DeckColor, DeckStats } from '~/utils/deck-stats'

const { pips } = defineProps<{
  pips: DeckStats['pips']
}>()

const emit = defineEmits<{
  hover: [color: DeckColor | null]
}>()

// Below this share the segment is too narrow to fit the mana symbol
const MIN_PERCENT_FOR_SYMBOL = 12

const totalPips = computed(() => pips.reduce((total, pip) => total + pip.count, 0))

const segments = computed(() => pips.map((pip) => {
  const percent = Math.round((pip.count / totalPips.value) * 100)
  return {
    ...pip,
    ...MANA_COLOR_STYLES[pip.color],
    percent,
    showSymbol: percent >= MIN_PERCENT_FOR_SYMBOL
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
    <div
      v-for="segment in segments"
      :key="segment.color"
      class="flex min-w-0 items-center justify-center [--mana-size:16px]"
      :class="segment.fill"
      :style="{ flexGrow: segment.count, flexBasis: 0 }"
      :title="`${segment.name}: ${segment.percent}%`"
      @mouseenter="emit('hover', segment.color)"
      @mouseleave="emit('hover', null)"
    >
      <MagicCardManaSymbol
        v-if="segment.showSymbol"
        :symbol="`{${segment.color}}`"
        plain
      />
    </div>
  </div>
</template>
