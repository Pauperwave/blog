import { describe, it, expect } from 'vitest'
import { computeDeckStats, countColorPips, matchesHighlight, parseManaValue } from './deck-stats'

describe('deck stats', () => {
  describe('parseManaValue', () => {
    it('sums generic and colored symbols', () => {
      expect(parseManaValue('{2}{U}{U}')).toBe(4)
    })

    it('returns 0 for an empty cost', () => {
      expect(parseManaValue('')).toBe(0)
    })

    it('ignores X symbols', () => {
      expect(parseManaValue('{X}{R}')).toBe(1)
    })

    it('counts hybrid symbols as 1 and generic hybrid as its number', () => {
      expect(parseManaValue('{R/G}{R/G}')).toBe(2)
      expect(parseManaValue('{2/W}')).toBe(2)
    })

    it('uses the first face of split and double-faced costs', () => {
      expect(parseManaValue('{1}{R} // {2}{U}')).toBe(2)
    })
  })

  describe('countColorPips', () => {
    it('counts each colored symbol', () => {
      expect(countColorPips('{1}{U}{U}{R}')).toEqual({ U: 2, R: 1 })
    })

    it('counts a hybrid symbol for both of its colors', () => {
      expect(countColorPips('{R/G}')).toEqual({ R: 1, G: 1 })
    })

    it('ignores generic mana and the Phyrexian marker', () => {
      expect(countColorPips('{2}{B/P}')).toEqual({ B: 1 })
    })
  })

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

describe('matchesHighlight', () => {
  const bolt = { section: 'Instants', manaCost: '{R}' }
  const guttersnipe = { section: 'Creatures', manaCost: '{2}{R}' }
  const island = { section: 'Lands', manaCost: '' }
  const pyroblast = { section: 'Sideboard', manaCost: '{R}' }

  it('matches a type by section, sideboard included in none', () => {
    expect(matchesHighlight(bolt, { kind: 'type', section: 'Instants' })).toBe(true)
    expect(matchesHighlight(guttersnipe, { kind: 'type', section: 'Instants' })).toBe(false)
    expect(matchesHighlight(pyroblast, { kind: 'type', section: 'Instants' })).toBe(false)
  })

  it('matches a curve bucket by mana value, capping at the last bucket', () => {
    expect(matchesHighlight(bolt, { kind: 'curve', bucket: 1 })).toBe(true)
    expect(matchesHighlight(guttersnipe, { kind: 'curve', bucket: 1 })).toBe(false)
    expect(matchesHighlight({ section: 'Creatures', manaCost: '{9}' }, { kind: 'curve', bucket: 7 })).toBe(true)
  })

  it('matches a color when its cost has that pip', () => {
    expect(matchesHighlight(guttersnipe, { kind: 'color', color: 'R' })).toBe(true)
    expect(matchesHighlight(guttersnipe, { kind: 'color', color: 'U' })).toBe(false)
  })

  it('leaves lands and the sideboard out of curve and color highlights', () => {
    expect(matchesHighlight(island, { kind: 'curve', bucket: 0 })).toBe(false)
    expect(matchesHighlight(pyroblast, { kind: 'curve', bucket: 1 })).toBe(false)
    expect(matchesHighlight(pyroblast, { kind: 'color', color: 'R' })).toBe(false)
  })
})
