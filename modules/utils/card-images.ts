import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import type BetterSqlite3 from 'better-sqlite3'

import {
  buildLog,
  buildScryfallCardUrl,
  extractImageUrl,
  parseCardString
} from '#shared/utils'
import type { ScryfallCard } from '#shared/types'

export interface CardImages {
  image: string | null
  backImage: string | null
}

const DB_PATH = join(
  dirname(fileURLToPath(import.meta.url)), '..', '..', 'server', 'database', 'cards.db'
)

// Scryfall rejects requests without an identifying User-Agent (returns 400) —
// Node's built-in fetch doesn't set one by default, unlike curl/browsers.
const SCRYFALL_HEADERS = {
  'User-Agent': 'PauperwaveBlog/1.0 (+https://blog.pauperwave.org)',
  'Accept': 'application/json'
}

// /cards/named is rate limited to 2 requests per second
const REQUEST_DELAY_MS = 500
const MAX_ATTEMPTS = 3

export async function openCardDatabase(): Promise<BetterSqlite3.Database | null> {
  if (!existsSync(DB_PATH)) {
    buildLog(`⚠️  [Card Images] Database not found at: ${DB_PATH}`)
    return null
  }

  try {
    const Database = (await import('better-sqlite3')).default
    const db = new Database(DB_PATH, { readonly: true })
    buildLog(`✅ [Card Images] Database loaded (better-sqlite3): ${DB_PATH}`)
    return db
  } catch (error) {
    buildLog(`⚠️  [Card Images] Failed to load database: ${error}`)
    return null
  }
}

/** The images of a card by exact name, from the local (Pauper-only) database */
export function findDatabaseImages(
  db: BetterSqlite3.Database | null,
  cardName: string
): CardImages | null {
  if (!db) return null

  try {
    const row = db.prepare(`
      SELECT image_url, back_image_url FROM cards WHERE name = ? LIMIT 1
    `).get(cardName) as { image_url: string, back_image_url: string | null } | undefined

    if (row?.image_url) {
      return { image: row.image_url, backImage: row.back_image_url || null }
    }
  } catch (error) {
    buildLog(`⚠️  [Card Images] Failed to query database for "${cardName}": ${error}`)
  }

  return null
}

const cardCache = new Map<string, Promise<ScryfallCard | null>>()
let requestQueue: Promise<unknown> = Promise.resolve()

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Runs requests one at a time, REQUEST_DELAY_MS apart, whoever asks and whenever */
function enqueue<T>(request: () => Promise<T>): Promise<T> {
  const result = requestQueue.then(request)
  requestQueue = result.then(() => wait(REQUEST_DELAY_MS), () => wait(REQUEST_DELAY_MS))
  return result
}

async function requestCard(url: string, attempt = 1): Promise<ScryfallCard | null> {
  buildLog(`🌐 [Card Images] Fetching from Scryfall: ${url}`)
  try {
    const response = await fetch(url, { headers: SCRYFALL_HEADERS })
    if (response.ok) return await response.json() as ScryfallCard

    if (response.status === 429 && attempt < MAX_ATTEMPTS) {
      const retryAfterSeconds = Number(response.headers.get('Retry-After')) || 1
      buildLog(`⏳ [Card Images] Rate limited, retrying in ${retryAfterSeconds}s: ${url}`)
      await wait(retryAfterSeconds * 1000)
      return requestCard(url, attempt + 1)
    }

    console.warn(`⚠️  [Card Images] Scryfall lookup failed (${response.status}): ${url}`)
  } catch (error) {
    console.warn(`⚠️  [Card Images] Failed to fetch from Scryfall: ${url}: ${error}`)
  }
  return null
}

/** A card object from the Scryfall API, or null; each URL is requested once per build */
export function fetchScryfallCard(url: string): Promise<ScryfallCard | null> {
  let card = cardCache.get(url)
  if (!card) {
    card = enqueue(() => requestCard(url))
    cardCache.set(url, card)
  }
  return card
}

/**
 * The grid image URL for a card string ("Name", "Name (SET)" or "Name (SET) 123").
 * A set-specific request can't be answered by the local database (it stores one
 * representative printing per card, no set column), so it goes to Scryfall.
 */
export async function resolveCardImage(
  db: BetterSqlite3.Database | null,
  cardString: string
): Promise<string | null> {
  const parsed = parseCardString(cardString)

  if (!parsed.set) {
    const fromDatabase = findDatabaseImages(db, parsed.name)
    if (fromDatabase?.image) return fromDatabase.image
  }

  return extractImageUrl(await fetchScryfallCard(buildScryfallCardUrl(parsed)))
}
