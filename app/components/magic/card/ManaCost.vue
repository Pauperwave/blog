<!-- app\components\Magic\CardManaCost.vue -->
<script setup lang="ts">
interface Props {
  cost: string  // Es: "{2}{U}{U}" or "{1}{R} // {2}{U}" for split cards
}

const { cost } = defineProps<Props>()

// Parse mana cost in simboli individuali
// Handles split cards with // separator
const symbols = computed(() => {
  if (!cost) return []

  // Split by // separator for split cards
  const parts = cost.split(' // ')
  const result: string[] = []

  for (const part of parts) {
    const matches = part.match(/\{[^}]+\}/g)
    if (matches) {
      result.push(...matches)
    }
    // Add separator between faces (but not after the last one)
    if (parts.length > 1 && part !== parts[parts.length - 1]) {
      result.push('//')
    }
  }

  return result
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
