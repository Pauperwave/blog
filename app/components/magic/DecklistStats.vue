<script setup lang="ts">
import { curveLegend, curveTooltip } from '~/utils/curve-display'
import { formatEur, formatTix, type DeckPrice } from '~/utils/deck-price'
import type { DeckStats } from '~/utils/deck-stats'
import DecklistCostliestCards from './DecklistCostliestCards.vue'
import DecklistCurveBar from './DecklistCurveBar.vue'

const { stats, price = null, priceFailed = false } = defineProps<{
  stats: DeckStats
  /** Estimated price, once it has been loaded */
  price?: DeckPrice | null
  priceFailed?: boolean
}>()

const maxCurveCount = computed(() => Math.max(...stats.curve.map(bucket => bucket.count), 1))
const legend = computed(() => curveLegend(stats.curve))
const maxPipCount = computed(() => Math.max(...stats.pips.map(pip => pip.count), 1))

const priceFigure = computed(() => {
  if (!price) return { value: priceFailed ? 'n/d' : '…', detail: 'Prezzi da Scryfall' }

  const missing = price.missing > 0 ? ` · ${price.missing} carte senza prezzo` : ''
  return { value: formatEur(price.eur), detail: `${formatTix(price.tix)}${missing}` }
})

interface KeyFigure {
  label: string
  value: string | number
  detail?: string
  wide?: boolean
  costliest?: DeckPrice
}

const keyFigures = computed<KeyFigure[]>(() => [
  { label: 'Terre', value: stats.landCount },
  { label: 'Costo medio', value: stats.averageManaValue.toFixed(2) },
  { label: 'Prezzo stimato', ...priceFigure.value, wide: true, costliest: price ?? undefined }
])
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-3">
      <div
        v-for="figure in keyFigures"
        :key="figure.label"
        class="rounded-lg bg-elevated p-3"
        :class="{ 'col-span-2': figure.wide }"
      >
        <p class="m-0 text-2xl font-bold leading-none">
          {{ figure.value }}
        </p>
        <p class="m-0 mt-1 text-sm opacity-80">
          {{ figure.label }}
        </p>
        <p v-if="figure.detail" class="m-0 mt-0.5 text-xs opacity-60">
          {{ figure.detail }}
        </p>
        <div v-if="figure.costliest" class="mt-2">
          <p class="m-0 mb-1 text-xs opacity-60">
            Le carte più care
          </p>
          <DecklistCostliestCards :price="figure.costliest" />
        </div>
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
      <ul class="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-sm">
        <li
          v-for="entry in legend"
          :key="entry.color"
          class="flex items-center gap-1.5"
        >
          <span
            class="size-3 rounded-sm ring-1 ring-default"
            :class="entry.fill"
          />
          {{ entry.name }}
        </li>
      </ul>
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
