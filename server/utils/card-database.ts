// server\utils\card-database.ts
/**
 * Card database utility for looking up card data from SQLite
 * Used by components to get card information without API calls
 */
// server/utils/card-database.ts
import { join } from 'path'
import { buildLog } from '../../shared/utils/build-log'

export interface CardData {
  name: string
  manaCost: string
  imageUrl: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type DatabaseInstance = any

let dbInstance: DatabaseInstance | null = null

/**
 * Get database instance - uses bun:sqlite in Bun runtime, better-sqlite3 otherwise
 */
async function getDatabase(): Promise<DatabaseInstance> {
  if (!dbInstance) {
    const dbPath = join(process.cwd(), 'server', 'database', 'cards.db')
    
    try {
      // Check if we're running in Bun
      if (typeof Bun !== 'undefined') {
        const bunSqliteModuleId = 'bun:sqlite'
        const { Database } = await import(/* @vite-ignore */ bunSqliteModuleId)
        dbInstance = new Database(dbPath, { readonly: true })
        buildLog('✅ Using bun:sqlite (faster)')
      } else {
        throw new Error('Not Bun runtime')
      }
    } catch {
      // Fallback to better-sqlite3 for Node.js (build time)
      const Database = (await import('better-sqlite3')).default
      dbInstance = new Database(dbPath, { readonly: true })
      buildLog('⚠️ Using better-sqlite3 (Node.js compatibility fallback)')
    }
  }
  return dbInstance
}

export async function getCardByName(name: string): Promise<CardData | null> {
  const db = await getDatabase()

  const row = db.prepare(`
    SELECT * FROM cards WHERE name = ? LIMIT 1
  `).get(name)

  if (!row) return null

  return {
    name: row.name,
    manaCost: row.mana_cost || '',
    imageUrl: row.image_url
  }
}

export async function getCardsByNames(names: string[]): Promise<Map<string, CardData>> {
  const db = await getDatabase()
  const result = new Map<string, CardData>()

  if (names.length === 0) return result

  const placeholders = names.map(() => '?').join(',')
  const query = `SELECT * FROM cards WHERE name IN (${placeholders})`

  const rows = db.prepare(query).all(...names)

  for (const row of rows) {
    result.set(row.name, {
      name: row.name,
      manaCost: row.mana_cost || '',
      imageUrl: row.image_url
    })
  }

  return result
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
