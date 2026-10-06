export const SIDEBOARD_SECTION = 'Sideboard'
export const LAND_SECTION = 'Lands'

/** Decklist sections in display order, sideboard last. */
export const DECK_SECTIONS = [
  'Creatures',
  'Instants',
  'Sorceries',
  'Artifacts',
  'Enchantments',
  LAND_SECTION,
  SIDEBOARD_SECTION
] as const

export type DeckSection = (typeof DECK_SECTIONS)[number]
export type MainDeckSection = Exclude<DeckSection, typeof SIDEBOARD_SECTION>

export const MAIN_DECK_SECTIONS = DECK_SECTIONS.filter(
  (section): section is MainDeckSection => section !== SIDEBOARD_SECTION
)

export const NON_LAND_SECTIONS = MAIN_DECK_SECTIONS.filter(section => section !== LAND_SECTION)

// Order matters: a card with several types goes to the first match (an artifact creature is a
// creature, an artifact land a land)
const TYPE_SECTIONS: readonly (readonly [string, MainDeckSection])[] = [
  ['Creature', 'Creatures'],
  ['Land', LAND_SECTION],
  ['Instant', 'Instants'],
  ['Sorcery', 'Sorceries'],
  ['Artifact', 'Artifacts'],
  ['Enchantment', 'Enchantments']
]

/**
 * Main deck section of a card from its Scryfall type line, for cards the author did not sort by
 * type (the sideboard). Double-faced cards use the front face.
 */
export function sectionFromTypeLine(typeLine: string): MainDeckSection | undefined {
  const frontFace = typeLine.split(' // ')[0] ?? ''
  const types = (frontFace.split(' — ')[0] ?? '').split(' ')
  return TYPE_SECTIONS.find(([type]) => types.includes(type))?.[1]
}

export type NonLandSection = (typeof NON_LAND_SECTIONS)[number]

const isOneOf = <T extends string>(values: readonly T[], value: string): value is T =>
  (values as readonly string[]).includes(value)

export const isDeckSection = (value: string): value is DeckSection => isOneOf(DECK_SECTIONS, value)

export const isNonLandSection = (value: string): value is NonLandSection =>
  isOneOf(NON_LAND_SECTIONS, value)
