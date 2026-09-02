import { describe, it, expect } from 'vitest'
import {
  fanRotation,
  fanCardTransform,
  handPosition,
  handCardTransform,
  cardTransform,
  cardFilter
} from './magic-cards-layout'

// Rotation is floating-point arithmetic embedded in a template string (e.g.
// `rotate(-2.1574999999999998deg)` instead of the mathematically-exact `-2.1575deg`),
// so exact string equality on it is fragile — parse the degree value out and compare
// numerically, leaving the rest of the transform string checked exactly.
function expectRotateTransform(actual: string, expectedDeg: number, expectedSuffix: string) {
  const match = actual.match(/^rotate\(([^)]+)deg\)(.*)$/)
  expect(match).not.toBeNull()
  expect(Number(match![1])).toBeCloseTo(expectedDeg)
  expect(match![2]).toBe(expectedSuffix)
}

describe('magic-cards layout', () => {
  describe('fanRotation', () => {
    it('returns 0 for a single card', () => {
      expect(fanRotation(0, 1, 20.5)).toBe(0)
    })

    it('matches the verified 5-card, arch=20.5 reference values', () => {
      // Captured directly from magic.wizards.com/en/news/making-magic
      expect(fanRotation(0, 5, 20.5)).toBeCloseTo(-8.2)
      expect(fanRotation(1, 5, 20.5)).toBeCloseTo(-4.1)
      expect(fanRotation(2, 5, 20.5)).toBeCloseTo(0)
      expect(fanRotation(3, 5, 20.5)).toBeCloseTo(4.1)
      expect(fanRotation(4, 5, 20.5)).toBeCloseTo(8.2)
    })

    it('converges toward arch as more cards are added, rather than growing past it', () => {
      const spread = (total: number) => fanRotation(total - 1, total, 20.5) - fanRotation(0, total, 20.5)
      expect(spread(3)).toBeLessThan(20.5)
      expect(spread(10)).toBeLessThan(20.5)
      expect(spread(10)).toBeGreaterThan(spread(3))
    })

    it('is symmetric around the center card', () => {
      expect(fanRotation(0, 5, 20.5)).toBeCloseTo(-fanRotation(4, 5, 20.5))
      expect(fanRotation(2, 5, 20.5)).toBe(0)
    })
  })

  describe('fanCardTransform', () => {
    it('applies plain rotation with no hover state', () => {
      expect(fanCardTransform(0, 5, 20.5, null)).toBe('rotate(-8.2deg)')
    })

    it('matches verified hover values for the leftmost card hovered (index 0 of 5)', () => {
      // Captured directly from magic.wizards.com while hovering the leftmost card.
      expect(fanCardTransform(0, 5, 20.5, 0)).toBe('rotate(-8.815deg) translateY(-18px)')
      expectRotateTransform(fanCardTransform(1, 5, 20.5, 0), -2.1575, ' translateX(15%)')
      expect(fanCardTransform(2, 5, 20.5, 0)).toBe('rotate(1.5deg) translateX(15%)')
      expectRotateTransform(fanCardTransform(3, 5, 20.5, 0), 5.1575, ' translateX(15%)')
      expect(fanCardTransform(4, 5, 20.5, 0)).toBe('rotate(8.815deg) translateX(15%)')
    })

    it('matches verified hover values for the center card hovered (index 2 of 5)', () => {
      expect(fanCardTransform(0, 5, 20.5, 2)).toBe('rotate(-8.815deg) translateY(0px)')
      expect(fanCardTransform(1, 5, 20.5, 2)).toBe('rotate(-4.4075deg) translateY(0px)')
      expect(fanCardTransform(2, 5, 20.5, 2)).toBe('rotate(0deg) translateY(-18px)')
      expect(fanCardTransform(3, 5, 20.5, 2)).toBe('rotate(6.6575deg) translateX(15%)')
      expect(fanCardTransform(4, 5, 20.5, 2)).toBe('rotate(10.315deg) translateX(15%)')
    })

    it('matches verified hover values for the rightmost card hovered (index 4 of 5)', () => {
      expect(fanCardTransform(0, 5, 20.5, 4)).toBe('rotate(-8.815deg) translateY(0px)')
      expect(fanCardTransform(1, 5, 20.5, 4)).toBe('rotate(-4.4075deg) translateY(0px)')
      expect(fanCardTransform(2, 5, 20.5, 4)).toBe('rotate(0deg) translateY(0px)')
      expect(fanCardTransform(3, 5, 20.5, 4)).toBe('rotate(4.4075deg) translateY(0px)')
      expect(fanCardTransform(4, 5, 20.5, 4)).toBe('rotate(8.815deg) translateY(-18px)')
    })
  })

  describe('handPosition', () => {
    it('places odd 1-based positions (0-based even index) at the base', () => {
      expect(handPosition(0, 5)).toEqual({ x: -120, y: 65 })
      expect(handPosition(2, 5)).toEqual({ x: 0, y: 65 })
      expect(handPosition(4, 5)).toEqual({ x: 120, y: 65 })
    })

    it('lifts even 1-based positions (0-based odd index)', () => {
      expect(handPosition(1, 5)).toEqual({ x: -60, y: 25 })
      expect(handPosition(3, 5)).toEqual({ x: 60, y: 25 })
    })

    it('is symmetric around the center card on x', () => {
      const left = handPosition(0, 5)
      const right = handPosition(4, 5)
      expect(left.x).toBe(-right.x)
    })
  })

  describe('handCardTransform', () => {
    it('matches handPosition, unaffected by hover', () => {
      // The hovered card must not reposition itself: moving it under a stationary
      // cursor triggers a mouseleave/mouseenter flicker that can permanently steal
      // hover to a neighboring card. See the comment on handCardTransform.
      expect(handCardTransform(0, 5)).toBe('translateX(-120%) translateY(65%)')
      expect(handCardTransform(1, 5)).toBe('translateX(-60%) translateY(25%)')
    })
  })

  describe('cardTransform (layout dispatch)', () => {
    it('delegates to fan formula by default', () => {
      expect(cardTransform(0, 5, 'fan', 20.5, null)).toBe(fanCardTransform(0, 5, 20.5, null))
    })

    it('delegates to hand formula when layout is hand', () => {
      expect(cardTransform(0, 5, 'hand', 20.5, null)).toBe(handCardTransform(0, 5))
    })
  })

  describe('cardFilter', () => {
    it('is none when nothing is hovered', () => {
      expect(cardFilter(0, null)).toBe('none')
    })

    it('is none for the hovered card itself', () => {
      expect(cardFilter(2, 2)).toBe('none')
    })

    it('fades brightness by distance from the hovered card, never brighter than normal', () => {
      const brightnessOf = (filter: string) => Number(filter.match(/brightness\(([^)]+)\)/)![1])
      expect(cardFilter(1, 0)).toMatch(/^blur\(0\.5px\) grayscale\(0\.8\) brightness\(/)
      expect(brightnessOf(cardFilter(1, 0))).toBeCloseTo(0.92)
      expect(brightnessOf(cardFilter(2, 0))).toBeCloseTo(0.84)
      expect(brightnessOf(cardFilter(3, 0))).toBeCloseTo(0.76)
      expect(brightnessOf(cardFilter(4, 0))).toBeCloseTo(0.68)
    })

    it('clamps brightness so it never goes negative (invalid CSS) on large card counts', () => {
      const brightnessOf = (filter: string) => Number(filter.match(/brightness\(([^)]+)\)/)![1])
      expect(brightnessOf(cardFilter(20, 0))).toBe(0.3)
    })

    it('is symmetric around the hovered card', () => {
      expect(cardFilter(0, 2)).toBe(cardFilter(4, 2))
      expect(cardFilter(1, 2)).toBe(cardFilter(3, 2))
    })
  })
})
