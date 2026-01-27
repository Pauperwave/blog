// ./modules/decklist-transformer.ts
import { defineNuxtModule } from '@nuxt/kit'
import { createRegExp, digit, whitespace, oneOrMore, char } from 'magic-regexp'

export default defineNuxtModule({
  meta: {
    name: 'decklist-transformer'
  },
  setup(_options, nuxt) {
    console.log('🚀 [Decklist Transformer] MODULE LOADED!')

    /* eslint-disable @typescript-eslint/no-explicit-any */
    nuxt.hook('content:file:beforeParse', (ctx: any) => {
      const file = ctx.file || ctx

      const allowedFolders = [
        'articles',
        'decklists',
        'reports',
        'tutorials',
      ]

      if (file.extension === '.md' && allowedFolders.some(folder => file.path?.includes(folder))) {
        console.log('[Decklist Transformer] Processing:', file.id)
        const content = file.body

        // Check if content has MagicDecklist blocks (both formats)
        if (content.includes('::MagicDecklist') || content.includes('::magic-decklist')) {
          console.log('[Decklist Transformer] Found MagicDecklist block')
          file.body = transformDecklistBlocks(content)
        }
      }
    })
  }
})

function transformDecklistBlocks(content: string): string {
  // Match both ::MagicDecklist and ::magic-decklist
  // Pattern: With frontmatter (case insensitive for component name)
  const blockWithFrontmatter = /::(MagicDecklist|magic-decklist)\s*\n---\n([\s\S]*?)\n---\n([\s\S]*?)::/gi

  console.log('[Decklist Transformer] Attempting to transform...')

  let matchCount = 0
  content = content.replace(blockWithFrontmatter, (componentName, frontmatter, decklistContent) => {
    matchCount++
    console.log(`[Decklist Transformer] Match #${matchCount} found!`)
    console.log('[Decklist Transformer] Component name:', componentName)
    console.log('[Decklist Transformer] Frontmatter:', frontmatter)

    const props = parseFrontmatter(frontmatter)
    const parsedCards = parseDecklist(decklistContent)
    const sectionCounts = calculateSectionCounts(parsedCards)

    console.log('[Decklist Transformer] Parsed cards:', parsedCards)
    console.log('[Decklist Transformer] Section counts:', sectionCounts)

    const cardsJson = JSON.stringify(parsedCards).replace(/"/g, '&quot;')
    const countsJson = JSON.stringify(sectionCounts).replace(/"/g, '&quot;')

    // Now push the props back into the markdown file
    const propStrings = []
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string') {
        propStrings.push(`${key}="${value}"`)
      }
    }
    propStrings.push(`parsedCards="${cardsJson}"`)
    propStrings.push(`sectionCounts="${countsJson}"`)

    const result = `::${componentName}{${propStrings.join(' ')}}\n::`
    return result
  })

  console.log(`[Decklist Transformer] Total matches found: ${matchCount}`)

  return content
}

/**
 * Parses YAML-like frontmatter into a key-value object
 */
function parseFrontmatter(yaml: string): Record<string, string> {
  const props: Record<string, string> = {}
  const lines = yaml.split('\n')

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/)
    if (match && match[1] && match[2]) {
      const key = match[1]
      const value = match[2].trim()
      props[key] = value
    }
  }

  return props
}

const CARD_PATTERN = createRegExp(
  oneOrMore(digit).grouped(),
  oneOrMore(whitespace),
  oneOrMore(char).grouped()
)

// Map input headers to plural forms
const SECTION_HEADERS: Record<string, string> = {
  'Creatures': 'Creatures',
  'Instants': 'Instants',
  'Sorceries': 'Sorceries',
  'Artifacts': 'Artifacts',
  'Enchantments': 'Enchantments',
  'Lands': 'Lands',
  'Sideboard': 'Sideboard',
}

// Use plural forms for section order
const SECTION_ORDER = [
  'Creatures',
  'Instants',
  'Sorceries',
  'Artifacts',
  'Enchantments',
  'Lands',
  'Sideboard'
]

function parseDecklist(rawText: string): Record<string, ParsedCard[]> {
  // Use plural forms as keys
  const grouped: Record<string, ParsedCard[]> = {
    'Creatures': [],
    'Instants': [],
    'Sorceries': [],
    'Artifacts': [],
    'Enchantments': [],
    'Lands': [],
    'Sideboard': [],
  }

  let currentSection: keyof typeof grouped = 'Creatures'
  const lines = rawText.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (SECTION_HEADERS[trimmed]) {
      currentSection = SECTION_HEADERS[trimmed] as keyof typeof grouped
      continue
    }

    const match = trimmed.match(CARD_PATTERN)
    if (match && match[1] && match[2]) {
      const section = grouped[currentSection]
      if (section) {
        section.push({
          quantity: parseInt(match[1], 10),
          name: match[2],
          section: currentSection
        })
      }
    }
  }

  const result: Record<string, ParsedCard[]> = {}
  for (const section of SECTION_ORDER) {
    const cards = grouped[section]
    if (cards && cards.length > 0) {
      result[section] = cards
    }
  }

  return result
}

function calculateSectionCounts(cardsBySection: Record<string, ParsedCard[]>): Record<string, number> {
  const counts: Record<string, number> = {}

  // Keys are already plural, no mapping needed
  for (const [section, cards] of Object.entries(cardsBySection)) {
    counts[section] = cards.reduce((total, card) => total + card.quantity, 0)
  }

  return counts
}
