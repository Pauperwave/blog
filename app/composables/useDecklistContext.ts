import type { InjectionKey } from 'vue'
import type { ManaCombination } from '~/components/magic/card/ManaSymbol.vue'

export interface DecklistSwipeCard {
  name: string
  section: string
  quantity: number
  imageUrl: string
  backImageUrl?: string
}

export interface DecklistContext {
  header: {
    name: string
    player?: string
    placement?: string
    headerGradient?: ManaCombination
  }
  /** Unique cards per section, in list order */
  cards: DecklistSwipeCard[]
}

const DECKLIST_CONTEXT_KEY: InjectionKey<ComputedRef<DecklistContext>> = Symbol('decklistContext')

export const provideDecklistContext = (context: ComputedRef<DecklistContext>) => provide(DECKLIST_CONTEXT_KEY, context)

export const injectDecklistContext = () => inject(DECKLIST_CONTEXT_KEY, null)
