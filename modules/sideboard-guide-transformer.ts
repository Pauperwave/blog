// ./modules/sideboard-guide-transformer.ts
import { existsSync } from 'fs'
import { join } from 'path'
import { defineNuxtModule } from '@nuxt/kit'
import { createRegExp, digit, whitespace, oneOrMore, char } from 'magic-regexp'
import { getCardsByNames } from '../server/utils/card-database'

export default defineNuxtModule({
  meta: {
    name: 'sideboard-guide-transformer'
  },
  setup(_options, nuxt) {
    console.log('🚀 [Sideboard Guide Transformer] MODULE LOADED!')

    /* eslint-disable @typescript-eslint/no-explicit-any */
    nuxt.hook('content:file:beforeParse', async (ctx: any) => {
      const file = ctx.file || ctx

      const allowedFolders = [
        'articles',
        'reports',
        'tutorials',
      ]

      if (file.extension === '.md' && allowedFolders.some(folder => file.path?.includes(folder))) {
        const content = file.body

        if (content.includes('::SideboardGuide') || content.includes('::sideboard-guide')) {
          file.body = await transformSideboardGuideBlocks(content)
        }
      }
    })
  }
})

async function transformSideboardGuideBlocks(content: string): Promise<string> {
  const blockWithFrontmatter = /::(MagicSideboardGuide|magic-sideboard-guide)\s*\n---\n([\s\S]*?)\n---\n([\s\S]*?)::/gi

  const matches: Array<{ 
    match: string, 
    componentName: string, 
    frontmatter: string, 
    guideContent: string, 
    index: number 
  }> = []
  
  let match
  while ((match = blockWithFrontmatter.exec(content)) !== null) {
    if (!match[1] || !match[2] || !match[3]) continue

    matches.push({
      match: match[0],
      componentName: match[1],
      frontmatter: match[2],
      guideContent: match[3],
      index: match.index
    })
  }

  // Process matches in reverse order to maintain correct indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const item = matches[i]
    if (!item) continue
    
    const { match, componentName, frontmatter, guideContent, index } = item
    
    const props = parseFrontmatter(frontmatter)
    const { cardsIn, cardsOut, cardsOutAlt } = await parseSideboardGuide(guideContent)

    const cardsInJson = JSON.stringify(cardsIn).replace(/"/g, '&quot;')
    const cardsOutJson = JSON.stringify(cardsOut).replace(/"/g, '&quot;')
    const cardsOutAltJson = JSON.stringify(cardsOutAlt).replace(/"/g, '&quot;')

    const propStrings = []
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string') {
        propStrings.push(`${key}="${value}"`)
      }
    }
    propStrings.push(`cardsInParsed="${cardsInJson}"`)
    propStrings.push(`cardsOutParsed="${cardsOutJson}"`)
    propStrings.push(`cardsOutAltParsed="${cardsOutAltJson}"`)

    const result = `::${componentName}{${propStrings.join(' ')}}\n::`
    
    content = content.substring(0, index) + result + content.substring(index + match.length)
  }

  return content
}

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

async function parseSideboardGuide(rawText: string): Promise<{
  cardsIn: ParsedCard[]
  cardsOut: ParsedCard[]
  cardsOutAlt: ParsedCard[]
}> {
  const sections = {
    in: [] as string[],
    out: [] as string[],
    outAlt: [] as string[]
  }

  let currentSection: 'in' | 'out' | 'outAlt' | null = null
  const lines = rawText.split('\n')

  // First pass: group lines by section
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Detect section headers (like #in, #out, #out-alt)
    if (trimmed.startsWith('#in')) {
      currentSection = 'in'
      continue
    } else if (trimmed.startsWith('#out-alt')) {
      currentSection = 'outAlt'
      continue
    } else if (trimmed.startsWith('#out')) {
      currentSection = 'out'
      continue
    }

    // Add card lines to current section
    if (currentSection && CARD_PATTERN.test(trimmed)) {
      sections[currentSection].push(trimmed)
    }
  }

  // Collect all unique card names
  const cardNames: Set<string> = new Set()
  for (const section of Object.values(sections)) {
    for (const line of section) {
      const match = line.match(CARD_PATTERN)
      if (match && match[2]) {
        cardNames.add(match[2])
      }
    }
  }

  // Check if database exists
  const dbPath = join(process.cwd(), 'server', 'database', 'cards.db')
  const dbExists = existsSync(dbPath)
  
  let cardDataMap: Map<string, any> = new Map()
  
  if (dbExists) {
    // Batch lookup all cards from database
    cardDataMap = await getCardsByNames(Array.from(cardNames))
  } else {
    console.warn('⚠️ Database not found, skipping card data lookup')
  }

  // Parse each section
  const cardsIn = await parseCardSection(sections.in, cardDataMap)
  const cardsOut = await parseCardSection(sections.out, cardDataMap)
  const cardsOutAlt = await parseCardSection(sections.outAlt, cardDataMap)

  return { cardsIn, cardsOut, cardsOutAlt }
}

async function parseCardSection(
  lines: string[], 
  cardDataMap: Map<string, any>
): Promise<ParsedCard[]> {
  const cards: ParsedCard[] = []

  for (const line of lines) {
    const match = line.match(CARD_PATTERN)
    if (match && match[1] && match[2]) {
      const cardName = match[2]
      const cardData = cardDataMap.get(cardName)
      
      cards.push({
        quantity: match[1],
        name: cardName,
        manaCost: cardData?.manaCost || '',
        imageUrl: cardData?.imageUrl || ''
      })
    }
  }

  return cards
}
