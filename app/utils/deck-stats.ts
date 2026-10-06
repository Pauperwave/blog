import { LAND_SECTION, MAIN_DECK_SECTIONS, NON_LAND_SECTIONS } from '#shared/utils'

export interface DeckStatsCard {
  quantity: number
  manaCost: string
}

export interface DeckStats {
  /** Non-land main deck cards per mana value, last bucket is "7+" */
  curve: { label: string; count: number }[]
  /** Color pips in non-land main deck costs, only colors that appear */
  pips: { color: DeckColor; count: number }[]
  averageManaValue: number
  landCount: number
  /** Cards per type in the main deck (sideboard excluded), only types that appear, in section order */
  typeCounts: { section: string; count: number }[]
}

const COLORS = ['W', 'U', 'B', 'R', 'G'] as const
const MAX_CURVE_VALUE = 7

export type DeckColor = typeof COLORS[number]

/** The part of the deck a hovered stat stands for: a card type, a curve bucket or a color. */
export type DeckHighlight =
  | { kind: 'type'; section: string }
  | { kind: 'curve'; bucket: number }
  | { kind: 'color'; color: DeckColor }

/** Mana value of a cost like "{2}{U}{U}"; split/DFC costs ("{1}{R} // {2}{U}") use the first face. */
export function parseManaValue(manaCost: string): number {
  const firstFace = manaCost.split(' // ')[0] ?? ''
  const symbols = firstFace.match(/\{[^}]+\}/g) ?? []

  return symbols.reduce((total, symbol) => {
    const content = symbol.slice(1, -1)
    if (/^\d+$/.test(content)) return total + Number(content)
    if (/^[XYZ]$/.test(content)) return total
    // Hybrid with a generic part ({2/W}) is worth that number, any other symbol is worth 1
    const generic = content.match(/^(\d+)\//)
    return total + (generic ? Number(generic[1]) : 1)
  }, 0)
}

/** Colored pips of a cost, hybrid symbols count once for each color they contain. */
export function countColorPips(manaCost: string): Record<string, number> {
  const firstFace = manaCost.split(' // ')[0] ?? ''
  const pips: Record<string, number> = {}

  for (const symbol of firstFace.match(/\{[^}]+\}/g) ?? []) {
    for (const color of symbol.match(/[WUBRG]/g) ?? []) {
      pips[color] = (pips[color] ?? 0) + 1
    }
  }

  return pips
}

/** Curve bucket of a cost: its mana value, capped at the last ("7+") bucket. */
const curveBucket = (manaCost: string) => Math.min(parseManaValue(manaCost), MAX_CURVE_VALUE)

/** Whether a card is part of what the highlight stands for; curve and colors only cover non-land main deck cards, like the stats. */
export function matchesHighlight(card: { section: string; manaCost: string }, highlight: DeckHighlight): boolean {
  if (highlight.kind === 'type') return card.section === highlight.section
  if (!(NON_LAND_SECTIONS as readonly string[]).includes(card.section)) return false
  if (highlight.kind === 'curve') return curveBucket(card.manaCost) === highlight.bucket
  return highlight.color in countColorPips(card.manaCost)
}

const sumQuantities = (cards: DeckStatsCard[] = []) => cards.reduce((total, card) => total + card.quantity, 0)

export function computeDeckStats(cardsBySection: Record<string, DeckStatsCard[]>): DeckStats {
  const nonLandCards = NON_LAND_SECTIONS.flatMap(section => cardsBySection[section] ?? [])

  const curveCounts = Array.from({ length: MAX_CURVE_VALUE + 1 }, () => 0)
  const pipCounts: Record<string, number> = {}
  let totalManaValue = 0

  for (const card of nonLandCards) {
    const manaValue = parseManaValue(card.manaCost)
    const bucket = curveBucket(card.manaCost)
    curveCounts[bucket] = (curveCounts[bucket] ?? 0) + card.quantity
    totalManaValue += manaValue * card.quantity

    for (const [color, count] of Object.entries(countColorPips(card.manaCost))) {
      pipCounts[color] = (pipCounts[color] ?? 0) + count * card.quantity
    }
  }

  const nonLandCount = sumQuantities(nonLandCards)
  const landCount = sumQuantities(cardsBySection[LAND_SECTION])

  return {
    curve: curveCounts.map((count, value) => ({
      label: value === MAX_CURVE_VALUE ? `${MAX_CURVE_VALUE}+` : String(value),
      count
    })),
    pips: COLORS.filter(color => pipCounts[color]).map(color => ({ color, count: pipCounts[color] ?? 0 })),
    averageManaValue: nonLandCount ? totalManaValue / nonLandCount : 0,
    landCount,
    typeCounts: MAIN_DECK_SECTIONS
      .map(section => ({ section, count: sumQuantities(cardsBySection[section]) }))
      .filter(type => type.count > 0)
  }
}
