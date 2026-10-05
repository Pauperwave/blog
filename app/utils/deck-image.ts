import { slugify } from '#shared/utils'

/** pauperwave-deck-player-placement.jpg, skipping the parts a deck doesn't have. */
export function deckImageFileName(deck: { name: string; player?: string; placement?: string }): string {
  const parts = ['pauperwave', deck.name, deck.player, deck.placement]
  return `${parts.filter((part): part is string => Boolean(part)).map(slugify).join('-')}.jpg`
}
