<script setup lang="ts">
import { costliestLines, formatEur, type DeckPrice } from '~/utils/deck-price'

const { price } = defineProps<{
  price: DeckPrice
}>()

const lines = computed(() => costliestLines(price))
</script>

<template>
  <ul class="m-0 flex list-none flex-col gap-0.5 p-0 text-xs">
    <li
      v-for="line in lines"
      :key="line.key"
      class="flex justify-between gap-4"
    >
      <span>{{ line.quantity }}× {{ line.name }}</span>
      <span class="tabular-nums">{{ formatEur(line.total) }}</span>
    </li>
  </ul>
</template>
