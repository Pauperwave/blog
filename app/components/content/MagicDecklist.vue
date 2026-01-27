<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  player?: string
  placement?: string
  parsedCards?: string   // proxy prop injected from transformer
  sectionCounts?: string // proxy prop injected from transformer
}>()

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
  if (!props.sectionCounts) return {}
  try {
    return JSON.parse(props.sectionCounts) as Record<string, number>
  } catch (e) {
    console.error('Failed to parse sectionCounts:', e)
    return {}
  }
})
</script>

<template>
  <div class="decklist">
    <div class="decklist-header">
      <h3>Name: {{ name }}</h3>
      <div v-if="player" class="player">Player: {{ player }}</div>
      <div v-if="placement" class="placement">Placement: {{ placement }}</div>
    </div>
    <br>
    <div v-if="Object.keys(cardsBySection).length > 0" class="decklist-sections">
      <div v-for="section in SECTIONS" :key="section">
        <template v-if="cardsBySection[section] && cardsBySection[section].length > 0">
          <h4>{{ section }} ({{ counts[section] }})</h4>
          <ul>
            <li v-for="(card, idx) in cardsBySection[section]" :key="idx">
              {{ card.quantity }} {{ card.name }} {{ card.mana_cost }}
            </li>
          </ul>
          <br>
        </template>
      </div>
    </div>
  </div>
</template>
