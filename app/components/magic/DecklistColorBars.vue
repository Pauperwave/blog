<script setup lang="ts">
import type { DeckStats } from '~/utils/deck-stats'

const { pips } = defineProps<{
  pips: DeckStats['pips']
}>()

// Below this share the segment is too narrow to fit the mana symbol
const MIN_PERCENT_FOR_SYMBOL = 12

const COLOR_STYLES = {
  W: { name: 'Bianco', fill: 'bg-amber-100 text-gray-900' },
  U: { name: 'Blu', fill: 'bg-blue-600 text-white' },
  B: { name: 'Nero', fill: 'bg-gray-950 text-white' },
  R: { name: 'Rosso', fill: 'bg-red-600 text-white' },
  G: { name: 'Verde', fill: 'bg-green-600 text-white' }
} as const

const totalPips = computed(() => pips.reduce((total, pip) => total + pip.count, 0))

const segments = computed(() => pips.map((pip) => {
  const percent = Math.round((pip.count / totalPips.value) * 100)
  return {
    ...pip,
    ...COLOR_STYLES[pip.color],
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
      class="flex min-w-0 items-center justify-center [--mana-size:22px]"
      :class="segment.fill"
      :style="{ flexGrow: segment.count, flexBasis: 0 }"
      :title="`${segment.name}: ${segment.percent}%`"
    >
      <MagicCardManaSymbol
        v-if="segment.showSymbol"
        :symbol="`{${segment.color}}`"
        plain
      />
    </div>
  </div>
</template>
