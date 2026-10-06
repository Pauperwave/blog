import { describe, it, expect } from 'vitest'
import { computeDeckStats } from './deck-stats'

describe('deck stats', () => {
  describe('computeDeckStats', () => {
    const cardsBySection = {
      Creatures: [{ quantity: 4, manaCost: '{1}{R}' }],
      Instants: [{ quantity: 2, manaCost: '{R}' }, { quantity: 1, manaCost: '{2}{U}{U}' }],
      Lands: [{ quantity: 10, manaCost: '' }],
      Sideboard: [{ quantity: 3, manaCost: '{1}{R}' }]
    }

    it('builds the curve from non-land main deck cards', () => {
      const { curve } = computeDeckStats(cardsBySection)
      expect(curve.map(bucket => bucket.count)).toEqual([0, 2, 4, 0, 1, 0, 0, 0])
      expect(curve.at(-1)?.label).toBe('7+')
    })

    it('splits each curve bucket by card color', () => {
      const { curve } = computeDeckStats({
        Creatures: [{ quantity: 3, manaCost: '{1}{R}' }, { quantity: 2, manaCost: '{1}{R}{U}' }, { quantity: 1, manaCost: '{2}' }]
      })
      expect(curve[2]?.colors).toEqual({ R: 3, C: 1 })
      expect(curve[3]?.colors).toEqual({ M: 2 })
      expect(curve[3]?.multicolor).toEqual({ R: 2, U: 2 })
    })

    it('puts expensive cards in the last bucket', () => {
      const { curve } = computeDeckStats({ Creatures: [{ quantity: 1, manaCost: '{8}' }] })
      expect(curve.at(-1)?.count).toBe(1)
    })

    it('averages mana value over non-land cards only', () => {
      // (4*2 + 2*1 + 1*4) / 7
      expect(computeDeckStats(cardsBySection).averageManaValue).toBeCloseTo(2)
    })

    it('counts color pips weighted by quantity, skipping absent colors', () => {
      expect(computeDeckStats(cardsBySection).pips).toEqual([
        { color: 'U', count: 2 },
        { color: 'R', count: 6 }
      ])
    })

    it('counts lands', () => {
      expect(computeDeckStats(cardsBySection).landCount).toBe(10)
    })

    it('handles an empty deck', () => {
      const stats = computeDeckStats({})
      expect(stats.averageManaValue).toBe(0)
      expect(stats.landCount).toBe(0)
    })

    it('counts cards per type in section order, without sideboard or empty types', () => {
      expect(computeDeckStats(cardsBySection).typeCounts).toEqual([
        { section: 'Creatures', count: 4 },
        { section: 'Instants', count: 3 },
        { section: 'Lands', count: 10 }
      ])
    })
  })
})
