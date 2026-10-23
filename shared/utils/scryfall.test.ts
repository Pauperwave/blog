import { describe, it, expect } from 'vitest'
import { toArtCropUrl } from './scryfall'

describe('scryfall', () => {
  describe('toArtCropUrl', () => {
    it('swaps the grid image for the art', () => {
      expect(toArtCropUrl('https://cards.scryfall.io/grid/front/f/6/id.webp?1')).toBe('https://cards.scryfall.io/art/front/f/6/id.webp?1')
    })
  })
})
