import { describe, it, expect, vi } from 'vitest'
import {
  computeDeckPrice,
  fetchCardPrices,
  formatEur,
  formatTix,
  frontFaceName,
  isBasicLand
} from './deck-price'

const scryfallResponse = (cards: { name: string, eur?: string | null, tix?: string | null }[]) => ({
  ok: true,
  status: 200,
  json: async () => ({
    data: cards.map(card => ({
      name: card.name,
      prices: { eur: card.eur ?? null, tix: card.tix ?? null }
    }))
  })
}) as Response

describe('isBasicLand / frontFaceName', () => {
  it('recognizes basic lands, snow-covered ones and Wastes', () => {
    const basics = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Snow-Covered Island']
    basics.push('Wastes')
    expect(basics.every(isBasicLand))
      .toBe(true)
    expect(isBasicLand('Basilisk Gate')).toBe(false)
    expect(isBasicLand('Island Sanctuary')).toBe(false)
  })

  it('keeps the front face of a double-faced name', () => {
    expect(frontFaceName('Delver of Secrets // Insectile Aberration')).toBe('Delver of Secrets')
    expect(frontFaceName('Lightning Bolt')).toBe('Lightning Bolt')
  })
})

describe('computeDeckPrice', () => {
  const prices = new Map([
    ['lightning bolt', { eur: 0.5, tix: 0.02 }],
    ['delver of secrets', { eur: 1, tix: 0.1 }],
    ['odd card', { eur: null, tix: 0.5 }]
  ])

  it('sums quantity times price in euros and tix', () => {
    const price = computeDeckPrice(
      [{ name: 'Lightning Bolt', quantity: 4 }, { name: 'Delver of Secrets', quantity: 2 }],
      prices
    )
    expect(price).toEqual({ eur: 4, tix: 0.28, missing: 0 })
  })

  it('finds a double-faced card by its front face', () => {
    const price = computeDeckPrice(
      [{ name: 'Delver of Secrets // Insectile Aberration', quantity: 1 }],
      prices
    )
    expect(price.eur).toBe(1)
  })

  it('counts basic lands as free and not missing', () => {
    expect(computeDeckPrice([{ name: 'Mountain', quantity: 10 }], prices))
      .toEqual({ eur: 0, tix: 0, missing: 0 })
  })

  it('counts the copies of a card with no price as missing', () => {
    const price = computeDeckPrice(
      [{ name: 'Unknown Card', quantity: 3 }, { name: 'Lightning Bolt', quantity: 1 }],
      prices
    )
    expect(price).toEqual({ eur: 0.5, tix: 0.02, missing: 3 })
  })

  it('uses the currency that exists when the other is missing', () => {
    expect(computeDeckPrice([{ name: 'Odd Card', quantity: 2 }], prices))
      .toEqual({ eur: 0, tix: 1, missing: 0 })
  })
})

describe('fetchCardPrices', () => {
  it('asks for the front face names once, without basic lands, and keys by them', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(scryfallResponse([
      { name: 'Delver of Secrets // Insectile Aberration', eur: '0.46', tix: '0.04' },
      { name: 'Lightning Bolt', eur: '0.83', tix: '0.02' }
    ]))

    const prices = await fetchCardPrices(
      ['Delver of Secrets // Insectile Aberration', 'Lightning Bolt', 'Lightning Bolt', 'Plains'],
      fetcher
    )

    expect(fetcher).toHaveBeenCalledTimes(1)
    const body = JSON.parse(String(fetcher.mock.calls[0]![1]!.body))
    expect(body.identifiers).toEqual([{ name: 'Delver of Secrets' }, { name: 'Lightning Bolt' }])
    expect(prices.get('delver of secrets')).toEqual({ eur: 0.46, tix: 0.04 })
    expect(prices.get('lightning bolt')).toEqual({ eur: 0.83, tix: 0.02 })
  })

  it('turns a missing price into null', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValue(scryfallResponse([{ name: 'Odd Card', eur: null, tix: '0.5' }]))
    const prices = await fetchCardPrices(['Odd Card'], fetcher)
    expect(prices.get('odd card')).toEqual({ eur: null, tix: 0.5 })
  })

  it('splits more than 75 names into several requests', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(scryfallResponse([]))
    const names = Array.from({ length: 80 }, (_, index) => `Card ${index}`)

    await fetchCardPrices(names, fetcher)

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(JSON.parse(String(fetcher.mock.calls[0]![1]!.body)).identifiers).toHaveLength(75)
    expect(JSON.parse(String(fetcher.mock.calls[1]![1]!.body)).identifiers).toHaveLength(5)
  })

  it('does not call Scryfall for a deck of basic lands only', async () => {
    const fetcher = vi.fn<typeof fetch>()
    expect((await fetchCardPrices(['Plains', 'Island'], fetcher)).size).toBe(0)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('throws when Scryfall answers with an error', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue({ ok: false, status: 429 } as Response)
    await expect(fetchCardPrices(['Lightning Bolt'], fetcher))
      .rejects.toThrow('429')
  })
})

describe('formatEur / formatTix', () => {
  it('formats with the Italian decimal comma', () => {
    expect(formatEur(42.3)).toMatch(/^42,30\s€$/)
    expect(formatTix(31.2)).toBe('31,20 tix')
  })
})
