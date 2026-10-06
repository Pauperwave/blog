import { describe, it, expect } from 'vitest'
import { pickDeckArtCard, toArtCropUrl } from './deck-art'

describe('deck art', () => {
  describe('pickDeckArtCard', () => {
    const cards = [
      { name: 'Guttersnipe', section: 'Creatures', quantity: 2 },
      { name: 'Lightning Bolt', section: 'Instants', quantity: 4 },
      { name: 'Mountain', section: 'Lands', quantity: 14 },
      { name: 'Pyroblast', section: 'Sideboard', quantity: 4 }
    ]

    it('picks the most played non-land main deck card', () => {
      expect(pickDeckArtCard(cards)?.name).toBe('Lightning Bolt')
    })

    it('keeps the first card on a tie', () => {
      const other = { name: 'Other', section: 'Creatures', quantity: 2 }
      expect(pickDeckArtCard([cards[0]!, other])?.name).toBe('Guttersnipe')
    })

    it('ignores lands and sideboard', () => {
      expect(pickDeckArtCard([cards[2]!, cards[3]!])).toBeUndefined()
    })

    it('returns undefined for an empty deck', () => {
      expect(pickDeckArtCard([])).toBeUndefined()
    })
  })

  describe('toArtCropUrl', () => {
    it('swaps the normal image for the art crop', () => {
      expect(toArtCropUrl('https://cards.scryfall.io/normal/front/f/6/id.jpg?1')).toBe('https://cards.scryfall.io/art_crop/front/f/6/id.jpg?1')
    })
  })
})
