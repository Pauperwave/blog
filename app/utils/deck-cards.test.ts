import { describe, it, expect } from 'vitest'
import { expandCopies, lastCopyIndexes, uniqueDeckCards } from './deck-cards'

const sections = ['Creatures', 'Instants', 'Sideboard'] as const

describe('uniqueDeckCards', () => {
  it('follows the given section order, not the order of the keys', () => {
    const cardsBySection = {
      Sideboard: [{ name: 'Pyroblast', quantity: 2, imageUrl: 'pyroblast.jpg' }],
      Creatures: [{ name: 'Guttersnipe', quantity: 4, imageUrl: 'guttersnipe.jpg' }]
    }
    expect(uniqueDeckCards(cardsBySection, sections).map(card => card.name))
      .toEqual(['Guttersnipe', 'Pyroblast'])
  })

  it('keeps quantity, section and back image', () => {
    const cardsBySection = {
      Creatures: [{ name: 'Delver', quantity: 3, imageUrl: 'front.jpg', backImageUrl: 'back.jpg' }]
    }
    expect(uniqueDeckCards(cardsBySection, sections)).toEqual([
      {
        name: 'Delver',
        section: 'Creatures',
        quantity: 3,
        imageUrl: 'front.jpg',
        backImageUrl: 'back.jpg',
        manaCost: '',
        type: 'Creatures'
      }
    ])
  })

  it('takes the type of a sideboard card from its type section, unknown if missing', () => {
    const cardsBySection: Parameters<typeof uniqueDeckCards>[0] = {
      Sideboard: [
        { name: 'Pyroblast', quantity: 2, imageUrl: 'pyroblast.jpg', typeSection: 'Instants' },
        { name: 'Mystery', quantity: 1, imageUrl: 'mystery.jpg' }
      ]
    }
    expect(uniqueDeckCards(cardsBySection, sections).map(card => card.type))
      .toEqual(['Instants', undefined])
  })

  it('gives one entry per section for a card in main deck and sideboard', () => {
    const card = { name: 'Pyroblast', quantity: 2, imageUrl: 'pyroblast.jpg' }
    const result = uniqueDeckCards({ Instants: [card], Sideboard: [card] }, sections)
    expect(result.map(entry => entry.section)).toEqual(['Instants', 'Sideboard'])
  })

  it('keeps the first of a card repeated in the same section', () => {
    const cardsBySection = {
      Creatures: [
        { name: 'Guttersnipe', quantity: 2, imageUrl: 'a.jpg' },
        { name: 'Guttersnipe', quantity: 1, imageUrl: 'a.jpg' }
      ]
    }
    expect(uniqueDeckCards(cardsBySection, sections).map(card => card.quantity)).toEqual([2])
  })

  it('skips cards without an image and sections that are not listed', () => {
    const cardsBySection = {
      Creatures: [{ name: 'No image', quantity: 1, imageUrl: '' }],
      Lands: [{ name: 'Island', quantity: 10, imageUrl: 'island.jpg' }]
    }
    expect(uniqueDeckCards(cardsBySection, sections)).toEqual([])
  })
})

describe('expandCopies', () => {
  it('repeats each card once per copy, keeping the order', () => {
    const bolt = { name: 'Lightning Bolt', quantity: 3 }
    const snipe = { name: 'Guttersnipe', quantity: 1 }
    expect(expandCopies([bolt, snipe]).map(card => card.name))
      .toEqual(['Lightning Bolt', 'Lightning Bolt', 'Lightning Bolt', 'Guttersnipe'])
  })

  it('returns an empty list for no cards', () => {
    expect(expandCopies([])).toEqual([])
  })
})

describe('lastCopyIndexes', () => {
  const card = (name: string) => ({ name })

  it('marks the last copy of each card in one pile', () => {
    const pile = [card('Bolt'), card('Bolt'), card('Snipe'), card('Bolt')]
    expect(lastCopyIndexes([pile])).toEqual([new Set([2, 3])])
  })

  it('marks it in the pile where the last copy is when a card spans two piles', () => {
    const piles = [
      [card('Bolt'), card('Snipe'), card('Bolt'), card('Bolt')],
      [card('Bolt'), card('Chart')]
    ]
    expect(lastCopyIndexes(piles)).toEqual([new Set([1]), new Set([0, 1])])
  })

  it('matches a double-faced card by its front face', () => {
    const piles = [[card('Delver of Secrets // Insectile Aberration'), card('Delver of Secrets')]]
    expect(lastCopyIndexes(piles)).toEqual([new Set([1])])
  })

  it('gives an empty set per pile when there are no cards', () => {
    expect(lastCopyIndexes([[], []])).toEqual([new Set(), new Set()])
  })
})
