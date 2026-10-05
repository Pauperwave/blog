import { describe, it, expect } from 'vitest'
import { deckImageFileName } from './deck-image'

describe('deckImageFileName', () => {
  it('joins brand, deck, player and placement as a slug', () => {
    expect(deckImageFileName({ name: 'Altar Tron', player: 'Tommaso Loss', placement: 'Finalist' }))
      .toBe('pauperwave-altar-tron-tommaso-loss-finalist.jpg')
  })

  it('skips the parts the deck does not have', () => {
    expect(deckImageFileName({ name: 'Altar Tron' })).toBe('pauperwave-altar-tron.jpg')
  })

  it('does not leave empty parts behind', () => {
    expect(deckImageFileName({ name: 'Affinity', player: '', placement: 'Top 8' })).toBe('pauperwave-affinity-top-8.jpg')
  })
})
