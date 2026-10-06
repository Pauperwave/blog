import { describe, it, expect } from 'vitest'
import { DECK_SECTIONS, MAIN_DECK_SECTIONS, NON_LAND_SECTIONS, isDeckSection, sectionFromTypeLine } from './deck-sections'

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

describe('sectionFromTypeLine', () => {
  it('maps a single type to its section', () => {
    expect(sectionFromTypeLine('Instant')).toBe('Instants')
    expect(sectionFromTypeLine('Legendary Creature — Human Wizard')).toBe('Creatures')
    expect(sectionFromTypeLine('Basic Land — Island')).toBe('Lands')
  })

  it('ignores subtypes, so a Land word in the subtypes does not count', () => {
    expect(sectionFromTypeLine('Creature — Landwalker')).toBe('Creatures')
    expect(sectionFromTypeLine('Enchantment — Aura')).toBe('Enchantments')
  })

  it('sends multi-type cards to the first section in priority order', () => {
    expect(sectionFromTypeLine('Artifact Creature — Myr')).toBe('Creatures')
    expect(sectionFromTypeLine('Artifact Land')).toBe('Lands')
    expect(sectionFromTypeLine('Enchantment Creature — Spirit')).toBe('Creatures')
    expect(sectionFromTypeLine('Kindred Instant — Goblin')).toBe('Instants')
  })

  it('uses the front face of a double-faced card', () => {
    expect(sectionFromTypeLine('Creature — Human // Land')).toBe('Creatures')
  })

  it('gives undefined for types without a section', () => {
    expect(sectionFromTypeLine('Planeswalker — Jace')).toBeUndefined()
    expect(sectionFromTypeLine('')).toBeUndefined()
  })
})
