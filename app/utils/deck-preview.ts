/** Query flag that opens a decklist's visual view when the page loads with its anchor in the hash. */
export const DECK_PREVIEW_QUERY = 'preview'

/** Path to a decklist's visual view: the flag goes before the hash, otherwise it would become part of the anchor id. */
export const deckPreviewPath = (path: string, anchorId: string) => `${path}?${DECK_PREVIEW_QUERY}#${anchorId}`
