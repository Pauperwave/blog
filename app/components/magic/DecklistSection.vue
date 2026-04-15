<script setup lang="ts">
import MagicCardTypesIcon from './card/TypesIcon.vue'

defineProps<{
  section: string
  cards: Array<{ quantity: number; name: string; imageUrl?: string; manaCost?: string }>
  count: number
}>()
</script>

<template>
  <div class="mb-2">
    <h2 class="mt-2.5 first:mt-0 mb-0.5 text-base font-bold inline-flex items-center gap-1.5">
      <MagicCardTypesIcon :type="section" size="md" class="inline-flex" />
      {{ section }} <span class="font-medium opacity-80">({{ count }})</span>
    </h2>
    <ul class="list-none p-0 mt-0.5 mb-1.5">
      <li
        v-for="(card, index) in cards"
        :key="`${section}-${index}`"
        class="grid grid-cols-[auto_1fr_auto] items-center gap-2 m-0 p-0 leading-snug text-base font-medium"
      >
        <span class="font-mono font-semibold">{{ card.quantity }}</span>
        <MagicCardTooltip :name="card.name" :image="card.imageUrl" />
        <MagicCardManaCost v-if="card.manaCost" :cost="card.manaCost" class="min-w-16 justify-start" />
      </li>
    </ul>
  </div>
</template>
