<script setup lang="ts">
import { computed } from 'vue'
import type { ParsedCard, Section } from '#shared/types/decklist'

const props = defineProps<{
  name: string
  player?: string
  placement?: string
  parsedCards?: string
}>()

// Log the raw prop received
console.log('=== MagicDecklist Component ===')
console.log('Component name:', props.name)
console.log('Raw parsedCards prop:', props.parsedCards)

// Pretty print the parsed JSON
if (props.parsedCards) {
  try {
    const parsed = JSON.parse(props.parsedCards)
    console.log('Parsed (pretty printed):')
    console.log(JSON.stringify(parsed, null, 2))
  } catch (e) {
    console.log('Failed to parse as JSON:', e)
  }
}

console.log('parsedCards type:', typeof props.parsedCards)
console.log('parsedCards length:', props.parsedCards?.length)

const SECTION_LABELS: Record<string, string> = {
  'Creature': 'Creatures',
  'Instant': 'Instants',
  'Sorcery': 'Sorceries',
  'Artifact': 'Artifacts',
  'Enchantment': 'Enchantments',
  'Land': 'Lands',
  'Sideboard': 'Sideboard',
}

// Define the sections as a typed constant
const SECTIONS = ['Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Land', 'Sideboard'] as const

const cardsBySection = computed(() => {
  if (!props.parsedCards) {
    console.log('No parsedCards prop provided')
    return {}
  }
  
  try {
    const parsed = JSON.parse(props.parsedCards) as Record<string, ParsedCard[]>
    console.log('Successfully parsed cardsBySection:', parsed)
    console.log('Number of sections:', Object.keys(parsed).length)
    
    // Log each section
    for (const [section, cards] of Object.entries(parsed)) {
      console.log(`Section "${section}":`, cards.length, 'cards')
      console.log('  First card:', cards[0])
    }
    
    return parsed
  } catch (error) {
    console.error('Failed to parse parsedCards JSON:', error)
    console.error('Raw value was:', props.parsedCards)
    return {}
  }
})

// Log the computed result
console.log('Final cardsBySection value:', cardsBySection.value)
console.log('===========================')
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
          <h4>{{ SECTION_LABELS[section] }}</h4>
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
