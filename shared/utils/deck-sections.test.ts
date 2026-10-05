import { describe, it, expect } from 'vitest'
import { DECK_SECTIONS, MAIN_DECK_SECTIONS, NON_LAND_SECTIONS, isDeckSection } from './deck-sections'

describe('deck sections', () => {
  it('puts the sideboard last', () => {
    expect(DECK_SECTIONS.at(-1)).toBe('Sideboard')
  })

  it('leaves the sideboard out of the main deck sections', () => {
    expect(MAIN_DECK_SECTIONS).toEqual(['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments', 'Lands'])
  })

  it('leaves lands out of the non-land sections', () => {
    expect(NON_LAND_SECTIONS).toEqual(['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments'])
  })

  it('recognizes section names exactly', () => {
    expect(isDeckSection('Creatures')).toBe(true)
    expect(isDeckSection('Sideboard')).toBe(true)
    expect(isDeckSection('creatures')).toBe(false)
    expect(isDeckSection('Planeswalkers')).toBe(false)
  })
})
