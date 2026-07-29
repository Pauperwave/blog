/**
 * Shared color-detection and decklist-parsing logic for the headerGradient
 * scripts (add-header-gradients.ts, verify-header-gradients.ts).
 */

import { readdirSync } from 'fs'
import { join } from 'path'
import { getCardsByNames } from '../../server/utils/card-database'

// Color mapping from mana symbols
const COLOR_SYMBOLS: Record<string, string> = {
  'W': 'white',
  'U': 'blue',
  'B': 'black',
  'R': 'red',
  'G': 'green',
}

// Cards that are commonly played in Pauper without access to their colors
// (e.g., reanimation effects, free returns from graveyard, sideboard hosers)
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
  'redgreenwhite': 'naya', // also a shard
  'greenwhiteblue': 'bant', // also a shard
  'redwhiteblue': 'jeskai',
  'whitebluegreen': 'bant',
  'whiteblackgreen': 'abzan',
  'blackredwhite': 'mardu',
  'bluegreenblack': 'sultai',
  'redbluegreen': 'temur',
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
    // Try direct match first
    if (GUILDS[colorKey]) return GUILDS[colorKey]
    // Try reversed order
    const reversedKey = colors.reverse().join('')
    return GUILDS[reversedKey] || null
  }

  if (colors.length === 3) {
    // Check shards first (canonical order)
    const shard = SHARDS[colorKey]
    if (shard) return shard

    // Check wedges (any order)
    const wedge = WEDGES[colorKey]
    if (wedge) return wedge

    // Try to find best match by checking all permutations
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

  // For 4+ colors, default to something reasonable or null
  return null
}

export interface DecklistInfo {
  file: string
  name: string
  player: string
  placement: string
  cards: string[]
  startLine: number
  existingGradient: string | null
}

/**
 * Parse every `::magic-decklist` block out of a decklist markdown file.
 * Returns all decklists found, regardless of whether they already carry a
 * headerGradient — callers filter for their own purpose (add vs. verify).
 */
export function parseDecklist(content: string, filePath: string): DecklistInfo[] {
  const decklists: DecklistInfo[] = []
  const lines = content.split('\n')

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '::magic-decklist') {
      const startLine = i
      let name = ''
      let player = ''
      let placement = ''
      let existingGradient: string | null = null
      const cards: string[] = []

      i++ // Move to ---
      i++ // Skip the opening ---

      // Parse frontmatter
      while (i < lines.length && lines[i].trim() !== '---') {
        const fmLine = lines[i].trim() // Trim to handle CRLF
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

      i++ // Skip closing ---

      // Parse cards until :: or Sideboard section
      // Note: We stop at "Sideboard" to only analyze maindeck colors
      while (i < lines.length && lines[i].trim() !== '::') {
        const cardLine = lines[i].trim()

        // Stop parsing when we hit the Sideboard section
        if (cardLine.toLowerCase() === 'sideboard') {
          i++
          break
        }

        // Match lines like "4 Lightning Bolt" or "4 Myr Enforcer"
        const cardMatch = cardLine.match(/^\d+\s+(.+)$/)
        if (cardMatch) {
          cards.push(cardMatch[1].trim())
        }
        i++
      }

      if (name) {
        decklists.push({
          file: filePath,
          name,
          player,
          placement,
          cards,
          startLine,
          existingGradient,
        })
      }
    }

    i++
  }

  return decklists
}

export function getDecklistFiles(decklistsDir = 'content/blog/decklists'): string[] {
  return readdirSync(decklistsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => join(decklistsDir, f))
}

/**
 * Fetch card data for a decklist's cards and derive its color identity and
 * suggested headerGradient value.
 */
export async function detectDeckColors(cards: string[]): Promise<{ gradient: string | null, colors: string[] }> {
  const cardDataMap = await getCardsByNames(cards)
  const deckColors = new Set<string>()

  for (const [cardName, cardData] of cardDataMap.entries()) {
    // Skip cards that are commonly played without their color requirements
    if (OFF_COLOR_CARDS.has(cardName)) continue

    if (cardData.manaCost) {
      const cardColors = extractManaColors(cardData.manaCost)
      cardColors.forEach(c => deckColors.add(c))
    }
  }

  return { gradient: determineGradient(deckColors), colors: Array.from(deckColors) }
}
