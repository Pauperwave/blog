<!-- components/ManaSymbol.vue -->
<script setup lang="ts">
const props = defineProps<{
  symbol: string  // Es: "{U}", "{2}", "{R/G}"
}>()

// Converti simbolo Scryfall a classe Mana Font
const getManaClass = (symbol: string): string => {
  // Rimuovi le parentesi graffe
  const clean = symbol.replace(/[{}]/g, '')
  
  // Mappa simboli speciali
  const symbolMap: Record<string, string> = {
    'T': 'tap',
    'Q': 'untap',
    'E': 'energy',
    'X': 'x',
    'Y': 'y',
    'Z': 'z',
    // Hybrid mana
    'W/U': 'wu',
    'W/B': 'wb',
    'U/B': 'ub',
    'U/R': 'ur',
    'B/R': 'br',
    'B/G': 'bg',
    'R/G': 'rg',
    'R/W': 'rw',
    'G/W': 'gw',
    'G/U': 'gu',
    // Phyrexian
    'W/P': 'wp',
    'U/P': 'up',
    'B/P': 'bp',
    'R/P': 'rp',
    'G/P': 'gp',
    // Snow
    'S': 's',
    // Colorless
    'C': 'c',
  }
  
  // Se è un numero, usa direttamente
  if (/^\d+$/.test(clean)) {
    return clean
  }
  
  // Altrimenti usa la mappa o lowercase
  return symbolMap[clean] || clean.toLowerCase()
}

const manaClass = computed(() => `ms ms-${getManaClass(props.symbol)} ms-cost`)
</script>

<template>
  <i :class="manaClass" :title="symbol" />
</template>

<style scoped>
.ms {
  font-size: 14px;
  vertical-align: middle;
}
</style>
