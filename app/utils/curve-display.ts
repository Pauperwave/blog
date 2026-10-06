import type { DeckStats } from './deck-stats'
import { CURVE_COLOR_STYLES } from './mana-colors'
import { CURVE_COLORS, type DeckColor } from './mana-cost'

/**
 * The colored segments of a curve column, bottom to top, only the colors that appear.
 * With a highlighted color, the segments of the other colors are dimmed and the multicolor one
 * splits
 * into the cards that have the color and the ones that don't.
 */
export function curveSegments(
  bucket: Pick<DeckStats['curve'][number], 'colors' | 'multicolor'>,
  highlightColor: DeckColor | null = null
) {
  return CURVE_COLORS.flatMap((color) => {
    const count = bucket.colors[color] ?? 0
    const style = CURVE_COLOR_STYLES[color]

    if (color === 'M' && highlightColor) {
      const matching = bucket.multicolor[highlightColor] ?? 0
      return [
        { color, count: matching, dimmed: false, ...style },
        { color, count: count - matching, dimmed: true, ...style }
      ].filter(segment => segment.count > 0)
    }

    if (count === 0) return []
    return [{ color, count, dimmed: highlightColor !== null && color !== highlightColor, ...style }]
  })
}

/** The colors that appear in at least one column of the curve, in color order, for a legend. */
export function curveLegend(curve: DeckStats['curve']) {
  return CURVE_COLORS
    .filter(color => curve.some(bucket => (bucket.colors[color] ?? 0) > 0))
    .map(color => ({ color, ...CURVE_COLOR_STYLES[color] }))
}

/** Tooltip of a curve column: its cost, how many cards and the split by color. */
export function curveTooltip(bucket: DeckStats['curve'][number]): string {
  const breakdown = curveSegments(bucket)
    .map(segment => `${segment.name} ${segment.count}`)
    .join(', ')
  return `Costo ${bucket.label}: ${bucket.count}${breakdown ? ` (${breakdown})` : ''}`
}
