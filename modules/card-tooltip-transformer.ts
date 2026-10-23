// ./modules/card-tooltip-transformer.ts
import { defineNuxtModule } from '@nuxt/kit'
import type BetterSqlite3 from 'better-sqlite3'
import {
  createRegExp,
  exactly,
  oneOrMore,
  charNotIn,
  maybe,
  whitespace,
  global
} from 'magic-regexp'

import { buildLog, extractImageUrl, extractBackImageUrl } from '#shared/utils'
import {
  openCardDatabase,
  findDatabaseImages,
  fetchScryfallCard,
  type CardImages
} from './utils/card-images'
import { onContentFileBeforeParse } from './utils/content-hook'
import { getFencedRanges, isInsideFence } from './utils/fence'

const SCRYFALL_API_BASE = 'https://api.scryfall.com'

export default defineNuxtModule({
  meta: {
    name: 'card-tooltip-transformer'
  },
  async setup(_options, nuxt) {
    buildLog('🚀 [Card Tooltip Transformer] MODULE LOADED!')

    // Initialize database connection at build time
    const db = await openCardDatabase()

    // Hook into content:file:beforeParse to transform markdown before parsing
    onContentFileBeforeParse(nuxt, async (ctx) => {
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

async function getCardImages(
  db: BetterSqlite3.Database | null,
  cardName: string,
  set?: string
): Promise<CardImages> {
  // The local DB is built from Scryfall's "oracle_cards" bulk file, which only ever
  // stores one representative printing per card (no set column) — it can't answer a
  // set-specific request, so skip it and go straight to Scryfall when a set is given.
  if (!set) {
    const fromDatabase = findDatabaseImages(db, cardName)
    if (fromDatabase) return fromDatabase
  }

  // Fallback to Scryfall API. A set was requested, or the card isn't in the local
  // (Pauper-only) database — fetch the full card object so double-faced cards can
  // also resolve a back-face image, not just the lazy front-face redirect URL.
  const setParam = set ? `&set=${encodeURIComponent(set)}` : ''
  const card = await fetchScryfallCard(
    `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(cardName)}${setParam}`
  )
  if (card) {
    const front = extractImageUrl(card)
      || `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(cardName)}${setParam}&format=image`
    const back = extractBackImageUrl(card)

    // If the reference names the card's *back* face directly (e.g.
    // [[Insectile Aberration]] for Delver of Secrets), show that face
    // first — the flip control then reveals the front face instead.
    const backFaceName = card.card_faces?.[1]?.name
    const requestedIsBackFace = !!back && !!backFaceName
      && backFaceName.toLowerCase() === cardName.toLowerCase()

    return requestedIsBackFace
      ? { image: back, backImage: front }
      : { image: front, backImage: back }
  }

  // Last resort: the lazy image redirect endpoint, without back-face support.
  return {
    image: `${SCRYFALL_API_BASE}/cards/named?exact=${encodeURIComponent(cardName)}${setParam}&format=image`,
    backImage: null
  }
}

async function transformCardTooltips(
  content: string,
  filePath: string,
  db: BetterSqlite3.Database | null
): Promise<string> {
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
    const { image: imageUrl, backImage: backImageUrl }
      = await getCardImages(db, cleanName, cleanSet)

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
    const setAttr = t.set ? ` set="${t.set}"` : ''
    const imageAttr = t.imageUrl ? ` image="${t.imageUrl}"` : ''
    const backImageAttr = t.backImageUrl ? ` backImage="${t.backImageUrl}"` : ''
    buildLog(
      `         └─ Component: :MagicCardTooltip{name="${t.cardName}"${setAttr}${imageAttr}${backImageAttr}}`
    )
  })

  buildLog(`   ✅ Card tooltips transformed successfully\n`)
}
