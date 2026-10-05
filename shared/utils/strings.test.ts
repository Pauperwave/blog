import { describe, it, expect } from 'vitest'
import { formatDecklistForArena, formatDecklistForMTGO } from './strings'

const cardsBySection = {
  Creatures: [{ quantity: 4, name: 'Guttersnipe' }],
  Instants: [{ quantity: 3, name: 'Lightning Bolt' }],
  Sideboard: [{ quantity: 2, name: 'Pyroblast' }]
}

describe('decklist formats', () => {
  describe('formatDecklistForMTGO', () => {
    it('lists main deck cards, then the sideboard after a blank line', () => {
      expect(formatDecklistForMTGO(['Creatures', 'Instants'], cardsBySection, true))
        .toBe('4 Guttersnipe\n3 Lightning Bolt\n\nSideboard\n2 Pyroblast')
    })
  })

  describe('formatDecklistForArena', () => {
    it('starts with the Deck header followed by the same lines as MTGO', () => {
      expect(formatDecklistForArena(['Creatures', 'Instants'], cardsBySection, true))
        .toBe('Deck\n4 Guttersnipe\n3 Lightning Bolt\n\nSideboard\n2 Pyroblast')
    })

    it('omits the Sideboard block when the deck has none', () => {
      expect(formatDecklistForArena(['Creatures'], cardsBySection, false))
        .toBe('Deck\n4 Guttersnipe')
    })
  })
})
