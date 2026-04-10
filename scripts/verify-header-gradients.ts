#!/usr/bin/env bun
/**
 * Script to verify headerGradient assignments in decklists
 * Reports mismatches between detected colors and assigned gradient
 */

import { readFile } from 'fs/promises'
import { readdirSync } from 'fs'
import { join } from 'path'
import { getCardsByNames, closeDatabase } from '../server/utils/card-database'

// Color mapping from mana symbols
const COLOR_SYMBOLS: Record<string, string> = {
  'W': 'white',
  'U': 'blue',
  'B': 'black',
  'R': 'red',
  'G': 'green',
}

// Cards that are commonly played in Pauper without access to their colors
const OFF_COLOR_CARDS: Set<string> = new Set([
  'Sneaky Snacker',      // Returns from graveyard when you draw 3rd card, played in mono-red
  'Faerie Macabre',      // Can be exiled from hand without paying mana, played for graveyard hate
  'Masked Vandal',       // Sideboard artifact/enchantment hate, often played in non-green decks
  'Street Wraith',       // Can be paid with life (2 life) to cycle, played in non-black decks
  'Hydroblast',          // Sideboard blue counterspell, played in any deck
  'Pyroblast',           // Sideboard red counterspell, played in any deck
  "Blue Elemental Blast", // Sideboard blue counterspell, played in any deck
  "Red Elemental Blast",  // Sideboard red counterspell, played in any deck
])

// Two-color combinations (guilds)
const GUILDS: Record<string, string> = {
  'whiteblue': 'azorius',
  'blueblack': 'dimir',
  'blackred': 'rakdos',
  'redgreen': 'gruul',
  'greenwhite': 'selesnya',
  'whiteblack': 'orzhov',
  'blackgreen': 'golgari',
  'greenblue': 'simic',
  'bluered': 'izzet',
  'redwhite': 'boros',
}

// Three-color combinations (shards - arc)
const SHARDS: Record<string, string> = {
  'whiteblueblack': 'esper',
  'blueblackred': 'grixis',
  'blackredgreen': 'jund',
  'redgreenwhite': 'naya',
  'greenwhiteblue': 'bant',
}

// Three-color combinations (wedges - non-arc)
const WEDGES: Record<string, string> = {
  'whiteblackred': 'mardu',
  'blueredgreen': 'temur',
  'blackgreenblue': 'sultai',
  'redwhiteblue': 'jeskai',
  'greenblueblack': 'sultai',
  'whitebluegreen': 'bant',
  'whiteblackgreen': 'abzan',
  'blackredwhite': 'mardu',
  'bluegreenblack': 'sultai',
  'redbluegreen': 'temur',
}

interface DecklistInfo {
  file: string
  name: string
  player: string
  placement: string
  cards: string[]
  existingGradient: string | null
}

function extractManaColors(manaCost: string): Set<string> {
  const colors = new Set<string>()
  // Note: Phyrexian mana symbols like {G/P} are intentionally ignored
  // because they can be paid with life instead of colored mana,
  // so they don't represent a deck's color commitment.
  //
  // LIMITATION: Cards like "Sneaky Snacker" ({U}{B}) may appear in decks
  // without blue/black mana sources because they return from graveyard
  // without being cast. The script may over-estimate colors for such decks.
  const matches = manaCost.match(/\{([WUBRG])\}/g)
  if (matches) {
    for (const match of matches) {
      const symbol = match.replace(/[{}]/g, '')
      const color = COLOR_SYMBOLS[symbol]
      if (color) colors.add(color)
    }
  }
  return colors
}

function determineGradient(deckColors: Set<string>): string | null {
  const colors = Array.from(deckColors).sort()
  const colorKey = colors.join('')

  if (colors.length === 0) {
    return 'colorless'
  }

  if (colors.length === 1) {
    return `mono${colors[0]}`
  }

  if (colors.length === 2) {
    if (GUILDS[colorKey]) return GUILDS[colorKey]
    const reversedKey = colors.reverse().join('')
    return GUILDS[reversedKey] || null
  }

  if (colors.length === 3) {
    const shard = SHARDS[colorKey]
    if (shard) return shard

    const wedge = WEDGES[colorKey]
    if (wedge) return wedge

    for (const [key, value] of Object.entries(SHARDS)) {
      const shardColors: string[] = key.match(/(white|blue|black|red|green)/g) || []
      if (colors.every(c => shardColors.includes(c))) {
        return value
      }
    }

    for (const [key, value] of Object.entries(WEDGES)) {
      const wedgeColors: string[] = key.match(/(white|blue|black|red|green)/g) || []
      if (colors.every(c => wedgeColors.includes(c))) {
        return value
      }
    }
  }

  return null
}

function parseDecklist(content: string, filePath: string): DecklistInfo[] {
  const decklists: DecklistInfo[] = []
  const lines = content.split('\n')

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '::magic-decklist') {
      const _startLine = i
      const _endLine = i
      let name = ''
      let player = ''
      let placement = ''
      let existingGradient: string | null = null
      const cards: string[] = []

      i++
      i++

      while (i < lines.length && lines[i].trim() !== '---') {
        const fmLine = lines[i].trim()
        const nameMatch = fmLine.match(/^name:\s*(.+)$/)
        const playerMatch = fmLine.match(/^player:\s*(.+)$/)
        const placementMatch = fmLine.match(/^placement:\s*(.+)$/)
        const gradientMatch = fmLine.match(/^headerGradient:\s*(.+)$/)

        if (nameMatch) name = nameMatch[1].trim()
        if (playerMatch) player = playerMatch[1].trim()
        if (placementMatch) placement = placementMatch[1].trim()
        if (gradientMatch) existingGradient = gradientMatch[1].trim()

        i++
      }

      i++

      // Parse cards until :: or Sideboard section
      // Note: We stop at "Sideboard" to only analyze maindeck colors
      while (i < lines.length && lines[i].trim() !== '::') {
        const cardLine = lines[i].trim()

        // Stop parsing when we hit the Sideboard section
        if (cardLine.toLowerCase() === 'sideboard') {
          i++
          break
        }

        const cardMatch = cardLine.match(/^\d+\s+(.+)$/)
        if (cardMatch) {
          cards.push(cardMatch[1].trim())
        }
        i++
        // Line tracking removed
      }

      if (name) {
        decklists.push({
          file: filePath,
          name,
          player,
          placement,
          cards,
          existingGradient,
        })
      }
    }

    i++
  }

  return decklists
}

async function analyzeDecklist(decklist: DecklistInfo): Promise<{ detected: string | null; colors: string[] }> {
  try {
    const cardDataMap = await getCardsByNames(decklist.cards)

    const deckColors = new Set<string>()

    for (const [cardName, cardData] of cardDataMap.entries()) {
      if (OFF_COLOR_CARDS.has(cardName)) continue

      if (cardData.manaCost) {
        const cardColors = extractManaColors(cardData.manaCost)
        cardColors.forEach(c => deckColors.add(c))
      }
    }

    const gradient = determineGradient(deckColors)

    return { detected: gradient, colors: Array.from(deckColors) }
  } catch (error) {
    console.error(`  Error analyzing ${decklist.name}:`, error)
    return { detected: null, colors: [] }
  }
}

async function processFile(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8')
  const decklists = parseDecklist(content, filePath)

  if (decklists.length === 0) return

  for (const decklist of decklists) {
    const { detected, colors } = await analyzeDecklist(decklist)

    const hasMismatch = decklist.existingGradient && detected && decklist.existingGradient !== detected
    const hasNoGradient = !decklist.existingGradient

    if (hasMismatch) {
      console.log(`\n⚠️  MISMATCH in ${filePath}`)
      console.log(`   Deck: ${decklist.name} (${decklist.player})`)
      console.log(`   Detected colors: ${colors.join(', ') || 'colorless'}`)
      console.log(`   Suggested: ${detected}`)
      console.log(`   Current:   ${decklist.existingGradient}`)
    } else if (hasNoGradient) {
      console.log(`\n❌ MISSING in ${filePath}`)
      console.log(`   Deck: ${decklist.name} (${decklist.player})`)
      console.log(`   Detected colors: ${colors.join(', ') || 'colorless'}`)
      console.log(`   Suggested: ${detected || 'UNKNOWN'}`)
    }
  }
}

async function main() {
  // Process all markdown files in the decklists directory
  const decklistsDir = 'content/blog/decklists'
  const filesToProcess = readdirSync(decklistsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => join(decklistsDir, f))

  console.log('🔍 Verifying Header Gradient Assignments')
  console.log(`   Processing ${filesToProcess.length} files\n`)

  for (const file of filesToProcess) {
    const fullPath = join(process.cwd(), file)
    await processFile(fullPath)
  }

  closeDatabase()
  console.log('\n✨ Verification complete!')
}

main().catch(console.error)
