/**
 * Downloads Scryfall bulk data and creates a local SQLite database
 * of Pauper-legal cards for fast lookups.
 *
 * Run with: bun run scripts/download-bulk-data.ts
 */

import { createWriteStream, existsSync, mkdirSync, statSync } from 'fs'
import { pipeline } from 'stream/promises'
import { Database } from 'bun:sqlite'
import { readFile } from 'fs/promises'

const BULK_DATA_API = 'https://api.scryfall.com/bulk-data'
const DB_PATH = './server/database/cards.db'
const TEMP_FILE = './server/database/oracle-cards.json'

interface BulkDataInfo {
  object: string
  type: string
  download_uri: string
  updated_at: string
  size: number
}

interface ScryfallCard {
  id: string
  name: string
  mana_cost?: string
  type_line: string
  oracle_text?: string
  colors: string[]
  color_identity: string[]
  legalities: {
    pauper?: string
  }
  image_uris?: {
    small: string
    normal: string
    large: string
    png: string
    art_crop: string
    border_crop: string
  }
  card_faces?: Array<{
    name?: string
    mana_cost?: string
    image_uris?: {
      small: string
      normal: string
      large: string
      png: string
      art_crop: string
      border_crop: string
    }
  }>
  rarity: string
  set: string
  collector_number: string
  prices: {
    usd?: string
    eur?: string
  }
}

interface Card {
  name: string
  manaCost: string
  imageUrl: string
  backImageUrl: string
}

async function fetchBulkDataInfo(): Promise<BulkDataInfo> {
  console.log('📡 Fetching bulk data information...')
  const response = await fetch(BULK_DATA_API)
  const data = await response.json()

  // Find the Oracle Cards bulk data
  const oracleCards = data.data.find((item: BulkDataInfo) => item.type === 'oracle_cards')

  if (!oracleCards) {
    throw new Error('Oracle Cards bulk data not found')
  }

  console.log(`✅ Found bulk data (${(oracleCards.size / 1024 / 1024).toFixed(2)} MB)`)
  console.log(`📅 Last updated: ${oracleCards.updated_at}`)

  return oracleCards
}

async function downloadBulkData(downloadUri: string): Promise<void> {
  console.log('⬇️  Downloading bulk data...')

  // Ensure directory exists
  if (!existsSync('./server/database')) {
    mkdirSync('./server/database', { recursive: true })
  }

  const response = await fetch(downloadUri)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download: ${response.statusText}`)
  }

  // Download and decompress
  const fileStream = createWriteStream(TEMP_FILE)
  await pipeline(
    /* eslint-disable @typescript-eslint/no-explicit-any */
    response.body as any,
    fileStream
  )

  console.log('✅ Download complete')
}

async function createDatabase(): Promise<Database> {
  console.log('🗄️  Creating SQLite database...')

  const db = new Database(DB_PATH, { create: true })

  // Create cards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      name TEXT PRIMARY KEY,
      mana_cost TEXT,
      image_url TEXT,
      indexed_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_name ON cards(name);
  `)

  // Migrate existing databases created before back-face support was added
  const existingColumns = db.query('PRAGMA table_info(cards)').all() as Array<{ name: string }>
  if (!existingColumns.some(col => col.name === 'back_image_url')) {
    db.exec('ALTER TABLE cards ADD COLUMN back_image_url TEXT;')
  }

  // Remove legacy table no longer used (we render mana symbols with CSS).
  db.exec('DROP TABLE IF EXISTS mana_symbols;')

  // Create metadata table
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `)

  console.log('✅ Database schema created')

  return db
}

async function importPauperCards(db: Database): Promise<void> {
  console.log('📖 Reading and filtering cards...')

  const fileContent = await readFile(TEMP_FILE, 'utf-8')
  const allCards: ScryfallCard[] = JSON.parse(fileContent)

  // Filter Pauper-legal and Banned cards
  const pauperCards = allCards.filter(card =>
    card.legalities.pauper === 'legal' || card.legalities.pauper === 'banned'
  )

  console.log(`✅ Found ${pauperCards.length} Pauper-legal + Banned cards out of ${allCards.length} total`)

  // Full resync from a fresh bulk snapshot each run — clear out cards from previous
  // runs that no longer appear (renamed/reprinted under a different name upstream,
  // rotated out of the filter, etc.), otherwise stale rows accumulate indefinitely.
  db.exec('DELETE FROM cards;')

  // Prepare insert statement
  const insert = db.prepare(`
    INSERT OR REPLACE INTO cards (name, mana_cost, image_url, back_image_url)
    VALUES (?, ?, ?, ?)
  `)

  // Transform and insert cards. Double-faced cards are looked up two different ways
  // elsewhere in the codebase: inline `[[Card Name]]` references use the front face
  // alone (e.g. "Delver of Secrets"), while decklists paste the full compound name as
  // exported by MTGO/Scryfall (e.g. "Delver of Secrets // Insectile Aberration"). Both
  // need to resolve, so these cards are inserted under both names.
  const cardsToInsert: Card[] = pauperCards.flatMap(card => {
    let manaCost: string
    let imageUrl: string
    let backImageUrl = ''
    let frontFaceName: string | undefined

    // Priority 1: Top-level image_uris (normal, adventure, split, flip, etc.)
    if (card.image_uris) {
      manaCost = card.mana_cost || ''
      imageUrl = card.image_uris.normal || card.image_uris.large || ''
    }
    // Priority 2: card_faces with images (transform, modal_dfc, reversible_card)
    else if (card.card_faces && card.card_faces.length > 0 && card.card_faces[0].image_uris) {
      manaCost = card.card_faces[0].mana_cost || card.mana_cost || ''
      imageUrl = card.card_faces[0].image_uris.normal ||
        card.card_faces[0].image_uris.large || ''

      if (card.card_faces[0].name && card.card_faces[0].name !== card.name) {
        frontFaceName = card.card_faces[0].name
      }

      // Second face's own image (transform/modal_dfc cards flip to a distinct back face;
      // reversible_card's "back" is just an alternate art of the same front, still useful)
      const backFace = card.card_faces[1]
      if (backFace?.image_uris) {
        backImageUrl = backFace.image_uris.normal || backFace.image_uris.large || ''
      }
    }
    // Fallback: no images found
    else {
      manaCost = card.mana_cost || ''
      imageUrl = ''
    }

    // Handle split cards: combine mana costs from both faces
    // For split cards, card_faces exists but image_uris is at top level
    if (card.card_faces && card.card_faces.length > 1 && !card.card_faces[0].image_uris) {
      const faceCosts = card.card_faces
        .map(face => face.mana_cost)
        .filter(cost => cost && cost.trim() !== '')

      if (faceCosts.length > 1) {
        // Multiple faces with costs - combine with // separator
        manaCost = faceCosts.join(' // ')
      } else if (faceCosts.length === 1) {
        manaCost = faceCosts[0] || ''
      } else {
        manaCost = card.mana_cost || ''
      }
    }

    const rows: Card[] = [{ name: card.name, manaCost, imageUrl, backImageUrl }]
    if (frontFaceName) {
      rows.push({ name: frontFaceName, manaCost, imageUrl, backImageUrl })
    }
    return rows
  })

  console.log('💾 Inserting cards into database...')

  // Use transaction for batch insert
  const insertMany = db.transaction((cards: Card[]) => {
    for (const card of cards) {
      insert.run(card.name, card.manaCost, card.imageUrl, card.backImageUrl || null)
    }
  })

  insertMany(cardsToInsert)

  // Store metadata
  db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)').run(
    'last_update',
    new Date().toISOString()
  )
  db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)').run(
    'total_cards',
    pauperCards.length.toString()
  )

  console.log('✅ Cards imported successfully')
}

async function main() {
  try {
    console.log('🚀 Starting bulk data download and database creation...\n')

    // Step 1: Fetch bulk data info
    const bulkInfo = await fetchBulkDataInfo()

    // Step 2: Download bulk data
    await downloadBulkData(bulkInfo.download_uri)

    // Step 3: Create database
    const db = await createDatabase()

    // Step 4: Import Pauper cards
    await importPauperCards(db)

    // Step 5: Show stats
    const stats = db.prepare('SELECT COUNT(*) as count FROM cards').get() as { count: number }

    console.log('\n📊 Database Statistics:')
    console.log(`   └─ Cards: ${stats.count}`)
    console.log(`   └─ Database size: ${(statSync(DB_PATH).size / 1024 / 1024).toFixed(2)} MB`)

    db.close()

    console.log('\n✨ Done! Database ready at:', DB_PATH)
    console.log('\n💡 You can now run your build with: bun run generate')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
