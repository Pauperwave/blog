/**
 * Card database utility for looking up card data from SQLite
 * Used by components to get card information without API calls
 */

import { Database } from 'bun:sqlite'
import { join } from 'path'
import type { ManaSymbol } from '../../shared/types/decklist'

export interface CardData {
  name: string
  manaCost: string
  imageUrl: string
}

export interface ParsedManaCost {
  symbols: string[]
  manaSymbols: ManaSymbol[]
}

let dbInstance: Database | null = null

/**
 * Get database instance (singleton)
 */
function getDatabase(): Database {
  if (!dbInstance) {
    const dbPath = join(process.cwd(), 'server', 'database', 'cards.db')
    dbInstance = new Database(dbPath, { readonly: true })
  }
  return dbInstance
}

/**
 * Parse mana cost string into individual symbols
 * Example: "{2}{U}{U}" => ["{2}", "{U}", "{U}"]
 */
export function parseManaCost(manaCost: string): string[] {
  if (!manaCost) return []
  const matches = manaCost.match(/\{[^}]+\}/g)
  return matches || []
}

/**
 * Get card data by exact name
 */
export function getCardByName(name: string): CardData | null {
  const db = getDatabase()
  
  const row = db.prepare(`
    SELECT * FROM cards WHERE name = ? LIMIT 1
  `).get(name) as any
  
  if (!row) return null
  
  return {
    name: row.name,
    manaCost: row.mana_cost || '',
    imageUrl: row.image_url
  }
}

/**
 * Get multiple cards by names (batch lookup)
 */
export function getCardsByNames(names: string[]): Map<string, CardData> {
  const db = getDatabase()
  const result = new Map<string, CardData>()
  
  // Use parameterized query for safety
  const placeholders = names.map(() => '?').join(',')
  const query = `SELECT * FROM cards WHERE name IN (${placeholders})`
  
  const rows = db.prepare(query).all(...names) as any[]
  
  for (const row of rows) {
    result.set(row.name, {
      name: row.name,
      manaCost: row.mana_cost || '',
      imageUrl: row.image_url
    })
  }
  
  return result
}

/**
 * Get mana symbol SVG URI
 */
export function getManaSymbol(symbol: string): string | null {
  const db = getDatabase()
  
  const row = db.prepare(`
    SELECT svg_uri FROM mana_symbols WHERE symbol = ? LIMIT 1
  `).get(symbol) as any
  
  return row?.svg_uri || null
}

/**
 * Get all mana symbols (cached)
 */
let manaSymbolCache: Map<string, string> | null = null

export function getAllManaSymbols(): Map<string, string> {
  if (manaSymbolCache) return manaSymbolCache
  
  const db = getDatabase()
  const rows = db.prepare('SELECT symbol, svg_uri FROM mana_symbols').all() as any[]
  
  manaSymbolCache = new Map()
  for (const row of rows) {
    manaSymbolCache.set(row.symbol, row.svg_uri)
  }
  
  return manaSymbolCache
}

/**
 * Get parsed mana cost with SVG URIs
 */
export function getParsedManaCost(manaCost: string): ParsedManaCost {
  const symbols = parseManaCost(manaCost)
  const symbolMap = getAllManaSymbols()
  
  const manaSymbols: ManaSymbol[] = symbols.map(symbol => ({
    symbol,
    svgUri: symbolMap.get(symbol) || ''
  }))
  
  return {
    symbols,
    manaSymbols
  }
}

/**
 * Close database connection (call on shutdown)
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
