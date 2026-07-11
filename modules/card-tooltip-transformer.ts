// ./modules/card-tooltip-transformer.ts
import { defineNuxtModule } from '@nuxt/kit'
import type { FileBeforeParseHook } from '@nuxt/content'
import { createRegExp, exactly, oneOrMore, charNotIn, maybe, whitespace, global } from 'magic-regexp'
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'

import { buildLog, extractImageUrl, extractBackImageUrl } from '#shared/utils'
import type { ScryfallCard } from '#shared/types'

const SCRYFALL_API_BASE = 'https://api.scryfall.com'

export default defineNuxtModule({
  meta: {
    name: 'card-tooltip-transformer'
  },
  async setup(_options, nuxt) {
    buildLog('🚀 [Card Tooltip Transformer] MODULE LOADED!')

    // Initialize database connection at build time
    const dbPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'server', 'database', 'cards.db')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic import requires any type
    let db: any = null

    if (existsSync(dbPath)) {
      try {
        const Database = (await import('better-sqlite3')).default
        db = new Database(dbPath, { readonly: true })
        buildLog(`✅ [Card Tooltip Transformer] Database loaded (better-sqlite3): ${dbPath}`)
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
    hookContentBeforeParse('content:file:beforeParse', async (ctx: FileBeforeParseHook) => {
      const file = ctx.file || ctx

      if (file.extension === '.md') {
        if (!file.body.includes('[[')) return  // early exit, no [[...]] present
        file.body = await transformCardTooltips(file.body, file.path, db)
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
  backImageUrl?: string
}

interface CardImages {
  image: string | null
  backImage: string | null
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

/**
 * Character ranges of fenced code blocks (``` or ~~~, any length ≥ 3, including
 * nested fences opened by a longer run of the same character per CommonMark).
 * `[[Card Name]]` occurrences inside these ranges are illustrative "raw syntax"
 * examples (e.g. in docs) and must not be transformed.
 */
export function getFencedRanges(content: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  const lines = content.split('\n')

  let fenceChar: string | null = null
  let fenceLen = 0
  let fenceStart = -1
  let offset = 0

  for (const line of lines) {
    const trimmed = line.trim()

    if (fenceChar === null) {
      const openMatch = trimmed.match(/^(`{3,}|~{3,})/)
      if (openMatch) {
        fenceChar = openMatch[1]![0]!
        fenceLen = openMatch[1]!.length
        fenceStart = offset
      }
    } else {
      const closeRegex = new RegExp(`^\\${fenceChar}{${fenceLen},}\\s*$`)
      if (closeRegex.test(trimmed)) {
        ranges.push([fenceStart, offset + line.length])
        fenceChar = null
        fenceLen = 0
        fenceStart = -1
      }
    }

    offset += line.length + 1 // +1 for the '\n' stripped by split()
  }

  // Unclosed fence (malformed markdown) — protect through end of file rather than
  // treat the rest of the document as live content.
  if (fenceChar !== null) ranges.push([fenceStart, content.length])

  return ranges
}

export function isInsideFence(index: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([start, end]) => index >= start && index < end)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic import requires any type
async function getCardImages(db: any, cardName: string, set?: string): Promise<CardImages> {
  // The local DB is built from Scryfall's "oracle_cards" bulk file, which only ever
  // stores one representative printing per card (no set column) — it can't answer a
  // set-specific request, so skip it and go straight to Scryfall when a set is given.
  if (!set && db) {
    try {
      const row = db.prepare(`
        SELECT image_url, back_image_url FROM cards WHERE name = ? LIMIT 1
      `).get(cardName) as { image_url: string, back_image_url: string | null } | undefined

      if (row?.image_url) {
        return { image: row.image_url, backImage: row.back_image_url || null }
      }
    } catch (error) {
      buildLog(`⚠️  [Card Tooltip Transformer] Failed to query database for "${cardName}": ${error}`)
    }
  }

  // Fallback to Scryfall API. A set was requested, or the card isn't in the local
  // (Pauper-only) database — fetch the full card object so double-faced cards can
  // also resolve a back-face image, not just the lazy front-face redirect URL.
  try {
    const setParam = set ? `&set=${encodeURIComponent(set)}` : ''
    const lookupUrl = `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(cardName)}${setParam}`
    buildLog(`🌐 [Card Tooltip Transformer] Fetching from Scryfall: ${cardName}${set ? ` (${set})` : ''}`)

    // Scryfall rejects requests without an identifying User-Agent (returns 400) —
    // Node's built-in fetch doesn't set one by default, unlike curl/browsers.
    const response = await fetch(lookupUrl, {
      headers: {
        'User-Agent': 'PauperwaveBlog/1.0 (+https://blog.pauperwave.org)',
        'Accept': 'application/json'
      }
    })
    if (response.ok) {
      const card = await response.json() as ScryfallCard
      const image = extractImageUrl(card) || `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(cardName)}${setParam}&format=image`
      return { image, backImage: extractBackImageUrl(card) }
    }

    buildLog(`⚠️  [Card Tooltip Transformer] Scryfall lookup failed for "${cardName}" (${response.status})`)
  } catch (error) {
    buildLog(`⚠️  [Card Tooltip Transformer] Failed to fetch from Scryfall for "${cardName}": ${error}`)
  }

  // Last resort: the lazy image redirect endpoint, without back-face support.
  const setParam = set ? `&set=${encodeURIComponent(set)}` : ''
  return {
    image: `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(cardName)}${setParam}&format=image`,
    backImage: null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic import requires any type
async function transformCardTooltips(content: string, filePath: string, db: any): Promise<string> {
  const transformations: CardTransformation[] = []
  const replacements: Array<{ start: number, end: number, text: string }> = []
  const fencedRanges = getFencedRanges(content)

  // First, collect all matches with set codes
  let match
  const regexWithSet = new RegExp(patternWithSet)
  while ((match = regexWithSet.exec(content)) !== null) {
    if (!match[1] || !match[2]) continue
    if (isInsideFence(match.index, fencedRanges)) continue

    const cleanName = match[1].trim()
    const cleanSet = match[2].trim()
    const { image: imageUrl, backImage: backImageUrl } = await getCardImages(db, cleanName, cleanSet)

    transformations.push({
      original: match[0],
      cardName: cleanName,
      set: cleanSet,
      imageUrl: imageUrl || undefined,
      backImageUrl: backImageUrl || undefined
    })

    const backImageAttr = backImageUrl ? ` backImage="${backImageUrl}"` : ''
    const text = imageUrl
      ? `:MagicCardTooltip{name="${cleanName}" set="${cleanSet}" image="${imageUrl}"${backImageAttr}}`
      : `:MagicCardTooltip{name="${cleanName}" set="${cleanSet}"}`

    replacements.push({ start: match.index, end: match.index + match[0].length, text })
  }

  // Then, collect all simple card name matches. patternSimple also over-matches
  // "[[Name | Set]]" (it allows '|' in the name), so skip anything already claimed
  // by the with-set pass above.
  const regexSimple = new RegExp(patternSimple)
  while ((match = regexSimple.exec(content)) !== null) {
    if (!match[1]) continue
    if (isInsideFence(match.index, fencedRanges)) continue

    const matchEnd = match.index + match[0].length
    if (replacements.some(r => match!.index < r.end && matchEnd > r.start)) continue

    const cleanName = match[1].trim()
    const { image: imageUrl, backImage: backImageUrl } = await getCardImages(db, cleanName)

    transformations.push({
      original: match[0],
      cardName: cleanName,
      imageUrl: imageUrl || undefined,
      backImageUrl: backImageUrl || undefined
    })

    const backImageAttr = backImageUrl ? ` backImage="${backImageUrl}"` : ''
    const text = imageUrl
      ? `:MagicCardTooltip{name="${cleanName}" image="${imageUrl}"${backImageAttr}}`
      : `:MagicCardTooltip{name="${cleanName}"}`

    replacements.push({ start: match.index, end: matchEnd, text })
  }

  // Apply back-to-front by start offset so earlier indices stay valid as we splice.
  replacements.sort((a, b) => b.start - a.start)
  for (const { start, end, text } of replacements) {
    content = content.slice(0, start) + text + content.slice(end)
  }

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
    if (t.backImageUrl) buildLog(`         └─ Back Image URL: ${t.backImageUrl}`)
    buildLog(`         └─ Component: :MagicCardTooltip{name="${t.cardName}"${t.set ? ` set="${t.set}"` : ''}${t.imageUrl ? ` image="${t.imageUrl}"` : ''}${t.backImageUrl ? ` backImage="${t.backImageUrl}"` : ''}}`)
  })

  buildLog(`   ✅ Card tooltips transformed successfully\n`)
}
