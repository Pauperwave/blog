<script setup lang="ts">
defineProps<{
  /** Art crop image URL */
  src: string
  /** Card the art belongs to */
  card: string
}>()

const loaded = ref(false)
</script>

<template>
  <!-- Background layer: the art fades out towards the text, no mask so it renders the same in an exported image -->
  <div class="pointer-events-none absolute inset-0">
    <USkeleton v-if="!loaded" class="size-full rounded-none" />
    <img
      :src="src"
      :alt="card"
      crossorigin="anonymous"
      class="size-full object-cover object-[50%_25%] opacity-75"
      :class="{ hidden: !loaded }"
      @load="loaded = true"
    >
    <div class="absolute inset-0 bg-gradient-to-r from-elevated from-30% via-elevated/70 to-transparent" />
  </div>
</template>
