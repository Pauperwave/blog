/**
 * Type definitions for Magic decklist components
 */

export interface CardItem {
  quantity: number
  name: string
  manaCost: string
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