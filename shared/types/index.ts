import type { DeckSection, MainDeckSection } from '../utils/deck-sections'

/**
 * Type definitions for Magic decklist components
 */

export interface CardItem {
  quantity: number
  name: string
  manaCost: string
  imageUrl: string
  backImageUrl?: string
}

export interface ParsedCardLine {
  quantity: number
  name: string
}

/** Which list of a sideboard guide a card belongs to */
export type SideboardGuideSection = 'in' | 'out' | 'out-alt'

export interface SideboardGuideCard {
  quantity: number
  name: string
  section: SideboardGuideSection
  manaCost: string
  imageUrl: string
  backImageUrl?: string
}

export interface ParsedCard {
  quantity: number
  name: string
  section: DeckSection
  manaCost: string
  imageUrl: string
  backImageUrl?: string
  /** Section its type belongs to, set only for sideboard cards (they are not sorted by type) */
  typeSection?: MainDeckSection
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
    name?: string
    image_uris?: {
      normal?: string
      large?: string
      small?: string
      art_crop?: string
      png?: string
    }
  }>
}
