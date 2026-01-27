<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  player?: string
  placement?: string
  parsedCards?: string
  sectionCounts?: string // proxy prop needed 
}>()

console.log('=== MagicDecklist Component - ALL PROPS ===')
console.log('All props:', props)
console.log('sectionCounts:', props.sectionCounts)
console.log('==========================================')

// Use plural forms - no need for mapping anymore
const SECTIONS = ['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments', 'Lands', 'Sideboard'] as const

const cardsBySection = computed(() => {
  if (!props.parsedCards) return {}
  try {
    return JSON.parse(props.parsedCards) as Record<string, ParsedCard[]>
  } catch (e) {
    console.error('Failed to parse parsedCards:', e)
    return {}
  }
})

const counts = computed(() => {
  if (!props.sectionCounts) {
    console.log('⚠️ No sectionCounts prop - calculating manually')
    const counts: Record<string, number> = {}
    for (const [section, cards] of Object.entries(cardsBySection.value)) {
      counts[section] = cards.reduce((total, card) => total + card.quantity, 0)
    }
    return counts
  }
  
  try {
    const parsed = JSON.parse(props.sectionCounts) as Record<string, number>
    console.log('✅ Got sectionCounts from prop!', parsed)
    return parsed
  } catch (e) {
    console.error('❌ Failed to parse sectionCounts:', e)
    const counts: Record<string, number> = {}
    for (const [section, cards] of Object.entries(cardsBySection.value)) {
      counts[section] = cards.reduce((total, card) => total + card.quantity, 0)
    }
    return counts
  }
})

console.log('Final counts:', counts.value)
</script>

<template>
  <div class="decklist">
    <div class="decklist-header">
      <h3>{{ name }}</h3>
      <div v-if="player" class="player">Player: {{ player }}</div>
      <div v-if="placement" class="placement">{{ placement }}</div>
    </div>
    
    <div v-if="Object.keys(cardsBySection).length > 0" class="decklist-sections">
      <div v-for="section in SECTIONS" :key="section">
        <template v-if="cardsBySection[section] && cardsBySection[section].length > 0">
          <h4>{{ section }} ({{ counts[section] }})</h4>
          <ul>
            <li v-for="(card, idx) in cardsBySection[section]" :key="idx">
              {{ card.quantity }} {{ card.name }}
            </li>
          </ul>
        </template>
      </div>
    </div>
  </div>
</template>
