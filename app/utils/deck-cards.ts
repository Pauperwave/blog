export interface DeckCard {
  name: string
  section: string
  quantity: number
  imageUrl: string
  backImageUrl?: string
}

interface ParsedDeckCard {
  name: string
  quantity: number
  imageUrl?: string
  backImageUrl?: string
}

/**
 * Cards of a decklist in section order, one entry per card and section (the same card in main deck
 * and sideboard gives two entries). Cards without an image are left out: they cannot be shown.
 */
export function uniqueDeckCards(cardsBySection: Record<string, ParsedDeckCard[]>, sections: readonly string[]): DeckCard[] {
  const seen = new Set<string>()
  const result: DeckCard[] = []

  for (const section of sections) {
    for (const card of cardsBySection[section] ?? []) {
      const key = `${section}-${card.name}`
      if (!card.imageUrl || seen.has(key)) continue
      seen.add(key)
      result.push({ name: card.name, section, quantity: card.quantity, imageUrl: card.imageUrl, backImageUrl: card.backImageUrl })
    }
  }

  return result
}

/** One entry per copy: a card with quantity 4 appears 4 times. */
export function expandCopies<T extends { quantity: number }>(cards: T[]): T[] {
  return cards.flatMap(card => Array.from({ length: card.quantity }, () => card))
}
