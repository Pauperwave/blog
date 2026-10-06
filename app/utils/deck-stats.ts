import {
  LAND_SECTION,
  MAIN_DECK_SECTIONS,
  NON_LAND_SECTIONS,
  type MainDeckSection
} from '#shared/utils'
import {
  COLORS,
  MAX_CURVE_VALUE,
  cardCurveColor,
  countColorPips,
  curveBucket,
  parseManaValue,
  type CurveColor,
  type DeckColor
} from './mana-cost'

export interface DeckStatsCard {
  quantity: number
  manaCost: string
}

export interface DeckStats {
  /** Non-land main deck cards per mana value, last bucket is "7+", split by card color */
  curve: {
    label: string
    count: number
    colors: Partial<Record<CurveColor, number>>
    /** Of the multicolor cards, how many have each color (a card counts once per color) */
    multicolor: Partial<Record<DeckColor, number>>
  }[]
  /** Color pips in non-land main deck costs, only colors that appear */
  pips: { color: DeckColor; count: number }[]
  averageManaValue: number
  landCount: number
  /** Cards per type in the main deck (no sideboard), only types that appear, in section order */
  typeCounts: { section: MainDeckSection; count: number }[]
}

const sumQuantities = (cards: DeckStatsCard[] = []) =>
  cards.reduce((total, card) => total + card.quantity, 0)

export function computeDeckStats(cardsBySection: Record<string, DeckStatsCard[]>): DeckStats {
  const nonLandCards = NON_LAND_SECTIONS.flatMap(section => cardsBySection[section] ?? [])

  const curve: DeckStats['curve'] = Array.from({ length: MAX_CURVE_VALUE + 1 }, (_, value) => ({
    label: value === MAX_CURVE_VALUE ? `${MAX_CURVE_VALUE}+` : String(value),
    count: 0,
    colors: {},
    multicolor: {}
  }))
  const pipCounts: Record<string, number> = {}
  let totalManaValue = 0

  for (const card of nonLandCards) {
    const bucket = curve[curveBucket(card.manaCost)]
    if (bucket) {
      const curveColor = cardCurveColor(card.manaCost)
      bucket.count += card.quantity
      bucket.colors[curveColor] = (bucket.colors[curveColor] ?? 0) + card.quantity

      if (curveColor === 'M') {
        for (const color of Object.keys(countColorPips(card.manaCost)) as DeckColor[]) {
          bucket.multicolor[color] = (bucket.multicolor[color] ?? 0) + card.quantity
        }
      }
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
    pips: COLORS
      .filter(color => pipCounts[color])
      .map(color => ({ color, count: pipCounts[color] ?? 0 })),
    averageManaValue: nonLandCount ? totalManaValue / nonLandCount : 0,
    landCount,
    typeCounts: MAIN_DECK_SECTIONS
      .map(section => ({ section, count: sumQuantities(cardsBySection[section]) }))
      .filter(type => type.count > 0)
  }
}
