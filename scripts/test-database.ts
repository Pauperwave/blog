/**
 * Test script to verify card database and API
 */

import { getCardsByNames } from '../server/utils/card-database'

console.log('🧪 Testing Card Database\n')

// Test 1: Get some cards
console.log('Test 1: Fetching test cards...')
const testCards = [
  'Lightning Bolt',
  'Brainstorm',
  'Counterspell',
  'Red Elemental Blast',
  'Blue Elemental Blast'
]
const cards = await getCardsByNames(testCards)
const missingCards: string[] = []

for (const name of testCards) {
  const card = cards.get(name)
  if (card) {
    console.log(`✅ ${card.name}`)
    console.log(`   Mana Cost: ${card.manaCost}`)
    console.log(`   Image: ${card.imageUrl ? 'Yes' : 'No'}`)
  } else {
    console.log(`❌ ${name} not found`)
    missingCards.push(name)
  }
}

if (missingCards.length > 0) {
  console.error(`\n❌ Missing required cards: ${missingCards.join(', ')}`)
  process.exit(1)
}

console.log('\n✨ All tests passed!')
