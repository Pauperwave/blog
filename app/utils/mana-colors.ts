/** Italian name and Tailwind classes (fill + readable text) for each mana color */
export const MANA_COLOR_STYLES = {
  W: { name: 'Bianco', fill: 'bg-amber-100 text-gray-900' },
  U: { name: 'Blu', fill: 'bg-blue-600 text-white' },
  B: { name: 'Nero', fill: 'bg-gray-950 text-white' },
  R: { name: 'Rosso', fill: 'bg-red-600 text-white' },
  G: { name: 'Verde', fill: 'bg-green-600 text-white' }
} as const

/** Colors of a card for the curve: one of the five, multicolor (M) or colorless (C) */
export const CURVE_COLOR_STYLES = {
  ...MANA_COLOR_STYLES,
  M: { name: 'Multicolore', fill: 'bg-yellow-500 text-gray-900' },
  C: { name: 'Incolore', fill: 'bg-gray-400 text-gray-900' }
} as const
