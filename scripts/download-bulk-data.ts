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
  
  // Create mana symbols table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mana_symbols (
      symbol TEXT PRIMARY KEY,
      svg_uri TEXT,
      indexed_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `)
  
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
  
  // Filter Pauper-legal cards
  const pauperCards = allCards.filter(card => 
    card.legalities.pauper === 'legal' || card.legalities.pauper === 'banned'
  )
  
  console.log(`✅ Found ${pauperCards.length} Pauper-legal cards out of ${allCards.length} total`)
  
  // Prepare insert statement
  const insert = db.prepare(`
    INSERT OR REPLACE INTO cards (name, mana_cost, image_url)
    VALUES (?, ?, ?)
  `)
  
  // Transform and insert cards
  const cardsToInsert: Card[] = pauperCards.map(card => {
    let manaCost = ''
    let imageUrl = ''

    // Extract short name (first part before " // ")
    // "Delver of Secrets // Insectile Aberration".split(' // ')[0]  // → "Delver of Secrets" ✅
    // Sagu Wildling // Roost Seek
    // The Modern Age // Vector Glider
    const shortName = card.name.split(' // ')[0]
    
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
    }
    // Fallback: no images found
    else {
      manaCost = card.mana_cost || ''
      imageUrl = ''
    }
    
    return {
      name: shortName,
      manaCost,
      imageUrl
    }
  })
  
  console.log('💾 Inserting cards into database...')
  
  // Use transaction for batch insert
  const insertMany = db.transaction((cards: Card[]) => {
    for (const card of cards) {
      insert.run(card.name, card.manaCost, card.imageUrl)
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

async function downloadManaSymbols(db: Database): Promise<void> {
  console.log('🎨 Downloading mana symbology...')
  
  const response = await fetch('https://api.scryfall.com/symbology')
  const data = await response.json()
  
  const insert = db.prepare(`
    INSERT OR REPLACE INTO mana_symbols (symbol, svg_uri)
    VALUES (?, ?)
  `)
  
  const insertMany = db.transaction((symbols: Array<{ symbol: string, svg_uri: string }>) => {
    for (const item of symbols) {
      insert.run(item.symbol, item.svg_uri)
    }
  })
  
  insertMany(data.data)
  
  console.log(`✅ Imported ${data.data.length} mana symbols`)
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
    
    // Step 5: Download mana symbols
    await downloadManaSymbols(db)
    
    // Step 6: Show stats
    const stats = db.prepare('SELECT COUNT(*) as count FROM cards').get() as { count: number }
    const symbols = db.prepare('SELECT COUNT(*) as count FROM mana_symbols').get() as { count: number }
    
    console.log('\n📊 Database Statistics:')
    console.log(`   └─ Cards: ${stats.count}`)
    console.log(`   └─ Mana Symbols: ${symbols.count}`)
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
