<!-- app\components\Magic\CardManaSymbol.vue -->

<!--
  Componente per visualizzare i simboli di mana di Magic: The Gathering
  
  Utilizza mana-font (https://mana.andrewgioia.com/) per renderizzare
  i simboli iconografici del mana.
  
  IMPORTANTE: mana-font è importato con `scoped` per evitare conflitti CSS
  con Tailwind. Entrambi usano la classe `ms` (mana-font per "mana symbol",
  Tailwind per "margin-inline-start"), causando clash se importato globalmente.
  
  Uso:
    <MagicCardManaSymbol symbol="{U}" />
    <MagicCardManaSymbol symbol="{2}" />
    <MagicCardManaSymbol symbol="{R/G}" />
-->
<script setup lang="ts">
const props = defineProps<{
  symbol: string  // Es: "{U}", "{2}", "{R/G}" - Formato Scryfall
}>()

/**
 * Converte un simbolo in formato Scryfall (es: "{U}", "{R/G}")
 * alla classe CSS corrispondente di mana-font
 */
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
    // Hybrid mana (bicolore)
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
    // Phyrexian mana
    'W/P': 'wp',
    'U/P': 'up',
    'B/P': 'bp',
    'R/P': 'rp',
    'G/P': 'gp',
    // Snow mana
    'S': 's',
    // Colorless
    'C': 'c',
  }
  
  // Se è un numero (mana generico), usa direttamente
  if (/^\d+$/.test(clean)) {
    return clean
  }
  
  // Altrimenti usa la mappa o converti in lowercase per i colori base (W, U, B, R, G)
  return symbolMap[clean] || clean.toLowerCase()
}

const manaClass = computed(() => `ms ms-${getManaClass(props.symbol)} ms-cost`)
</script>

<template>
  <i :class="manaClass" :title="symbol" />
</template>

<style scoped>
/* 
  IMPORTANTE: Import scoped per evitare conflitti con Tailwind CSS
  mana-font usa classi come "ms", "ms-3" che collidono con le utility
  Tailwind (ms-3 = margin-inline-start: calc(var(--spacing) * 3);)
*/
@import "mana-font/css/mana.css";

i.ms {
  font-size: 14px;
  vertical-align: middle;
  /* Disabilita Tailwind spacing sugli elementi <i> con classi ms-* */
  margin-inline-start: 0 !important;
}
</style>