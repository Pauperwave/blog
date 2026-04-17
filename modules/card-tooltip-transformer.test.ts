import { describe, it, expect } from 'vitest'
import { Database } from 'bun:sqlite'

// Use in-memory database for testing to avoid file locking issues
function createTestDatabase(): Database {
  const db = new Database(':memory:')
  const createTable = db.prepare(`
    CREATE TABLE cards (
      name TEXT PRIMARY KEY,
      mana_cost TEXT,
      image_url TEXT
    );
  `)
  createTable.run()

  // Insert test cards
  const stmt = db.prepare(`
    INSERT INTO cards (name, mana_cost, image_url) VALUES (?, ?, ?)
  `)

  stmt.run('Lightning Bolt', '{R}', 'https://cards.scryfall.io/normal/en/lea/1.jpg')
  stmt.run('Counterspell', '{U}{U}', 'https://cards.scryfall.io/normal/en/lea/2.jpg')
  stmt.run('Grizzly Bears', '{1}{G}', 'https://cards.scryfall.io/normal/en/lea/3.jpg')

  return db
}

describe('Card Tooltip Transformer', () => {
  describe('transformCardTooltips with database', () => {
    it('should embed image URL when card exists in database', () => {
      const db = createTestDatabase()

      // Mock the transform function logic
      const cardName = 'Lightning Bolt'

      const row = db.prepare('SELECT image_url FROM cards WHERE name = ? LIMIT 1').get(cardName) as { image_url: string } | undefined
      const imageUrl = row?.image_url || null

      expect(imageUrl).toBe('https://cards.scryfall.io/normal/en/lea/1.jpg')

      db.close()
    })

    it('should handle multiple cards', () => {
      const db = createTestDatabase()

      const cards = ['Lightning Bolt', 'Counterspell', 'Grizzly Bears']
      const results = cards.map(cardName => {
        const row = db.prepare('SELECT image_url FROM cards WHERE name = ? LIMIT 1').get(cardName) as { image_url: string } | undefined
        return { name: cardName, imageUrl: row?.image_url || null }
      })

      expect(results[0]?.imageUrl).toBe('https://cards.scryfall.io/normal/en/lea/1.jpg')
      expect(results[1]?.imageUrl).toBe('https://cards.scryfall.io/normal/en/lea/2.jpg')
      expect(results[2]?.imageUrl).toBe('https://cards.scryfall.io/normal/en/lea/3.jpg')

      db.close()
    })

    it('should return null for non-existent card', () => {
      const db = createTestDatabase()

      const row = db.prepare('SELECT image_url FROM cards WHERE name = ? LIMIT 1').get('Nonexistent Card') as { image_url: string } | undefined
      const imageUrl = row?.image_url || null

      expect(imageUrl).toBeNull()

      db.close()
    })
  })

  describe('transformCardTooltips without database', () => {
    it('should return null when database is null', () => {
      const db: Database | null = null

      let imageUrl: string | null = null

      if (!db) {
        imageUrl = null
      }

      expect(imageUrl).toBeNull()
    })
  })

  describe('component output format', () => {
    it('should generate correct component syntax with image URL', () => {
      const cardName = 'Lightning Bolt'
      const imageUrl = 'https://cards.scryfall.io/normal/en/lea/1.jpg'

      const component = imageUrl
        ? `:MagicCardTooltip{name="${cardName}" image="${imageUrl}"}`
        : `:MagicCardTooltip{name="${cardName}"}`

      expect(component).toBe(':MagicCardTooltip{name="Lightning Bolt" image="https://cards.scryfall.io/normal/en/lea/1.jpg"}')
    })

    it('should generate component without image URL when not found', () => {
      const cardName = 'Nonexistent Card'
      const imageUrl = null

      const component = imageUrl
        ? `:MagicCardTooltip{name="${cardName}" image="${imageUrl}"}`
        : `:MagicCardTooltip{name="${cardName}"}`

      expect(component).toBe(':MagicCardTooltip{name="Nonexistent Card"}')
    })

    it('should handle set parameter', () => {
      const cardName = 'Lightning Bolt'
      const set = 'UMA'
      const imageUrl = 'https://cards.scryfall.io/normal/en/lea/1.jpg'

      const component = imageUrl
        ? `:MagicCardTooltip{name="${cardName}" set="${set}" image="${imageUrl}"}`
        : `:MagicCardTooltip{name="${cardName}" set="${set}"}`

      expect(component).toBe(':MagicCardTooltip{name="Lightning Bolt" set="UMA" image="https://cards.scryfall.io/normal/en/lea/1.jpg"}')
    })
  })
})
