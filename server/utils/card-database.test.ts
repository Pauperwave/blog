import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getCardsByNames, getCardByName, closeDatabase } from './card-database'

describe('Card Database', () => {
  afterAll(() => {
    closeDatabase()
  })

  describe('getCardByName', () => {
    it('should find a card by exact name', async () => {
      const card = await getCardByName('Lightning Bolt')
      expect(card).not.toBeNull()
      if (card) {
        expect(card.name).toBe('Lightning Bolt')
        expect(card.imageUrl).toBeTruthy()
      }
    })

    it('should return null for non-existent card', async () => {
      const card = await getCardByName('Nonexistent Card XYZ')
      expect(card).toBeNull()
    })
  })

  describe('getCardsByNames', () => {
    it('should find multiple cards by exact names', async () => {
      const names = ['Lightning Bolt', 'Counterspell', 'Grizzly Bears']
      const result = await getCardsByNames(names)
      
      expect(result.size).toBeGreaterThan(0)
      expect(result.get('Lightning Bolt')).toBeTruthy()
    })

    it('should handle empty array', async () => {
      const result = await getCardsByNames([])
      expect(result.size).toBe(0)
    })

    it('should handle case-insensitive names', async () => {
      const names = ['lightning bolt', 'COUNTERSPELL', 'grizzly bears']
      const result = await getCardsByNames(names)
      
      expect(result.size).toBeGreaterThan(0)
      expect(result.get('lightning bolt')).toBeTruthy()
    })

    it('should handle mixed case and exact names', async () => {
      const names = ['Lightning Bolt', 'counterspell', 'Grizzly Bears']
      const result = await getCardsByNames(names)
      
      expect(result.size).toBeGreaterThan(0)
    })

    it('should handle duplicate names', async () => {
      const names = ['Lightning Bolt', 'Lightning Bolt', 'Counterspell']
      const result = await getCardsByNames(names)
      
      // Should have both keys even though one is duplicate
      expect(result.has('Lightning Bolt')).toBe(true)
      expect(result.has('Counterspell')).toBe(true)
    })

    it('should handle duplicate names with different cases', async () => {
      // This is the critical test case - could reveal the bug
      const names = ['Lightning Bolt', 'lightning bolt', 'LIGHTNING BOLT']
      const result = await getCardsByNames(names)
      
      expect(result.get('Lightning Bolt')).toBeTruthy()
      expect(result.get('lightning bolt')).toBeTruthy()
      expect(result.get('LIGHTNING BOLT')).toBeTruthy()
      
      // All should resolve to the same card data
      const exactMatch = result.get('Lightning Bolt')
      const lowerMatch = result.get('lightning bolt')
      const upperMatch = result.get('LIGHTNING BOLT')
      
      expect(exactMatch?.imageUrl).toBe(lowerMatch?.imageUrl)
      expect(lowerMatch?.imageUrl).toBe(upperMatch?.imageUrl)
    })

    it('should handle special characters in card names', async () => {
      // Card names with special characters like apostrophes and dashes
      const names = ["Ashnod's Altar", "Black Mage's Rod", "Eviscerator's Insight"]
      const result = await getCardsByNames(names)
      
      expect(result.size).toBeGreaterThan(0)
    })

    it('should handle URL-encoded special characters', async () => {
      // Simulate what comes from URL params
      const names = [
        "Eviscerator%27s+Insight".replace(/%27/g, "'").replace(/\+/g, " "),
        "Black+Mage%27s+Rod".replace(/%27/g, "'").replace(/\+/g, " ")
      ]
      const result = await getCardsByNames(names)
      
      expect(result.size).toBeGreaterThan(0)
    })

    it('should not throw on very long list of names', async () => {
      const names = Array(1000).fill('Lightning Bolt')
      expect(async () => {
        await getCardsByNames(names)
      }).not.toThrow()
    })

    it('should handle mixed valid and invalid names', async () => {
      const names = ['Lightning Bolt', 'Nonexistent Card XYZ', 'Counterspell']
      const result = await getCardsByNames(names)
      
      // Should only return the valid cards
      expect(result.has('Lightning Bolt')).toBe(true)
      expect(result.has('Counterspell')).toBe(true)
      expect(result.has('Nonexistent Card XYZ')).toBe(false)
    })
  })
})
