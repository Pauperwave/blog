import { describe, it, expect } from 'vitest'
import { curveLegend, curveSegments, curveTooltip } from './curve-display'

describe('curveSegments', () => {
  type Column = Parameters<typeof curveSegments>[0]
  const column = (colors: Column['colors'], multicolor: Column['multicolor'] = {}): Column =>
    ({ colors, multicolor })

  it('lists the colors that appear, bottom to top in color order', () => {
    const segments = curveSegments(column({ C: 1, R: 3, W: 2 }))
    expect(segments.map(segment => [segment.color, segment.count]))
      .toEqual([['W', 2], ['R', 3], ['C', 1]])
  })

  it('leaves out colors with no cards, and gives nothing for an empty column', () => {
    expect(curveSegments(column({ U: 0, G: 4 })).map(segment => segment.color)).toEqual(['G'])
    expect(curveSegments(column({}))).toEqual([])
  })

  it('dims the colors other than the highlighted one', () => {
    const segments = curveSegments(column({ R: 3, U: 2 }), 'R')
    expect(segments.map(segment => [segment.color, segment.dimmed]))
      .toEqual([['U', true], ['R', false]])
  })

  it('splits the multicolor segment into cards with the highlighted color and the rest', () => {
    // 4 multicolor cards, 3 of them with blue
    const segments = curveSegments(column({ M: 4 }, { U: 3, B: 1 }), 'U')
    expect(segments.map(segment => [segment.color, segment.count, segment.dimmed]))
      .toEqual([['M', 3, false], ['M', 1, true]])
  })

  it('dims the whole multicolor segment when none of its cards has the highlighted color', () => {
    const segments = curveSegments(column({ M: 2 }, { U: 2, B: 2 }), 'R')
    expect(segments.map(segment => [segment.count, segment.dimmed])).toEqual([[2, true]])
  })

  it('keeps the multicolor segment whole without a highlighted color', () => {
    const segments = curveSegments(column({ M: 4 }, { U: 3 }))
    expect(segments.map(segment => [segment.count, segment.dimmed]))
      .toEqual([[4, false]])
  })
})

describe('curveTooltip', () => {
  it('gives the cost, the card count and the split by color', () => {
    expect(curveTooltip({ label: '2', count: 5, colors: { R: 3, C: 2 }, multicolor: {} }))
      .toBe('Costo 2: 5 (Rosso 3, Incolore 2)')
  })

  it('leaves the split out of an empty column', () => {
    expect(curveTooltip({ label: '0', count: 0, colors: {}, multicolor: {} })).toBe('Costo 0: 0')
  })
})

describe('curveLegend', () => {
  const bucket = (colors: Parameters<typeof curveSegments>[0]['colors']) =>
    ({ label: '1', count: 1, colors, multicolor: {} })

  it('lists the colors found in any column, in color order', () => {
    const legend = curveLegend([bucket({ R: 2, C: 1 }), bucket({ W: 1 }), bucket({ R: 1, M: 2 })])
    expect(legend.map(entry => entry.color)).toEqual(['W', 'R', 'M', 'C'])
  })

  it('gives the name and fill of each color', () => {
    expect(curveLegend([bucket({ M: 1 })])).toEqual([
      { color: 'M', name: 'Multicolore', fill: 'bg-yellow-500 text-gray-900' }
    ])
  })

  it('leaves out colors with no cards and gives nothing for an empty curve', () => {
    expect(curveLegend([bucket({ U: 0 })])).toEqual([])
    expect(curveLegend([])).toEqual([])
  })
})
