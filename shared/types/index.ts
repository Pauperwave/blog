/**
 * Type definitions for Magic decklist components
 */

export interface ManaSymbol {
  symbol: string
  svgUri: string
}

export interface CardItem {
  quantity: number
  name: string
  manaCost: string
  manaSymbols: ManaSymbol[]
  imageUrl: string
}

export interface DeckSection {
  heading: string
  count: number
  cards: CardItem[]
}

export interface ParsedCardLine {
  quantity: number
  name: string
}

export interface ParsedCard {
  quantity: number
  name: string
  section: string
  manaCost: string
  imageUrl: string
}