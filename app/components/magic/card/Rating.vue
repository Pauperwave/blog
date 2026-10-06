<script setup lang="ts">
interface Props {
  cardName: string
  rating: number
}

const { cardName, rating } = defineProps<Props>()

const badgeColor = computed(() => {
  if (rating >= 8) return 'success'
  if (rating >= 6) return 'primary'
  if (rating >= 4) return 'warning'
  return 'error'
})
</script>

<template>
  <UCard>
    <div class="flex flex-col items-center gap-3">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Voto complessivo per <MagicCardTooltip :name="cardName" />
      </h2>

      <UInputRating
        :model-value="rating"
        :length="10"
        :step="0.5"
        readonly
        icon="i-lucide-star"
        color="warning"
      />

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
