<script setup lang="ts">
const props = defineProps<{
  rating: number
}>()

const ratingValue = computed(() => {
  return props.rating
})

const fullStars = computed(() => Math.floor(ratingValue.value))
const hasHalfStar = computed(() => ratingValue.value % 1 >= 0.5)
const emptyStars = computed(() => 5 - fullStars.value - (hasHalfStar.value ? 1 : 0))
</script>

<template>
  <div class="my-6">
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 shadow-sm p-6">
      <div class="flex flex-col items-center justify-center gap-3">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Voto complessivo:
        </h2>
        <div class="flex items-center gap-1">
          <Icon
            v-for="i in fullStars"
            :key="`full-${i}`"
            name="i-lucide-star"
            class="w-6 h-6 text-yellow-500 fill-yellow-500"
          />
          <Icon
            v-if="hasHalfStar"
            name="i-lucide-star-half"
            class="w-6 h-6 text-yellow-500 fill-yellow-500/50"
          />
          <Icon
            v-for="i in emptyStars"
            :key="`empty-${i}`"
            name="i-lucide-star"
            class="w-6 h-6 text-gray-300 dark:text-gray-600"
          />
        </div>
        <UBadge
          color="primary"
          variant="soft"
          size="lg"
          class="text-lg font-semibold"
        >
          {{ rating }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
