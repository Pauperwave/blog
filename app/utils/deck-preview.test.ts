import { describe, it, expect } from 'vitest'
import { deckPreviewPath } from './deck-preview'

describe('deckPreviewPath', () => {
  it('puts the preview flag before the hash', () => {
    expect(deckPreviewPath('/articles/2026-09-20-pauper-wine', 'deck-jeskai-andrea-borghi'))
      .toBe('/articles/2026-09-20-pauper-wine?preview#deck-jeskai-andrea-borghi')
  })
})
