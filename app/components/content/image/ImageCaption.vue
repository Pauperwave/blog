<script setup lang="ts">
interface Props {
  src: string
  alt?: string
  caption?: string
}

const { src, alt = '', caption = '' } = defineProps<Props>()
</script>

<template>
  <figure class="my-6">
    <NuxtImg
      :src="src"
      :alt="alt"
      class="rounded-lg shadow-lg w-full h-auto object-cover"
      loading="lazy"
    />
    <figcaption
      v-if="caption"
      class="text-sm text-gray-600 dark:text-gray-400 italic text-center mt-2 px-4"
    >
      {{ caption }}
    </figcaption>
  </figure>
</template>
