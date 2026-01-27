// ./modules/decklist-transformer.ts
import { defineNuxtModule } from '@nuxt/kit'
import { createRegExp, digit, whitespace, oneOrMore, char } from 'magic-regexp'

export default defineNuxtModule({
  meta: {
    name: 'decklist-transformer'
  },
  setup(_options, nuxt) {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    nuxt.hook('content:file:beforeParse', (ctx: any) => {
      const file = ctx.file || ctx
      
      if (file.extension === '.md') {
        console.log('Processing file:', file._id)
        let content = file.body as string
        
        // Check if content has MagicDecklist blocks (both formats)
        if (content.includes('::MagicDecklist') || content.includes('::magic-decklist')) {
          console.log('Found MagicDecklist block')
          content = transformDecklistBlocks(content)
        }
        
        file.body = content
      }
    })
  }
})

function transformDecklistBlocks(content: string): string {
  // Match both ::MagicDecklist and ::magic-decklist
  // Pattern: With frontmatter (case insensitive for component name)
  const blockWithFrontmatter = /::(MagicDecklist|magic-decklist)\s*\n---\n([\s\S]*?)\n---\n([\s\S]*?)::/gi
  
  console.log('Attempting to transform...')
  
  content = content.replace(blockWithFrontmatter, (match, componentName, frontmatter, decklistContent) => {
    console.log('Matched with frontmatter!')
    console.log('Component name:', componentName)
    console.log('Frontmatter:', frontmatter)
    console.log('Content preview:', decklistContent.substring(0, 100))
    
    const props = parseFrontmatter(frontmatter)
    const parsedCards = parseDecklist(decklistContent)
    
    console.log('Parsed cards:', parsedCards)
    
    const cardsJson = JSON.stringify(parsedCards).replace(/"/g, '&quot;')
    
    const propStrings = []
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string') {
        propStrings.push(`${key}="${value}"`)
      }
    }
    propStrings.push(`parsedCards="${cardsJson}"`)
    
    // Use the original component name format
    const result = `::${componentName}{${propStrings.join(' ')}}\n::`
    console.log('Transformed to:', result.substring(0, 200))
    return result
  })
  
  return content
}

/**
 * Parses YAML-like frontmatter into a key-value object
 * 
 * Example input:
 * ```
 * name: Jund
 * player: Demetrio Morselli
 * placement: Winner
 * ```
 * 
 * Output: { name: "Jund", player: "Demetrio Morselli", placement: "Winner" }
 */
function parseFrontmatter(yaml: string): Record<string, string> {
  const props: Record<string, string> = {}
  const lines = yaml.split('\n')
  
  for (const line of lines) {
    // Match pattern: "key: value"
    // Group 1: key (word characters)
    // Group 2: value (everything after colon and whitespace)
    const match = line.match(/^(\w+):\s*(.+)$/)
    
    // Check if match exists and has the required capture groups
    if (match && match[1] && match[2]) {
      const key = match[1]
      const value = match[2].trim()
      
      // Now TypeScript knows both key and value are strings
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

const SECTION_HEADERS: Record<string, string> = {
  'Creatures': 'Creature',
  'Instants': 'Instant',
  'Sorceries': 'Sorcery',
  'Artifacts': 'Artifact',
  'Enchantments': 'Enchantment',
  'Lands': 'Land',
  'Sideboard': 'Sideboard',
}

const SECTION_ORDER = [
  'Creature',
  'Instant',
  'Sorcery',
  'Artifact',
  'Enchantment',
  'Land',
  'Sideboard'
]

function parseDecklist(rawText: string): Record<string, ParsedCard[]> {
  const grouped: Record<string, ParsedCard[]> = {
    'Creature': [],
    'Instant': [],
    'Sorcery': [],
    'Artifact': [],
    'Enchantment': [],
    'Land': [],
    'Sideboard': [],
  }
  
  let currentSection = 'Creature'
  const lines = rawText.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    if (SECTION_HEADERS[trimmed]) {
      currentSection = SECTION_HEADERS[trimmed]
      continue
    }
    
    const match = trimmed.match(CARD_PATTERN)
    if (match) {
      grouped[currentSection].push({
        quantity: parseInt(match[1], 10),
        name: match[2],
        section: currentSection
      })
    }
  }
  
  const result: Record<string, ParsedCard[]> = {}
  for (const section of SECTION_ORDER) {
    if (grouped[section].length > 0) {
      result[section] = grouped[section]
    }
  }
  
  return result
}