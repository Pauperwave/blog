import { describe, it, expect } from 'vitest'
import { highlightState } from './deck-highlight'

describe('highlightState', () => {
  const bolt = {
    name: 'Lightning Bolt', section: 'Instants', type: 'Instants', manaCost: '{R}'
  } as const
  const guttersnipe = {
    name: 'Guttersnipe', section: 'Creatures', type: 'Creatures', manaCost: '{2}{R}'
  } as const
  const island = { name: 'Island', section: 'Lands', type: 'Lands', manaCost: '' } as const
  const pyroblast = {
    name: 'Pyroblast', section: 'Sideboard', type: 'Instants', manaCost: '{R}'
  } as const
  const untypedSideboardCard = { name: 'Mystery', section: 'Sideboard', manaCost: '{R}' } as const
  const sideboardPlains = { name: 'Plains', section: 'Sideboard', manaCost: '' } as const

  it('matches a type by the section of its type, sideboard included', () => {
    expect(highlightState(bolt, { kind: 'type', section: 'Instants' })).toBe('match')
    expect(highlightState(pyroblast, { kind: 'type', section: 'Instants' })).toBe('match')
    expect(highlightState(guttersnipe, { kind: 'type', section: 'Instants' })).toBe('dim')
  })

  it('leaves a card of unknown type alone', () => {
    expect(highlightState(untypedSideboardCard, { kind: 'type', section: 'Instants' }))
      .toBe('neutral')
  })

  it('matches a curve bucket by mana value, capping at the last bucket', () => {
    expect(highlightState(bolt, { kind: 'curve', bucket: 1 })).toBe('match')
    expect(highlightState(guttersnipe, { kind: 'curve', bucket: 1 })).toBe('dim')
    const colossus = { name: 'Colossus', section: 'Creatures', manaCost: '{9}' } as const
    expect(highlightState(colossus, { kind: 'curve', bucket: 7 }))
      .toBe('match')
  })

  it('matches a color when its cost has that pip', () => {
    expect(highlightState(guttersnipe, { kind: 'color', color: 'R' })).toBe('match')
    expect(highlightState(guttersnipe, { kind: 'color', color: 'U' })).toBe('dim')
  })

  it('evaluates sideboard spells by cost for curve and colors', () => {
    expect(highlightState(pyroblast, { kind: 'curve', bucket: 1 })).toBe('match')
    expect(highlightState(pyroblast, { kind: 'color', color: 'R' })).toBe('match')
    expect(highlightState(pyroblast, { kind: 'color', color: 'U' })).toBe('dim')
  })

  it('dims lands, sideboard ones included, for curve and colors', () => {
    expect(highlightState(island, { kind: 'curve', bucket: 0 })).toBe('dim')
    expect(highlightState(sideboardPlains, { kind: 'curve', bucket: 0 })).toBe('dim')
    expect(highlightState(sideboardPlains, { kind: 'color', color: 'R' })).toBe('dim')
  })

  it('matches the cards whose price key is in the highlight, and dims the others', () => {
    const highlight = { kind: 'price', keys: new Set(['lightning bolt', 'pyroblast']) } as const
    expect(highlightState(bolt, highlight)).toBe('match')
    expect(highlightState(pyroblast, highlight)).toBe('match')
    expect(highlightState(guttersnipe, highlight)).toBe('dim')
  })

  it('matches a double-faced card by its front face', () => {
    const highlight = { kind: 'price', keys: new Set(['delver of secrets']) } as const
    const delver = {
      name: 'Delver of Secrets // Insectile Aberration', section: 'Creatures', manaCost: '{U}'
    } as const
    expect(highlightState(delver, highlight)).toBe('match')
  })
})
