import {
  SIDEBOARD_SECTION,
  isNonLandSection,
  type DeckSection,
  type MainDeckSection
} from '#shared/utils'
import { countColorPips, curveBucket, type DeckColor } from './mana-cost'

/** The part of the deck a hovered stat stands for: a card type, a curve bucket or a color. */
export type DeckHighlight =
  | { kind: 'type'; section: MainDeckSection }
  | { kind: 'curve'; bucket: number }
  | { kind: 'color'; color: DeckColor }

export type HighlightState = 'match' | 'dim' | 'neutral'

/**
 * Spells whose cost counts for curve and colors: non-land main deck cards and sideboard cards
 * with a cost (the sideboard has no lands list).
 */
const hasCountedCost = (card: { section: DeckSection; manaCost: string }) =>
  isNonLandSection(card.section)
  || (card.section === SIDEBOARD_SECTION && card.manaCost !== '')

/** How a card looks while a stat is hovered: part of it, not part of it, or unknown. */
export function highlightState(
  card: { section: DeckSection; manaCost: string; type?: MainDeckSection },
  highlight: DeckHighlight
): HighlightState {
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
