// ./modules/card-tooltip-transformer.ts
import { existsSync } from 'fs'
import { join } from 'path'
import { defineNuxtModule } from '@nuxt/kit'
import type { FileBeforeParseHook } from '@nuxt/content'
import { createRegExp, exactly, oneOrMore, charNotIn, maybe, whitespace, global } from 'magic-regexp'
import { getCardsByNames, type CardData } from '../server/utils/card-database'
import { buildLog } from '../shared/utils/build-log'

export default defineNuxtModule({
  meta: {
    name: 'card-tooltip-transformer'
  },
  setup(_options, nuxt) {
    buildLog('🚀 [Card Tooltip Transformer] MODULE LOADED!')

    const hookContentBeforeParse = nuxt.hook as unknown as (
      name: 'content:file:beforeParse',
      handler: (ctx: FileBeforeParseHook) => void | Promise<void>
    ) => void

    // Hook into content:file:beforeParse to transform markdown before parsing
    hookContentBeforeParse('content:file:beforeParse', async (ctx: FileBeforeParseHook) => {
      const file = ctx.file || ctx

      const allowedFolders = [
        'articles',
        'decklists',
        'reports',
        // 'spoilers',
        'tutorials',
        // 'docs',
      ]

      if (file.extension === '.md' && allowedFolders.some(folder => file.path?.includes(folder))) {
        file.body = await transformCardTooltips(file.body, file.path)
      }
    })
  }
})

interface CardTransformation {
  original: string
  cardName: string
  set?: string
  hasImageFromDb: boolean
}

// Pattern for [[cardName | set]] (with pipe separator)
const patternWithSet = createRegExp(
  exactly('[['),
  oneOrMore(charNotIn('|]')).groupedAs('name'),
  maybe(whitespace),
  exactly('|'),
  maybe(whitespace),
  oneOrMore(charNotIn(']')).groupedAs('set'),
  exactly(']]'),
  [global]
)

// Pattern for [[cardName]] (no set specified)
const patternSimple = createRegExp(
  exactly('[['),
  oneOrMore(charNotIn(']')).groupedAs('name'),
  exactly(']]'),
  [global]
)

async function transformCardTooltips(content: string, filePath: string): Promise<string> {
  const transformations: CardTransformation[] = []
  const cardNames = extractCardNames(content)
  let cardDataMap = new Map<string, CardData>()

  if (cardNames.size > 0) {
    const dbPath = join(process.cwd(), 'server', 'database', 'cards.db')
    const dbExists = existsSync(dbPath)

    if (dbExists) {
      cardDataMap = await getCardsByNames(Array.from(cardNames))
    } else {
      buildLog('   ⚠️  Card tooltip transformer: database not found, using Scryfall fallback')
    }
  }
  
  // First, replace cards with set codes
  content = content.replace(patternWithSet, (match: string, name: string, set: string) => {
    const cleanName = name.trim()
    const cleanSet = set.trim()
    
    transformations.push({
      original: match,
      cardName: cleanName,
      set: cleanSet,
      hasImageFromDb: false
    })
    
    return `:MagicCardTooltip{name="${cleanName}" set="${cleanSet}"}`
  })
  
  // Then, replace simple card names
  content = content.replace(patternSimple, (match: string, name: string) => {
    const cleanName = name.trim()
    const cardData = cardDataMap.get(cleanName)
    const imageProp = cardData?.imageUrl ? ` image="${cardData.imageUrl}"` : ''
    
    transformations.push({
      original: match,
      cardName: cleanName,
      hasImageFromDb: Boolean(cardData?.imageUrl)
    })
    
    return `:MagicCardTooltip{name="${cleanName}"${imageProp}}`
  })
  
  logTransformations(transformations, filePath, cardNames.size, cardDataMap.size)
  
  return content
}

function extractCardNames(content: string): Set<string> {
  const names = new Set<string>()

  const withSetMatches = content.matchAll(patternWithSet)
  for (const match of withSetMatches) {
    const name = match[1]?.trim()
    if (name) names.add(name)
  }

  const simpleMatches = content.matchAll(patternSimple)
  for (const match of simpleMatches) {
    const name = match[1]?.trim()
    if (!name || name.includes('|')) continue
    names.add(name)
  }

  return names
}

function logTransformations(
  transformations: CardTransformation[],
  filePath: string,
  lookedUpCardsCount: number,
  foundCardsCount: number
): void {
  if (transformations.length === 0) return

  buildLog(`\n📝 [Card Tooltip Transformer] Processing file: ${filePath}`)
  buildLog(`   └─ Found ${transformations.length} card tooltip(s)`)
  if (lookedUpCardsCount > 0) {
    buildLog(`   └─ DB images loaded: ${foundCardsCount}/${lookedUpCardsCount}`)
  }
  buildLog(`\n   🃏 Transformed Card Tooltips:`)
  
  transformations.forEach((t, idx) => {
    buildLog(`      ${idx + 1}. ${t.original}`)
    buildLog(`         └─ Card: "${t.cardName}"${t.set ? ` (Set: ${t.set})` : ''}`)
    buildLog(`         └─ Image from DB: ${t.hasImageFromDb ? '✅' : '❌'}`)
    buildLog(`         └─ Component: :MagicCardTooltip{name="${t.cardName}"${t.set ? ` set="${t.set}"` : ''}${t.hasImageFromDb ? ' image="..."' : ''}}`)
  })
  
  buildLog(`   ✅ Card tooltips transformed successfully\n`)
}
