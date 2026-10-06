import { LAND_SECTION, MAIN_DECK_SECTIONS, NON_LAND_SECTIONS, SIDEBOARD_SECTION } from '#shared/utils'
import { CURVE_COLOR_STYLES } from './mana-colors'

export interface DeckStatsCard {
  quantity: number
  manaCost: string
}

export interface DeckStats {
  /** Non-land main deck cards per mana value, last bucket is "7+", split by card color */
  curve: { label: string; count: number; colors: Partial<Record<CurveColor, number>> }[]
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

/** Color of a card for the curve: one of the five, multicolor (M) or colorless (C). */
export type CurveColor = DeckColor | 'M' | 'C'

/** Order of the segments in a curve bar, bottom to top. */
export const CURVE_COLORS: readonly CurveColor[] = [...COLORS, 'M', 'C']

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

/** The colored segments of a curve column, bottom to top, only the colors that appear. */
export function curveSegments(colors: Partial<Record<CurveColor, number>>) {
  return CURVE_COLORS
    .map(color => ({ color, count: colors[color] ?? 0, ...CURVE_COLOR_STYLES[color] }))
    .filter(segment => segment.count > 0)
}

/** Color of a card from its cost: hybrid symbols count for both their colors, so they make it multicolor. */
export function cardCurveColor(manaCost: string): CurveColor {
  const colors = Object.keys(countColorPips(manaCost)) as DeckColor[]
  if (colors.length > 1) return 'M'
  return colors[0] ?? 'C'
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

export type HighlightState = 'match' | 'dim' | 'neutral'

/** Spells whose cost counts for curve and colors: non-land main deck cards and sideboard cards with a cost (the sideboard has no lands list). */
const hasCountedCost = (card: { section: string; manaCost: string }) =>
  (NON_LAND_SECTIONS as readonly string[]).includes(card.section)
  || (card.section === SIDEBOARD_SECTION && card.manaCost !== '')

/** How a card looks while a stat is hovered: part of it, not part of it, or unknown. */
export function highlightState(card: { section: string; manaCost: string; type?: string }, highlight: DeckHighlight): HighlightState {
  if (highlight.kind === 'type') {
    // A sideboard card whose type is unknown (no type line in the database) is left alone
    if (!card.type) return 'neutral'
    return card.type === highlight.section ? 'match' : 'dim'
  }

  if (!hasCountedCost(card)) return 'dim'
  const matches = highlight.kind === 'curve'
    ? curveBucket(card.manaCost) === highlight.bucket
    : highlight.color in countColorPips(card.manaCost)
  return matches ? 'match' : 'dim'
}

const sumQuantities = (cards: DeckStatsCard[] = []) => cards.reduce((total, card) => total + card.quantity, 0)

export function computeDeckStats(cardsBySection: Record<string, DeckStatsCard[]>): DeckStats {
  const nonLandCards = NON_LAND_SECTIONS.flatMap(section => cardsBySection[section] ?? [])

  const curve: DeckStats['curve'] = Array.from({ length: MAX_CURVE_VALUE + 1 }, (_, value) => ({
    label: value === MAX_CURVE_VALUE ? `${MAX_CURVE_VALUE}+` : String(value),
    count: 0,
    colors: {}
  }))
  const pipCounts: Record<string, number> = {}
  let totalManaValue = 0

  for (const card of nonLandCards) {
    const bucket = curve[curveBucket(card.manaCost)]
    if (bucket) {
      const curveColor = cardCurveColor(card.manaCost)
      bucket.count += card.quantity
      bucket.colors[curveColor] = (bucket.colors[curveColor] ?? 0) + card.quantity
    }
    totalManaValue += parseManaValue(card.manaCost) * card.quantity

    for (const [color, count] of Object.entries(countColorPips(card.manaCost))) {
      pipCounts[color] = (pipCounts[color] ?? 0) + count * card.quantity
    }
  }

  const nonLandCount = sumQuantities(nonLandCards)
  const landCount = sumQuantities(cardsBySection[LAND_SECTION])

  return {
    curve,
    pips: COLORS.filter(color => pipCounts[color]).map(color => ({ color, count: pipCounts[color] ?? 0 })),
    averageManaValue: nonLandCount ? totalManaValue / nonLandCount : 0,
    landCount,
    typeCounts: MAIN_DECK_SECTIONS
      .map(section => ({ section, count: sumQuantities(cardsBySection[section]) }))
      .filter(type => type.count > 0)
  }
}
