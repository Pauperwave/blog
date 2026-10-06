import { LAND_SECTION, SIDEBOARD_SECTION } from '#shared/utils'

interface ArtCandidate {
  name: string
  section: string
  quantity: number
}

/** The deck's representative card: the most played non-land main deck card. */
export function pickDeckArtCard<T extends ArtCandidate>(cards: T[]): T | undefined {
  return cards
    .filter(card => card.section !== LAND_SECTION && card.section !== SIDEBOARD_SECTION)
    .reduce<T | undefined>(
      (best, card) => (!best || card.quantity > best.quantity ? card : best),
      undefined
    )
}

/** Scryfall serves the art crop under the same path as the normal image */
export function toArtCropUrl(imageUrl: string): string {
  return imageUrl.replace('/normal/', '/art_crop/')
}
