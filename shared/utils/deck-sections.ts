export const SIDEBOARD_SECTION = 'Sideboard'
export const LAND_SECTION = 'Lands'

/** Decklist sections in display order, sideboard last. */
export const DECK_SECTIONS = ['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments', LAND_SECTION, SIDEBOARD_SECTION] as const

export type DeckSection = (typeof DECK_SECTIONS)[number]
export type MainDeckSection = Exclude<DeckSection, typeof SIDEBOARD_SECTION>

export const MAIN_DECK_SECTIONS = DECK_SECTIONS.filter((section): section is MainDeckSection => section !== SIDEBOARD_SECTION)

export const NON_LAND_SECTIONS = MAIN_DECK_SECTIONS.filter(section => section !== LAND_SECTION)

export function isDeckSection(value: string): value is DeckSection {
  return (DECK_SECTIONS as readonly string[]).includes(value)
}
