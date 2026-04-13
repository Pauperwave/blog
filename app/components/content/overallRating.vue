<script setup lang="ts">
defineProps<{
  rating: string | number
}>()
</script>

<template>
  <div class="my-6 flex items-center gap-2">
    <h2>
      Voto complessivo:
    </h2>
    <UBadge
      color="primary"
      variant="subtle"
      size="lg"
    >
      {{ rating }}
    </UBadge>
  </div>
</template>
