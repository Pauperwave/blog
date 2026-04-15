import type { ManaCombination } from '~/components/magic/card/ManaSymbol.vue'

const GRADIENT_CLASSES: Record<ManaCombination, string> = {
  // Mono colors
  monowhite: 'bg-gradient-to-r from-amber-100 via-amber-100 to-transparent',
  monoblue: 'bg-gradient-to-r from-blue-600 via-blue-600 to-transparent',
  monoblack: 'bg-gradient-to-r from-gray-950 via-gray-950 to-transparent',
  monored: 'bg-gradient-to-r from-red-600 via-red-600 to-transparent',
  monogreen: 'bg-gradient-to-r from-green-600 via-green-600 to-transparent',
  colorless: 'bg-gradient-to-r from-gray-300 via-gray-300 to-transparent',

  // Two-color combinations (Ally colors - adiacenti nel cerchio di mana)
  azorius: 'bg-gradient-to-r from-amber-100 to-blue-600',
  dimir: 'bg-gradient-to-r from-blue-600 to-gray-950',
  rakdos: 'bg-gradient-to-r from-gray-950 to-red-600',
  gruul: 'bg-gradient-to-r from-red-600 to-green-600',
  selesnya: 'bg-gradient-to-r from-green-600 to-amber-100',

  // Two-color combinations (Enemy colors - opposti nel cerchio di mana)
  orzhov: 'bg-gradient-to-r from-amber-100 to-gray-950',
  golgari: 'bg-gradient-to-r from-gray-950 to-green-600',
  simic: 'bg-gradient-to-r from-green-600 to-blue-600',
  izzet: 'bg-gradient-to-r from-blue-600 to-red-600',
  boros: 'bg-gradient-to-r from-red-600 to-amber-100',

  // Three-color combinations (Shards)
  esper: 'bg-gradient-to-r from-amber-100 via-blue-600 to-gray-950',
  grixis: 'bg-gradient-to-r from-blue-600 via-gray-950 to-red-600',
  jund: 'bg-gradient-to-r from-gray-950 via-red-600 to-green-600',
  naya: 'bg-gradient-to-r from-red-600 via-green-600 to-amber-100',
  bant: 'bg-gradient-to-r from-green-600 via-amber-100 to-blue-600',

  // Three-color combinations (Wedges)
  mardu: 'bg-gradient-to-r from-amber-100 via-gray-950 to-red-600',
  temur: 'bg-gradient-to-r from-blue-600 via-red-600 to-green-600',
  sultai: 'bg-gradient-to-r from-gray-950 via-green-600 to-blue-600',
  jeskai: 'bg-gradient-to-r from-red-600 via-amber-100 to-blue-600',
  abzan: 'bg-gradient-to-r from-amber-100 via-gray-950 to-green-600'
}

// Heading/Subheading con testo chiaro in dark mode
const LIGHT_TEXT = new Set<ManaCombination>([
  'monoblue', 'monoblack', 'monored', 'monogreen', 'gruul',
  'dimir', 'izzet', 'selesnya', 'boros', 'simic', 'sultai', 'jeskai', 'bant',
  'golgari', 'rakdos', 'grixis', 'jund', 'temur', 'naya'
])

// Mono colori: scuro in light mode, chiaro in dark mode
const MONO_PLACEMENT = new Set<ManaCombination>([
  'monowhite', 'monoblue', 'monoblack', 'monored', 'monogreen', 'colorless'
])

// Placement scuro in entrambe le modalità
// Note: boros, selesnya, naya use light heading text but dark placement text
const DARK_PLACEMENT = new Set<ManaCombination>([
  'boros', 'selesnya', 'naya'
])

/**
 * Composable for decklist styling based on mana combination
 *
 * Provides gradient classes and text color classes for decklist headers
 * based on the mana combination (color identity) of the deck.
 *
 * @param headerGradient - Optional mana combination for gradient styling
 * @returns Object containing:
 *   - headerClass: Gradient class for header background
 *   - textClasses: Object with heading, subheading, and placement text classes
 *
 * @example
 * ```ts
 * const { headerClass, textClasses } = useDecklistStyles('boros')
 * ```
 */
export function useDecklistStyles(headerGradient?: ManaCombination) {
  const headerClass = headerGradient ? GRADIENT_CLASSES[headerGradient] : undefined

  const textClasses = computed(() => {
    const hg = headerGradient

    const lightText = hg && LIGHT_TEXT.has(hg)

    const placement = !hg || DARK_PLACEMENT.has(hg)
      ? 'text-gray-900'
      : MONO_PLACEMENT.has(hg)
        ? 'text-gray-900 dark:text-gray-100'
        : 'text-gray-100'

    return {
      heading: lightText ? 'text-gray-100' : 'text-gray-900',
      subheading: lightText ? 'text-gray-300' : 'text-gray-700',
      placement
    }
  })

  return { headerClass, textClasses }
}
