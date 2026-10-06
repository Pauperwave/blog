<script setup lang="ts">
import { curveTooltip, type DeckStats } from '~/utils/deck-stats'
import DecklistCurveBar from './DecklistCurveBar.vue'

const { stats } = defineProps<{
  stats: DeckStats
}>()

const maxCurveCount = computed(() => Math.max(...stats.curve.map(bucket => bucket.count), 1))
const maxPipCount = computed(() => Math.max(...stats.pips.map(pip => pip.count), 1))

const keyFigures = computed(() => [
  { label: 'Terre', value: stats.landCount },
  { label: 'Costo medio', value: stats.averageManaValue.toFixed(2) }
])
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="figure in keyFigures"
        :key="figure.label"
        class="rounded-lg bg-elevated p-3"
      >
        <p class="m-0 text-2xl font-bold leading-none">
          {{ figure.value }}
        </p>
        <p class="m-0 mt-1 text-sm opacity-80">
          {{ figure.label }}
        </p>
      </div>
    </div>

    <section>
      <h3 class="mt-0 mb-3 text-base font-bold">
        Curva di mana
      </h3>
      <div class="flex h-40 items-end gap-2">
        <UTooltip
          v-for="bucket in stats.curve"
          :key="bucket.label"
          :text="curveTooltip(bucket)"
        >
          <div class="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span class="text-sm font-semibold">{{ bucket.count || '' }}</span>
            <DecklistCurveBar
              v-if="bucket.count"
              :bucket="bucket"
              class="w-full"
              :style="{ height: `${(bucket.count / maxCurveCount) * 100}%` }"
            />
            <span class="text-sm opacity-80">{{ bucket.label }}</span>
          </div>
        </UTooltip>
      </div>
    </section>

    <section v-if="stats.pips.length">
      <h3 class="mt-0 mb-3 text-base font-bold">
        Simboli di mana
      </h3>
      <ul class="m-0 flex list-none flex-col gap-2 p-0">
        <li
          v-for="pip in stats.pips"
          :key="pip.color"
          class="flex items-center gap-3"
        >
          <MagicCardManaSymbol :symbol="`{${pip.color}}`" />
          <div class="h-3 flex-1 overflow-hidden rounded bg-elevated">
            <div
              class="h-full rounded"
              :class="MANA_COLOR_STYLES[pip.color].fill"
              :style="{ width: `${(pip.count / maxPipCount) * 100}%` }"
            />
          </div>
          <span class="w-6 text-right text-sm font-semibold">{{ pip.count }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
