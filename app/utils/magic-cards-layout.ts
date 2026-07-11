// Pure positioning/filter math for the magic-cards fan/hand layouts, extracted from
// app/components/magic/Cards.vue so it's independently unit-testable. See
// docs/2026-07-10-magic-cards-component-research.md for how these formulas were
// reverse-engineered from magic.wizards.com.

const SPREAD = 0.15

// Mirrors magic.wizards.com/en/news/making-magic's fan component: the step between
// adjacent cards is arch/count (not arch/(count-1)), so the total spread converges
// toward `arch` as more cards are added instead of growing past it.
export function fanRotation(index: number, total: number, arch: number): number {
  if (total <= 1) return 0
  const step = arch / total
  const center = (total - 1) / 2
  return (index - center) * step
}

// Hover behavior captured directly from magic.wizards.com/en/news/making-magic's live
// fan component. Every observed value derives from one constant, SPREAD = 0.15: cards
// stacked UNDER the hovered one (index <= hoveredIndex, since a later DOM index paints
// on top) get a mild uniform rotation amplification; cards stacked ON TOP of it
// (index > hoveredIndex) have to visibly move aside to reveal it, so they rotate
// further out and shift right by SPREAD (15% of their own width). The hovered card
// itself follows the "under" formula too, plus a -18px lift.
export function fanCardTransform(
  index: number,
  total: number,
  arch: number,
  hoveredIndex: number | null
): string {
  const base = fanRotation(index, total, arch)

  if (hoveredIndex === null) return `rotate(${base}deg)`

  const scaled = base * (1 + SPREAD / 2)

  if (index <= hoveredIndex) {
    const lift = index === hoveredIndex ? -18 : 0
    return `rotate(${scaled}deg) translateY(${lift}px)`
  }

  const k = index - hoveredIndex
  const extra = SPREAD * total * (total - 1 - k)
  return `rotate(${scaled + extra}deg) translateX(${SPREAD * 100}%)`
}

// "Hand" config — spotted in the shared magic-cards stylesheet (it's loaded on any page
// with a magic-cards instance, fan or otherwise, since the library bundles every layout
// variant together) while investigating the fan. Unlike fan, cards don't rotate: they
// spread horizontally in steps of 60% of their own width from center, and rise into a
// shallow arc — the center card sits lowest/frontmost, edges recede upward. Only two of
// five slots were captured live before this session moved on (index 0 of 5:
// translateX(-120%) translateY(25%); index 1: translateX(-60%) translateY(45%), and its
// :hover state translateY(15%)). The rest here is extrapolated from that pattern (linear
// 60%-per-step X, symmetric triangular Y arc, -10pp lift on hover) — NOT independently
// re-verified against the live page, and the step values are only confirmed for a 5-card
// hand specifically.
const HAND_X_STEP = 60
const HAND_PEAK_Y = 65
const HAND_Y_STEP = 20

export function handPosition(index: number, total: number): { x: number, y: number } {
  const center = (total - 1) / 2
  const offset = index - center
  return {
    x: offset * HAND_X_STEP,
    y: HAND_PEAK_Y - HAND_Y_STEP * Math.abs(offset)
  }
}

export function handCardTransform(index: number, total: number, hoveredIndex: number | null): string {
  const { x, y } = handPosition(index, total)
  const lift = hoveredIndex === index ? y - 10 : y
  return `translateX(${x}%) translateY(${lift}%)`
}

export function cardTransform(
  index: number,
  total: number,
  layout: 'fan' | 'hand',
  arch: number,
  hoveredIndex: number | null
): string {
  return layout === 'hand'
    ? handCardTransform(index, total, hoveredIndex)
    : fanCardTransform(index, total, arch, hoveredIndex)
}

export function cardFilter(index: number, hoveredIndex: number | null): string {
  if (hoveredIndex === null || hoveredIndex === index) return 'none'
  const distance = Math.abs(index - hoveredIndex)
  const brightness = 1.12 - 0.08 * distance
  return `blur(0.5px) grayscale(0.8) brightness(${brightness})`
}
