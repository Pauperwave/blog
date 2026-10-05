import { describe, it, expect } from 'vitest'
import { findDeckArtCard, toArtCropUrl } from './deck-art'

describe('deck art', () => {
  describe('findDeckArtCard', () => {
    it('finds the card for a madness deck whatever the colors in the name', () => {
      expect(findDeckArtCard('R Madness')).toBe('Guttersnipe')
      expect(findDeckArtCard('Rakdos Madness')).toBe('Guttersnipe')
    })

    it('is case insensitive', () => {
      expect(findDeckArtCard('BR MADNESS')).toBe('Guttersnipe')
    })

    it('returns undefined for an archetype without a representative card', () => {
      expect(findDeckArtCard('Affinity')).toBeUndefined()
    })
  })

  describe('toArtCropUrl', () => {
    it('swaps the normal image for the art crop', () => {
      expect(toArtCropUrl('https://cards.scryfall.io/normal/front/f/6/id.jpg?1')).toBe('https://cards.scryfall.io/art_crop/front/f/6/id.jpg?1')
    })
  })
})
