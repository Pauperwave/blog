// ./modules/card-tooltip-transformer.ts
import { defineNuxtModule } from '@nuxt/kit'
import type { FileBeforeParseHook } from '@nuxt/content'
import { createRegExp, exactly, oneOrMore, charNotIn, maybe, whitespace, global } from 'magic-regexp'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'

// import { buildLog } from '#shared/utils/build-log'

const SCRYFALL_API_BASE = 'https://api.scryfall.com'

export default defineNuxtModule({
  meta: {
    name: 'card-tooltip-transformer'
  },
  async setup(_options, nuxt) {
    console.log('🚀 [Card Tooltip Transformer] MODULE LOADED!')

    // Initialize database connection at build time
    const dbPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'server', 'database', 'cards.db')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic import requires any type
    let db: any = null

    if (existsSync(dbPath)) {
      try {
        // Try bun:sqlite first (Bun runtime)
        if (typeof Bun !== 'undefined') {
          const { Database } = await import('bun:sqlite')
          db = new Database(dbPath, { readonly: true })
          console.log(`✅ [Card Tooltip Transformer] Database loaded (bun:sqlite): ${dbPath}`)
        } else {
          // Fall back to better-sqlite3 (Node.js runtime)
          const Database = (await import('better-sqlite3')).default
          db = new Database(dbPath, { readonly: true })
          console.log(`✅ [Card Tooltip Transformer] Database loaded (better-sqlite3): ${dbPath}`)
        }
      } catch (error) {
        console.log(`⚠️  [Card Tooltip Transformer] Failed to load database: ${error}`)
      }
    } else {
      console.log(`⚠️  [Card Tooltip Transformer] Database not found at: ${dbPath}`)
    }

    const hookContentBeforeParse = nuxt.hook as unknown as (
      name: 'content:file:beforeParse',
      handler: (ctx: FileBeforeParseHook) => void | Promise<void>
    ) => void

    // Hook into content:file:beforeParse to transform markdown before parsing
    hookContentBeforeParse('content:file:beforeParse', async (ctx: FileBeforeParseHook) => {
      const file = ctx.file || ctx

      const forbiddenFolders = [
        'docs',
      ]

      if (file.extension === '.md' && !forbiddenFolders.some(folder => file.path?.includes(folder))) {
        if (!file.body.includes('[[')) return  // early exit, no [[...]] present
        file.body = await transformCardTooltips(file.body, file.path, db)
      }
    })

    // Close database when module setup is complete
    nuxt.hook('build:done', () => {
      if (db) {
        db.close()
        console.log('🔒 [Card Tooltip Transformer] Database connection closed')
      }
    })
  }
})

interface CardTransformation {
  original: string
  cardName: string
  set?: string
  imageUrl?: string
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic import requires any type
async function getCardImageUrl(db: any, cardName: string): Promise<string | null> {
  // Try database first
  if (db) {
    try {
      const row = db.prepare(`
        SELECT image_url FROM cards WHERE name = ? LIMIT 1
      `).get(cardName) as { image_url: string } | undefined

      if (row?.image_url) return row.image_url
    } catch (error) {
      console.log(`⚠️  [Card Tooltip Transformer] Failed to query database for "${cardName}": ${error}`)
    }
  }

  // Fallback to Scryfall API
  try {
    const url = `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(cardName)}&format=image`
    console.log(`🌐 [Card Tooltip Transformer] Fetching from Scryfall: ${cardName}`)
    return url
  } catch (error) {
    console.log(`⚠️  [Card Tooltip Transformer] Failed to fetch from Scryfall for "${cardName}": ${error}`)
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic import requires any type
async function transformCardTooltips(content: string, filePath: string, db: any): Promise<string> {
  const transformations: CardTransformation[] = []
  const replacements: Array<{ match: string, replacement: string }> = []

  // First, collect all matches with set codes
  let match
  const regexWithSet = new RegExp(patternWithSet)
  while ((match = regexWithSet.exec(content)) !== null) {
    if (!match[1] || !match[2]) continue

    const cleanName = match[1].trim()
    const cleanSet = match[2].trim()
    const imageUrl = await getCardImageUrl(db, cleanName)

    transformations.push({
      original: match[0],
      cardName: cleanName,
      set: cleanSet,
      imageUrl: imageUrl || undefined
    })

    if (imageUrl) {
      replacements.push({
        match: match[0],
        replacement: `:MagicCardTooltip{name="${cleanName}" set="${cleanSet}" image="${imageUrl}"}`
      })
    } else {
      replacements.push({
        match: match[0],
        replacement: `:MagicCardTooltip{name="${cleanName}" set="${cleanSet}"}`
      })
    }
  }

  // Then, collect all simple card name matches
  const regexSimple = new RegExp(patternSimple)
  while ((match = regexSimple.exec(content)) !== null) {
    if (!match[1]) continue

    const cleanName = match[1].trim()
    const imageUrl = await getCardImageUrl(db, cleanName)

    transformations.push({
      original: match[0],
      cardName: cleanName,
      imageUrl: imageUrl || undefined
    })

    if (imageUrl) {
      replacements.push({
        match: match[0],
        replacement: `:MagicCardTooltip{name="${cleanName}" image="${imageUrl}"}`
      })
    } else {
      replacements.push({
        match: match[0],
        replacement: `:MagicCardTooltip{name="${cleanName}"}`
      })
    }
  }

  // Apply all replacements
  for (const { match, replacement } of replacements) {
    content = content.replace(match, replacement)
  }

  logTransformations(transformations, filePath)

  return content
}

function logTransformations(
  transformations: CardTransformation[],
  filePath: string
): void {
  if (transformations.length === 0) return

  console.log(`\n📝 [Card Tooltip Transformer] Processing file: ${filePath}`)
  console.log(`   └─ Found ${transformations.length} card tooltip(s)`)
  console.log(`\n   🃏 Transformed Card Tooltips:`)

  transformations.forEach((t, idx) => {
    console.log(`      ${idx + 1}. ${t.original}`)
    console.log(`         └─ Card: "${t.cardName}"${t.set ? ` (Set: ${t.set})` : ''}`)
    console.log(`         └─ Image URL: ${t.imageUrl || 'Not found in database'}`)
    console.log(`         └─ Component: :MagicCardTooltip{name="${t.cardName}"${t.set ? ` set="${t.set}"` : ''}${t.imageUrl ? ` image="${t.imageUrl}"` : ''}}`)
  })

  console.log(`   ✅ Card tooltips transformed successfully\n`)
}
