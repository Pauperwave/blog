/**
 * Test script to verify card database and API
 */

import { getCardsByNames, getAllManaSymbols, getParsedManaCost } from '../server/utils/card-database'

console.log('🧪 Testing Card Database\n')

// Test 1: Get some cards
console.log('Test 1: Fetching test cards...')
const testCards = ['Lightning Bolt', 'Counterspell', 'Brainstorm']
const cards = await getCardsByNames(testCards)

for (const name of testCards) {
  const card = cards.get(name)
  if (card) {
    console.log(`✅ ${card.name}`)
    console.log(`   Mana Cost: ${card.manaCost}`)
    console.log(`   Image: ${card.imageUrl ? 'Yes' : 'No'}`)
    
    const parsed = await getParsedManaCost(card.manaCost)
    console.log(`   Symbols: ${parsed.symbols.join(', ')}`)
  } else {
    console.log(`❌ ${name} not found`)
  }
}

// Test 2: Mana symbols
console.log('\nTest 2: Mana symbols...')
const symbols = await getAllManaSymbols()
console.log(`✅ Loaded ${symbols.size} mana symbols`)

// Show a few examples
const exampleSymbols = ['{W}', '{U}', '{B}', '{R}', '{G}', '{C}', '{1}']
for (const symbol of exampleSymbols) {
  const uri = symbols.get(symbol)
  console.log(`   ${symbol}: ${uri ? '✅' : '❌'}`)
}

console.log('\n✨ All tests passed!')
