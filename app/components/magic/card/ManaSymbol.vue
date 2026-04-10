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
    <MagicCardManaSymbol symbol="wub" />
-->
<script setup lang="ts">
const props = defineProps<{
  symbol?: string           // Es: "{U}", "{2}", "{R/G}", "wubrg" - Formato Scryfall o sequenza colori
  combination?: ManaCombination  // Es: "azorius", "gruul", "jund" - Nome della combinazione
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

// Mappa nomi combinazioni → sequenze colori (lowercase)
const combinationMap = {
  // Mono colori
  'monowhite': 'w',
  'monoblue': 'u',
  'monoblack': 'b',
  'monored': 'r',
  'monogreen': 'g',
  'colorless': 'c',
  // Due colori (Ally colors - adiacenti nel cerchio di mana)
  'azorius': 'wu',
  'dimir': 'ub',
  'rakdos': 'br',
  'gruul': 'rg',
  'selesnya': 'gw',
  // Due colori (Enemy colors - opposti nel cerchio di mana)
  'orzhov': 'wb',
  'golgari': 'bg',
  'simic': 'gu',
  'izzet': 'ur',
  'boros': 'rw',
  // Tre colori (Shards)
  'esper': 'wub',
  'grixis': 'ubr',
  'jund': 'brg',
  'naya': 'rgw',
  'bant': 'gwu',
  // Tre colori (Wedges)
  'mardu': 'wbr',
  'temur': 'urg',
  'sultai': 'bgu',
  'jeskai': 'rwu',
  'abzan': 'wbg',
} as const

// Type-safe type per le combinazioni
export type ManaCombination = keyof typeof combinationMap

// Risolve la sequenza colori da symbol o combination
const resolvedSequence = computed((): string | null => {
  // Priorità alla prop combination
  if (props.combination) {
    const sequence = combinationMap[props.combination]
    if (sequence) {
      return sequence
    }
    console.warn(`[ManaSymbol] Unknown combination: "${props.combination}"`)
  }
  // Fallback alla prop symbol
  if (props.symbol) {
    return props.symbol
  }
  return null
})

// Controlla se la sequenza risolta è una sequenza di soli colori (w,u,b,r,g,c)
// Esempi: "w", "wu", "wub", "wubrg", "rg", "wubrgc"
const isColorSequence = computed(() => {
  const seq = resolvedSequence.value
  if (!seq) return false
  const clean = seq.replace(/[{}]/g, '').toLowerCase()
  return clean.length >= 1 && /^[wubrgc]+$/.test(clean)
})

// Split sequenza in array di simboli individuali
const colorSymbols = computed(() => {
  const seq = resolvedSequence.value
  if (!seq) return []
  const clean = seq.replace(/[{}]/g, '').toLowerCase()
  return clean.split('')
})

// Helper per generare la classe CSS
const manaClass = (symbol: string) => `ms ms-${getManaClass(symbol)} ms-cost`
</script>

<template>
  <template v-if="resolvedSequence">
    <template v-if="isColorSequence">
      <span class="mana-sequence">
        <i
          v-for="(s, i) in colorSymbols"
          :key="i"
          :class="manaClass(s)"
          :title="s.toUpperCase()"
        />
      </span>
    </template>
    <!-- Handle split card separator // -->
    <template v-else-if="resolvedSequence === '//'">
      <span class="split-separator">//</span>
    </template>
    <i v-else :class="manaClass(resolvedSequence)" :title="resolvedSequence" />
  </template>
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

.mana-sequence {
  display: inline-flex;
  gap: 0.20em;
  vertical-align: middle;
}

.split-separator {
  display: inline-flex;
  align-items: center;
  margin: 0 0.25em;
  font-weight: 500;
  color: var(--mana-color, currentColor);
  opacity: 0.7;
}
</style>
