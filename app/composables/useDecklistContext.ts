import type { InjectionKey } from 'vue'
import type { ManaCombination } from '~/components/magic/card/ManaSymbol.vue'

export interface DecklistSwipeCard {
  name: string
  section: string
  quantity: number
  imageUrl: string
  backImageUrl?: string
}

export interface DecklistHeaderInfo {
  name: string
  player?: string
  placement?: string
  headerGradient?: ManaCombination
}

export interface DecklistContext {
  /** Opens the card viewer on the given card: swipeable modal on mobile, deck overlay on desktop */
  openCard: (name: string, section: string) => void
}

const DECKLIST_CONTEXT_KEY: InjectionKey<DecklistContext> = Symbol('decklistContext')

export const provideDecklistContext = (context: DecklistContext) => provide(DECKLIST_CONTEXT_KEY, context)

export const injectDecklistContext = () => inject(DECKLIST_CONTEXT_KEY, null)
