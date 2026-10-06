export const COLORS = ['W', 'U', 'B', 'R', 'G'] as const
export const MAX_CURVE_VALUE = 7

export type DeckColor = typeof COLORS[number]

/** Color of a card for the curve: one of the five, multicolor (M) or colorless (C). */
export type CurveColor = DeckColor | 'M' | 'C'

/** Order of the segments in a curve bar, bottom to top. */
export const CURVE_COLORS: readonly CurveColor[] = [...COLORS, 'M', 'C']

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

/** Color of a card from its cost: hybrid symbols count for both their colors, so they make it multicolor. */
export function cardCurveColor(manaCost: string): CurveColor {
  const colors = Object.keys(countColorPips(manaCost)) as DeckColor[]
  if (colors.length > 1) return 'M'
  return colors[0] ?? 'C'
}

/** Curve bucket of a cost: its mana value, capped at the last ("7+") bucket. */
export const curveBucket = (manaCost: string) => Math.min(parseManaValue(manaCost), MAX_CURVE_VALUE)
