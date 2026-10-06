import { describe, it, expect } from 'vitest'
import { cardCurveColor, countColorPips, parseManaValue } from './mana-cost'

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

describe('cardCurveColor', () => {
  it('gives the color of a mono-colored card', () => {
    expect(cardCurveColor('{2}{U}{U}')).toBe('U')
  })

  it('gives multicolor to cards with more than one color, hybrid included', () => {
    expect(cardCurveColor('{R}{G}')).toBe('M')
    expect(cardCurveColor('{W/U}')).toBe('M')
  })

  it('gives colorless to cards without colored symbols', () => {
    expect(cardCurveColor('{3}')).toBe('C')
    expect(cardCurveColor('')).toBe('C')
  })
})
