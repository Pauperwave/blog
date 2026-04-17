// ./modules/card-tooltip-transformer.ts
import { defineNuxtModule } from '@nuxt/kit'
import type { FileBeforeParseHook } from '@nuxt/content'
import { createRegExp, exactly, oneOrMore, charNotIn, maybe, whitespace, global } from 'magic-regexp'
import { Database } from 'bun:sqlite'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'

import { buildLog } from '#shared/utils/build-log'

export default defineNuxtModule({
  meta: {
    name: 'card-tooltip-transformer'
  },
  setup(_options, nuxt) {
    buildLog('🚀 [Card Tooltip Transformer] MODULE LOADED!')

    // Initialize database connection at build time
    const dbPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'server', 'database', 'cards.db')
    let db: Database | null = null

    if (existsSync(dbPath)) {
      try {
        db = new Database(dbPath, { readonly: true })
        buildLog(`✅ [Card Tooltip Transformer] Database loaded: ${dbPath}`)
      } catch (error) {
        buildLog(`⚠️  [Card Tooltip Transformer] Failed to load database: ${error}`)
      }
    } else {
      buildLog(`⚠️  [Card Tooltip Transformer] Database not found at: ${dbPath}`)
    }

    const hookContentBeforeParse = nuxt.hook as unknown as (
      name: 'content:file:beforeParse',
      handler: (ctx: FileBeforeParseHook) => void | Promise<void>
    ) => void

    // Hook into content:file:beforeParse to transform markdown before parsing
    hookContentBeforeParse('content:file:beforeParse', (ctx: FileBeforeParseHook) => {
      const file = ctx.file || ctx

      const forbiddenFolders = [
        'docs',
      ]

      if (file.extension === '.md' && !forbiddenFolders.some(folder => file.path?.includes(folder))) {
        if (!file.body.includes('[[')) return  // early exit, no [[...]] present
        file.body = transformCardTooltips(file.body, file.path, db)
      }
    })

    // Close database when module setup is complete
    nuxt.hook('build:done', () => {
      if (db) {
        db.close()
        buildLog('🔒 [Card Tooltip Transformer] Database connection closed')
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

function getCardImageUrl(db: Database | null, cardName: string): string | null {
  if (!db) return null

  try {
    const row = db.prepare(`
      SELECT image_url FROM cards WHERE name = ? LIMIT 1
    `).get(cardName) as { image_url: string } | undefined

    return row?.image_url || null
  } catch (error) {
    buildLog(`⚠️  [Card Tooltip Transformer] Failed to query database for "${cardName}": ${error}`)
    return null
  }
}

function transformCardTooltips(content: string, filePath: string, db: Database | null): string {
  const transformations: CardTransformation[] = []

  // First, replace cards with set codes
  content = content.replace(patternWithSet, (match: string, name: string, set: string) => {
    const cleanName = name.trim()
    const cleanSet = set.trim()
    const imageUrl = getCardImageUrl(db, cleanName)

    transformations.push({
      original: match,
      cardName: cleanName,
      set: cleanSet,
      imageUrl: imageUrl || undefined
    })

    if (imageUrl) {
      return `:MagicCardTooltip{name="${cleanName}" set="${cleanSet}" image="${imageUrl}"}`
    }
    return `:MagicCardTooltip{name="${cleanName}" set="${cleanSet}"}`
  })

  // Then, replace simple card names
  content = content.replace(patternSimple, (match: string, name: string) => {
    const cleanName = name.trim()
    const imageUrl = getCardImageUrl(db, cleanName)

    transformations.push({
      original: match,
      cardName: cleanName,
      imageUrl: imageUrl || undefined
    })

    if (imageUrl) {
      return `:MagicCardTooltip{name="${cleanName}" image="${imageUrl}"}`
    }
    return `:MagicCardTooltip{name="${cleanName}"}`
  })

  logTransformations(transformations, filePath)

  return content
}

function logTransformations(
  transformations: CardTransformation[],
  filePath: string
): void {
  if (transformations.length === 0) return

  buildLog(`\n📝 [Card Tooltip Transformer] Processing file: ${filePath}`)
  buildLog(`   └─ Found ${transformations.length} card tooltip(s)`)
  buildLog(`\n   🃏 Transformed Card Tooltips:`)

  transformations.forEach((t, idx) => {
    buildLog(`      ${idx + 1}. ${t.original}`)
    buildLog(`         └─ Card: "${t.cardName}"${t.set ? ` (Set: ${t.set})` : ''}`)
    buildLog(`         └─ Image URL: ${t.imageUrl || 'Not found in database'}`)
    buildLog(`         └─ Component: :MagicCardTooltip{name="${t.cardName}"${t.set ? ` set="${t.set}"` : ''}${t.imageUrl ? ` image="${t.imageUrl}"` : ''}}`)
  })

  buildLog(`   ✅ Card tooltips transformed successfully\n`)
}
