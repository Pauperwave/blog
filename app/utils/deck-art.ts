/** Representative card per archetype, matched case-insensitively against the deck name */
const DECK_ART_CARDS = [
  { keyword: 'madness', card: 'Guttersnipe' }
]

export function findDeckArtCard(deckName: string): string | undefined {
  const name = deckName.toLowerCase()
  return DECK_ART_CARDS.find(entry => name.includes(entry.keyword))?.card
}

/** Scryfall serves the art crop under the same path as the normal image */
export function toArtCropUrl(imageUrl: string): string {
  return imageUrl.replace('/normal/', '/art_crop/')
}
