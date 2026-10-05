<script setup lang="ts">
interface CarouselCard {
  name: string
  imageUrl: string
}

const { cards } = defineProps<{
  cards: CarouselCard[]
}>()
</script>

<template>
  <UCarousel
    v-slot="{ item }"
    :items="cards"
    drag-free
    align="start"
    :ui="{ item: 'basis-[45%]', container: 'gap-0' }"
    class="mb-4"
  >
    <img
      :src="item.imageUrl"
      :alt="item.name"
      loading="lazy"
      class="w-full h-auto rounded-xl"
    >
  </UCarousel>
</template>
