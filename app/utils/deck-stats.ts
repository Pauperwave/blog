export interface DeckStatsCard {
  quantity: number
  manaCost: string
}

export interface DeckStats {
  /** Non-land main deck cards per mana value, last bucket is "7+" */
  curve: { label: string; count: number }[]
  /** Color pips in non-land main deck costs, only colors that appear */
  pips: { color: 'W' | 'U' | 'B' | 'R' | 'G'; count: number }[]
  averageManaValue: number
  landCount: number
  mainCount: number
  sideboardCount: number
}

const COLORS = ['W', 'U', 'B', 'R', 'G'] as const
const MAX_CURVE_VALUE = 7

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

const sumQuantities = (cards: DeckStatsCard[] = []) => cards.reduce((total, card) => total + card.quantity, 0)

export function computeDeckStats(cardsBySection: Record<string, DeckStatsCard[]>): DeckStats {
  const nonLandSections = ['Creatures', 'Instants', 'Sorceries', 'Artifacts', 'Enchantments']
  const nonLandCards = nonLandSections.flatMap(section => cardsBySection[section] ?? [])

  const curveCounts = Array.from({ length: MAX_CURVE_VALUE + 1 }, () => 0)
  const pipCounts: Record<string, number> = {}
  let totalManaValue = 0

  for (const card of nonLandCards) {
    const manaValue = parseManaValue(card.manaCost)
    const bucket = Math.min(manaValue, MAX_CURVE_VALUE)
    curveCounts[bucket] = (curveCounts[bucket] ?? 0) + card.quantity
    totalManaValue += manaValue * card.quantity

    for (const [color, count] of Object.entries(countColorPips(card.manaCost))) {
      pipCounts[color] = (pipCounts[color] ?? 0) + count * card.quantity
    }
  }

  const nonLandCount = sumQuantities(nonLandCards)
  const landCount = sumQuantities(cardsBySection['Lands'])

  return {
    curve: curveCounts.map((count, value) => ({
      label: value === MAX_CURVE_VALUE ? `${MAX_CURVE_VALUE}+` : String(value),
      count
    })),
    pips: COLORS.filter(color => pipCounts[color]).map(color => ({ color, count: pipCounts[color] ?? 0 })),
    averageManaValue: nonLandCount ? totalManaValue / nonLandCount : 0,
    landCount,
    mainCount: nonLandCount + landCount,
    sideboardCount: sumQuantities(cardsBySection['Sideboard'])
  }
}
