// Pure positioning/filter math for the magic-cards fan/hand layouts, extracted from
// app/components/magic/Cards.vue so it's independently unit-testable. See
// docs/architecture/2026-07-10-magic-cards-component-research.md for how these formulas were
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
// further out and shift right by SPREAD (15% of their own width). The live site also
// lifts the hovered card itself by -18px, but we don't replicate that: moving the
// hovered element's own position under a stationary cursor triggers a mouseleave/
// mouseenter flicker that can permanently steal hover to a neighboring card (same
// class of bug fixed for the `hand` layout's lift in handCardTransform). Highlighting
// relies on the z-index boost + dimming the others instead, neither of which move it.
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
    return `rotate(${scaled}deg)`
  }

  const k = index - hoveredIndex
  const extra = SPREAD * total * (total - 1 - k)
  return `rotate(${scaled + extra}deg) translateX(${SPREAD * 100}%)`
}

// "Hand" config — spotted in the shared magic-cards stylesheet (it's loaded on any page
// with a magic-cards instance, fan or otherwise, since the library bundles every layout
// variant together) while investigating the fan. Unlike fan, cards don't rotate: they
// spread horizontally in steps of 60% of their own width from center. The vertical
// position alternates by 1-based position parity — odd positions (1st, 3rd, 5th, ...)
// sit at the base, even positions (2nd, 4th, ...) are lifted — rather than a symmetric
// arc from the center. Corrected from an initial arc-based reading of two captured
// live points; see docs/architecture/2026-07-10-magic-cards-component-research.md for
// the original (superseded) capture.
const HAND_X_STEP = 60
const HAND_BASE_Y = 65
const HAND_LIFT_Y = 25

export function handPosition(index: number, total: number): { x: number, y: number } {
  const center = (total - 1) / 2
  const offset = index - center
  return {
    x: offset * HAND_X_STEP,
    y: index % 2 === 0 ? HAND_BASE_Y : HAND_LIFT_Y
  }
}

// The hovered card does NOT reposition itself: shifting the hovered element's own
// translateY moves it out from under a stationary cursor, which fires mouseleave,
// snaps it back, re-fires mouseenter, and so on — an infinite hover flicker that
// eventually settles on a neighboring card (whichever ends up stacked on top),
// making the originally-hovered card stop responding until the mouse physically
// moves again. Highlighting is handled by the z-index boost + dimming the others
// instead (see Cards.vue / cardFilter), neither of which move the hovered card.
export function handCardTransform(index: number, total: number): string {
  const { x, y } = handPosition(index, total)
  return `translateX(${x}%) translateY(${y}%)`
}

export function cardTransform(
  index: number,
  total: number,
  layout: 'fan' | 'hand',
  arch: number,
  hoveredIndex: number | null
): string {
  return layout === 'hand'
    ? handCardTransform(index, total)
    : fanCardTransform(index, total, arch, hoveredIndex)
}

export function cardFilter(index: number, hoveredIndex: number | null): string {
  if (hoveredIndex === null || hoveredIndex === index) return 'none'
  const distance = Math.abs(index - hoveredIndex)
  // Must stay <= 1 for every non-hovered card (distance >= 1) — an earlier `1.12 - 0.08 *
  // distance` constant made adjacent cards (distance 1) brighter than normal instead of
  // dimmed, so the "grayed out" effect was invisible/inverted whenever the hovered card's
  // neighbors were all close (e.g. hovering a center card). Clamped so brightness never
  // goes negative (invalid CSS, silently drops the whole filter) on hands/fans with many cards.
  const brightness = Math.max(0.3, 1 - 0.08 * distance)
  return `blur(0.5px) grayscale(0.8) brightness(${brightness})`
}
