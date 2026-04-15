// server/utils/card-database.ts
import { join, dirname } from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { isServerlessEnvironment } from '#shared/utils'

export interface CardData {
  name: string
  manaCost: string
  imageUrl: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type DatabaseInstance = any

let dbInstance: DatabaseInstance | null = null

/**
 * Resolve the database path - handles both development and production (Vercel serverless)
 */
function getDbPath(): string {
  // Try multiple possible paths to handle different environments
  const possiblePaths = [
    // Production: relative to .vercel/output/functions or similar
    join(process.cwd(), 'server', 'database', 'cards.db'),
    // Vercel serverless: the db might be bundled differently
    join(dirname(fileURLToPath(import.meta.url)), '..', 'database', 'cards.db'),
    // Fallback: look relative to repository root
    join(process.cwd(), 'server', 'database', 'cards.db'),
  ]

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      buildLog(`✅ Found database at: ${path}`)
      return path
    }
  }

  // If no file found, log all attempts for debugging
  buildLog(`⚠️  Database not found at any expected location. Attempted paths:`)
  possiblePaths.forEach(p => buildLog(`   - ${p}`))

  // Return the primary path anyway - let the database connection fail with a clear error
  return String(possiblePaths[0])

}

/**
 * Get database instance - uses bun:sqlite in Bun runtime, better-sqlite3 otherwise
 * Returns null in serverless environments where SQLite is not available
 */
async function getDatabase(): Promise<DatabaseInstance | null> {
  // Skip database initialization in serverless environments
  if (isServerlessEnvironment()) {
    buildLog('⚠️  Serverless environment detected - skipping database initialization')
    return null
  }

  if (!dbInstance) {
    const dbPath = getDbPath()

    // Determine runtime
    const isBunRuntime = typeof Bun !== 'undefined'

    if (isBunRuntime) {
      try {
        const bunSqliteModuleId = 'bun:sqlite'
        const { Database } = await import(/* @vite-ignore */ bunSqliteModuleId)
        dbInstance = new Database(dbPath, { readonly: true })
        buildLog('✅ Using bun:sqlite')
        return dbInstance
      } catch (bunError) {
        const errorMsg = `bun:sqlite failed: ${bunError instanceof Error ? bunError.message : String(bunError)}`
        buildLog(`⚠️ ${errorMsg}`)
        throw new Error(`Cannot initialize database: ${errorMsg}`)
      }
    }

    // Fall back to better-sqlite3 for Node.js (build time only)
    if (!isBunRuntime) {
      try {
        const Database = (await import('better-sqlite3')).default
        dbInstance = new Database(dbPath, { readonly: true })
        buildLog('✅ Using better-sqlite3 (Node.js)')
        return dbInstance
      } catch (error) {
        const errorMsg = `better-sqlite3 failed: ${error instanceof Error ? error.message : String(error)}`
        buildLog(`❌ ${errorMsg}`)
        throw new Error(`Failed to initialize database at ${dbPath}: ${errorMsg}`)
      }
    }
  }
  return dbInstance
}

export async function getCardByName(name: string): Promise<CardData | null> {
  const db = await getDatabase()

  if (!db) {
    return null
  }

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

  if (!db || names.length === 0) return result

  // First, try exact matches
  const placeholders = names.map(() => '?').join(',')
  const query = `SELECT * FROM cards WHERE name IN (${placeholders})`

  const rows = db.prepare(query).all(...names)

  // Build a case-insensitive lookup from ALL database rows (not just matched ones)
  // This is necessary because case-insensitive lookups won't work if exact matches fail
  const dbCardsByLowercase = new Map<string, CardData>()

  for (const row of rows) {
    const cardData = {
      name: row.name,
      manaCost: row.mana_cost || '',
      imageUrl: row.image_url
    }
    result.set(row.name, cardData)
    // Store by lowercase for fallback matching
    dbCardsByLowercase.set(row.name.toLowerCase(), cardData)
  }

  // For names that weren't found exactly, try case-insensitive match
  // We need to query the database for case-insensitive matches
  for (const name of names) {
    if (!result.has(name)) {
      const lowercaseName = name.toLowerCase()

      // Query database for case-insensitive match using LOWER function
      const caseInsensitiveRow = db.prepare(`
        SELECT * FROM cards WHERE LOWER(name) = ? LIMIT 1
      `).get(lowercaseName)

      if (caseInsensitiveRow) {
        const cardData = {
          name: caseInsensitiveRow.name,
          manaCost: caseInsensitiveRow.mana_cost || '',
          imageUrl: caseInsensitiveRow.image_url
        }
        result.set(name, cardData)
      }
    }
  }

  return result
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
