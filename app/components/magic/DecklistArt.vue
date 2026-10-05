<script setup lang="ts">
defineProps<{
  /** Art crop image URL */
  src: string
  /** Card the art belongs to */
  card: string
}>()
</script>

<template>
  <img
    :src="src"
    :alt="card"
    crossorigin="anonymous"
    class="aspect-[626/457] h-32 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-default"
  >
</template>
