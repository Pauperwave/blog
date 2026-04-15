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

/**
 * Type definitions for Scryfall API
 */
export type ScryfallImageType = 'normal' | 'large' | 'small' | 'art_crop'

export interface ScryfallParsedCard {
  name: string
  set?: string
  collector_number?: string
}

export interface ScryfallCard {
  name: string
  image_uris?: {
    normal?: string
    large?: string
    small?: string
    art_crop?: string
    png?: string
  }
  card_faces?: Array<{
    image_uris?: {
      normal?: string
      large?: string
      small?: string
      art_crop?: string
      png?: string
    }
  }>
}
