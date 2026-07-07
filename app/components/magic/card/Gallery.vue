<script setup lang="ts">
defineProps<{
  cards: string[]
  caption?: string
}>()
</script>

<template>
  <figure>
    <div
      class="flex gap-4 overflow-x-auto justify-center mask-[linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
    >
      <MagicCardDisplay
        v-for="card in cards"
        :key="card"
        :card="card"
        class="shrink-0"
      />
    </div>
    <figcaption v-if="caption" class="text-sm text-muted text-center py-4">
      {{ caption }}
    </figcaption>
  </figure>
</template>