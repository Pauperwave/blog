import { describe, it, expect } from 'vitest'
import { computeDeckStats, curveSegments, curveTooltip } from './deck-stats'

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

describe('curveSegments', () => {
  const column = (colors: Parameters<typeof curveSegments>[0]['colors'], multicolor: Parameters<typeof curveSegments>[0]['multicolor'] = {}) => ({ colors, multicolor })

  it('lists the colors that appear, bottom to top in color order', () => {
    const segments = curveSegments(column({ C: 1, R: 3, W: 2 }))
    expect(segments.map(segment => [segment.color, segment.count])).toEqual([['W', 2], ['R', 3], ['C', 1]])
  })

  it('leaves out colors with no cards, and gives nothing for an empty column', () => {
    expect(curveSegments(column({ U: 0, G: 4 })).map(segment => segment.color)).toEqual(['G'])
    expect(curveSegments(column({}))).toEqual([])
  })

  it('dims the colors other than the highlighted one', () => {
    const segments = curveSegments(column({ R: 3, U: 2 }), 'R')
    expect(segments.map(segment => [segment.color, segment.dimmed])).toEqual([['U', true], ['R', false]])
  })

  it('splits the multicolor segment into cards with the highlighted color and the rest', () => {
    // 4 multicolor cards, 3 of them with blue
    const segments = curveSegments(column({ M: 4 }, { U: 3, B: 1 }), 'U')
    expect(segments.map(segment => [segment.color, segment.count, segment.dimmed])).toEqual([['M', 3, false], ['M', 1, true]])
  })

  it('dims the whole multicolor segment when none of its cards has the highlighted color', () => {
    const segments = curveSegments(column({ M: 2 }, { U: 2, B: 2 }), 'R')
    expect(segments.map(segment => [segment.count, segment.dimmed])).toEqual([[2, true]])
  })

  it('keeps the multicolor segment whole without a highlighted color', () => {
    expect(curveSegments(column({ M: 4 }, { U: 3 })).map(segment => [segment.count, segment.dimmed])).toEqual([[4, false]])
  })
})

describe('curveTooltip', () => {
  it('gives the cost, the card count and the split by color', () => {
    expect(curveTooltip({ label: '2', count: 5, colors: { R: 3, C: 2 }, multicolor: {} })).toBe('Costo 2: 5 (Rosso 3, Incolore 2)')
  })

  it('leaves the split out of an empty column', () => {
    expect(curveTooltip({ label: '0', count: 0, colors: {}, multicolor: {} })).toBe('Costo 0: 0')
  })
})
