/** Price of one card in euros (Cardmarket) and MTGO tickets, as Scryfall reports them. */
export interface CardPrice {
  eur: number | null
  tix: number | null
}

/** What one card weighs on the deck price: all its copies in euros, most expensive line first. */
export interface PriceLine {
  key: string
  name: string
  quantity: number
  unit: number
  total: number
}

/** Estimated price of a whole decklist. `missing` counts the cards Scryfall has no price for. */
export interface DeckPrice {
  eur: number
  tix: number
  missing: number
  lines: PriceLine[]
}

interface PricedCard {
  name: string
  quantity: number
}

const SCRYFALL_COLLECTION_URL = 'https://api.scryfall.com/cards/collection'
// The collection endpoint takes at most 75 identifiers per request
const MAX_IDENTIFIERS = 75
// Scryfall asks for 50-100 ms between requests
const REQUEST_GAP_MS = 100

const BASIC_LAND = /^(Snow-Covered )?(Plains|Island|Swamp|Mountain|Forest)$|^Wastes$/

/** Basic lands have no price in Scryfall's default printing and cost nothing in practice. */
export const isBasicLand = (name: string) => BASIC_LAND.test(name)

/** Scryfall finds double-faced cards by their front face, not by the full "Front // Back" name. */
export const frontFaceName = (name: string) => name.split(' // ')[0] ?? name

/** Key of a card in the price maps and lines: the lowercase front face name. */
export const priceKey = (name: string) => frontFaceName(name).toLowerCase()

const toNumber = (value: string | null | undefined) => {
  const number = Number(value)
  return value && Number.isFinite(number) ? number : null
}

interface ScryfallCollectionResponse {
  data: { name: string, prices: { eur?: string | null, tix?: string | null } }[]
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Prices for the given card names, keyed by lowercase front face name (unknown cards omitted). */
export async function fetchCardPrices(
  names: string[],
  fetcher: typeof fetch = fetch
): Promise<Map<string, CardPrice>> {
  const wanted = [...new Set(names.filter(name => !isBasicLand(name)).map(frontFaceName))]
  const prices = new Map<string, CardPrice>()

  for (let start = 0; start < wanted.length; start += MAX_IDENTIFIERS) {
    if (start > 0) await wait(REQUEST_GAP_MS)

    const identifiers = wanted.slice(start, start + MAX_IDENTIFIERS).map(name => ({ name }))
    const response = await fetcher(SCRYFALL_COLLECTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ identifiers })
    })
    if (!response.ok) throw new Error(`Scryfall prices failed: ${response.status}`)

    const { data } = await response.json() as ScryfallCollectionResponse
    for (const card of data) {
      prices.set(priceKey(card.name), {
        eur: toNumber(card.prices.eur),
        tix: toNumber(card.prices.tix)
      })
    }
  }

  return prices
}

/** Sum of quantity times price; basic lands count as free, cards with no price as missing. */
export function computeDeckPrice(
  cards: PricedCard[],
  prices: ReadonlyMap<string, CardPrice>
): DeckPrice {
  const total: DeckPrice = { eur: 0, tix: 0, missing: 0, lines: [] }
  const lines = new Map<string, PriceLine>()

  for (const { name, quantity } of cards) {
    if (isBasicLand(name)) continue

    const key = priceKey(name)
    const price = prices.get(key)
    if (!price || (price.eur === null && price.tix === null)) {
      total.missing += quantity
      continue
    }
    total.eur += quantity * (price.eur ?? 0)
    total.tix += quantity * (price.tix ?? 0)

    if (price.eur !== null) {
      // The same card in main deck and sideboard is one line
      const line = lines.get(key) ?? { key, name, quantity: 0, unit: price.eur, total: 0 }
      line.quantity += quantity
      line.total += quantity * price.eur
      lines.set(key, line)
    }
  }

  total.lines = [...lines.values()].sort((a, b) => b.total - a.total)
  return total
}

/** The cards that weigh the most on the deck price. */
export const costliestLines = (price: DeckPrice, count = 5) => price.lines.slice(0, count)

const eurFormat = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const tixFormat = new Intl.NumberFormat('it-IT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export const formatEur = (amount: number) => eurFormat.format(amount)
export const formatTix = (amount: number) => `${tixFormat.format(amount)} tix`
