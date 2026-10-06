import { SIDEBOARD_SECTION, type DeckSection, type MainDeckSection } from '#shared/utils'

export interface DeckCard {
  name: string
  section: DeckSection
  quantity: number
  imageUrl: string
  backImageUrl?: string
  manaCost: string
  /** Section its type belongs to: its own section in the main deck, derived from the type line in the sideboard (unknown if missing). */
  type?: MainDeckSection
}

interface ParsedDeckCard {
  name: string
  quantity: number
  imageUrl?: string
  backImageUrl?: string
  manaCost?: string
  typeSection?: MainDeckSection
}

/**
 * Cards of a decklist in section order, one entry per card and section (the same card in main deck
 * and sideboard gives two entries). Cards without an image are left out: they cannot be shown.
 */
export function uniqueDeckCards(cardsBySection: Record<string, ParsedDeckCard[]>, sections: readonly DeckSection[]): DeckCard[] {
  const seen = new Set<string>()
  const result: DeckCard[] = []

  for (const section of sections) {
    for (const card of cardsBySection[section] ?? []) {
      const key = `${section}-${card.name}`
      if (!card.imageUrl || seen.has(key)) continue
      seen.add(key)
      result.push({ name: card.name, section, quantity: card.quantity, imageUrl: card.imageUrl, backImageUrl: card.backImageUrl, manaCost: card.manaCost ?? '', type: section === SIDEBOARD_SECTION ? card.typeSection : section })
    }
  }

  return result
}

/** One entry per copy: a card with quantity 4 appears 4 times. */
export function expandCopies<T extends { quantity: number }>(cards: T[]): T[] {
  return cards.flatMap(card => Array.from({ length: card.quantity }, () => card))
}
