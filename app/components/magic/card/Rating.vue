<script setup lang="ts">
const props = defineProps<{
  cardName: string
  rating: number
}>()

const stars = computed(() =>
  Array.from({ length: 10 }, (_, i) => {
    if (i < Math.floor(props.rating)) return 'full'
    if (i === Math.floor(props.rating) && props.rating % 1 >= 0.5) return 'half'
    return 'empty'
  })
)

const badgeColor = computed(() => {
  if (props.rating >= 8) return 'success'
  if (props.rating >= 6) return 'primary'
  if (props.rating >= 4) return 'warning'
  return 'error'
})
</script>

<template>
  <UCard>
    <div class="flex flex-col items-center gap-3">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Voto complessivo per <MagicCardTooltip :name="cardName" />
      </h2>

      <div class="flex flex-wrap justify-center items-center gap-1">
        <div v-for="(state, i) in stars" :key="i" class="relative size-5">
          <UIcon name="i-lucide-star" class="size-5 text-gray-300 dark:text-gray-600" />
          <UIcon
            v-if="state !== 'empty'"
            :name="state === 'half' ? 'i-lucide-star-half' : 'i-lucide-star'"
            class="absolute inset-0 size-5 text-yellow-500"
          />
        </div>
      </div>

      <UBadge
        :color="badgeColor"
        variant="soft"
        size="lg"
        class="text-lg font-semibold"
      >
        {{ rating }} / 10
      </UBadge>
    </div>
  </UCard>
</template>
