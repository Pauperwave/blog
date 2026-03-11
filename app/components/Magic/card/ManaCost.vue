<!-- app\components\Magic\CardManaCost.vue -->
<script setup lang="ts">
const props = defineProps<{
  cost: string  // Es: "{2}{U}{U}"
}>()

// Parse mana cost in simboli individuali
const symbols = computed(() => {
  if (!props.cost) return []
  const matches = props.cost.match(/\{[^}]+\}/g)
  return matches || []
})
</script>

<template>
  <span class="mana-cost">
    <MagicCardManaSymbol
      v-for="(symbol, idx) in symbols"
      :key="idx"
      :symbol="symbol"
    />
  </span>
</template>

<style scoped>
.mana-cost {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
}
</style>
