import { describe, it, expect } from 'vitest'
import { transformCardComponents } from './card-components'

const images: Record<string, string> = {
  'Lightning Bolt': 'https://cards.scryfall.io/grid/front/a/b/bolt.webp?1',
  'Counterspell': 'https://cards.scryfall.io/grid/front/c/d/counter.webp?2',
  'Swords to Plowshares (spg)': 'https://cards.scryfall.io/grid/front/e/f/swords.webp?3'
}
const resolve = async (card: string) => images[card] ?? null
const transform = (content: string) => transformCardComponents(content, 'test.md', resolve)

describe('transformCardComponents', () => {
  describe('::magic-cards', () => {
    it('adds the images after the authors props, one per card', async () => {
      const content = '::magic-cards\n---\ncards:\n  - Lightning Bolt\n  - Counterspell\ncaption: "Two"\n---\n::\n'
      expect(await transform(content)).toBe(
        '::magic-cards\n---\ncards:\n  - Lightning Bolt\n  - Counterspell\ncaption: "Two"\n'
        + 'images: ["https://cards.scryfall.io/grid/front/a/b/bolt.webp?1","https://cards.scryfall.io/grid/front/c/d/counter.webp?2"]\n---\n::\n'
      )
    })

    it('uses null for a card that is not found, keeping the order', async () => {
      const content = '::magic-cards\n---\ncards:\n  - Nope\n  - Lightning Bolt\n---\n::\n'
      expect(await transform(content)).toContain(
        'images: [null,"https://cards.scryfall.io/grid/front/a/b/bolt.webp?1"]\n---'
      )
    })

    it('resolves the card string as the author wrote it, set included', async () => {
      const content = '::magic-cards\n---\ncards: [Swords to Plowshares (spg)]\n---\n::\n'
      expect(await transform(content)).toContain('swords.webp?3"]')
    })

    it('keeps CRLF line endings', async () => {
      const content = '::magic-cards\r\n---\r\ncards:\r\n  - Lightning Bolt\r\n---\r\n::\r\n'
      const result = await transform(content)
      expect(result).toBe(
        '::magic-cards\r\n---\r\ncards:\r\n  - Lightning Bolt\r\n'
        + 'images: ["https://cards.scryfall.io/grid/front/a/b/bolt.webp?1"]\r\n---\r\n::\r\n'
      )
    })

    it('leaves a block without a cards list as is', async () => {
      const content = '::magic-cards\n---\ncaption: "No cards"\n---\n::\n'
      expect(await transform(content)).toBe(content)
    })

    it('leaves a block with invalid YAML as is', async () => {
      const content = '::magic-cards\n---\ncards: [unclosed\n---\n::\n'
      expect(await transform(content)).toBe(content)
    })
  })

  describe('::magic-card-art-crop', () => {
    it('adds the art URL, swapped from the grid image', async () => {
      const content = '::magic-card-art-crop\n---\ncard: Lightning Bolt\ncrop:\n  height: xl\n---\n::\n'
      expect(await transform(content)).toBe(
        '::magic-card-art-crop\n---\ncard: Lightning Bolt\ncrop:\n  height: xl\n'
        + 'image: "https://cards.scryfall.io/art/front/a/b/bolt.webp?1"\n---\n::\n'
      )
    })

    it('adds a null image for a card that is not found', async () => {
      const content = '::magic-card-art-crop\n---\ncard: Nope\n---\n::\n'
      expect(await transform(content)).toContain('image: null\n---')
    })

    it('adds the image to the inline form', async () => {
      const content = 'Text :magic-card-art-crop{card="Lightning Bolt"} more'
      expect(await transform(content)).toBe(
        'Text :magic-card-art-crop{card="Lightning Bolt" image="https://cards.scryfall.io/art/front/a/b/bolt.webp?1"} more'
      )
    })

    it('leaves an inline card that is not found as is', async () => {
      const content = ':magic-card-art-crop{card="Nope"}'
      expect(await transform(content)).toBe(content)
    })
  })

  it('handles the PascalCase component names', async () => {
    const content = [
      '::MagicCards\n---\ncards:\n  - Lightning Bolt\n---\n::',
      '::MagicCardArtCrop\n---\ncard: Counterspell\n---\n::',
      ':MagicCardArtCrop{card="Lightning Bolt"}'
    ].join('\n')
    const result = await transform(content)
    expect(result).toContain('images: ["https://cards.scryfall.io/grid/front/a/b/bolt.webp?1"]')
    expect(result).toContain('image: "https://cards.scryfall.io/art/front/c/d/counter.webp?2"')
    expect(result).toContain('{card="Lightning Bolt" image="https://cards.scryfall.io/art/front/a/b/bolt.webp?1"}')
  })

  it('does not touch examples inside code fences', async () => {
    const content = '```md\n::magic-cards\n---\ncards:\n  - Lightning Bolt\n---\n::\n:magic-card-art-crop{card="Lightning Bolt"}\n```\n'
    expect(await transform(content)).toBe(content)
  })

  it('transforms several components in one file', async () => {
    const content = [
      '::magic-cards\n---\ncards:\n  - Lightning Bolt\n---\n::',
      'Between',
      '::magic-card-art-crop\n---\ncard: Counterspell\n---\n::',
      ':magic-card-art-crop{card="Lightning Bolt"}'
    ].join('\n')
    const result = await transform(content)
    expect(result).toContain('images: ["https://cards.scryfall.io/grid/front/a/b/bolt.webp?1"]')
    expect(result).toContain('image: "https://cards.scryfall.io/art/front/c/d/counter.webp?2"')
    expect(result).toContain('{card="Lightning Bolt" image="https://cards.scryfall.io/art/front/a/b/bolt.webp?1"}')
  })
})
