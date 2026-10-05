<script setup lang="ts">
import { injectDecklistContext } from '~/composables/useDecklistContext'
import { useDecklistStyles } from '~/composables/useDecklistStyles'

interface Props {
  name: string
  image?: string
  /** Second face's image, for transform/modal double-faced cards. A button below the preview toggles it in the modal. */
  backImage?: string
  /** Scryfall set code — when given, `image` is resolved to that specific printing. */
  set?: string
  /** Decklist section the card sits in — tells apart the same card in main deck and sideboard. */
  section?: string
}

const { name, image = '', backImage = '', set = '', section = '' } = defineProps<Props>()

const cardLabel = computed(() => set ? `${name} (${set})` : name)

const tooltipOpen = ref(false)
const anchor = ref({ x: 0, y: 0 })
const showModal = ref(false)

// Composables
const { isMobile } = useDevice()

// Provided by Decklist: deck header + cards the mobile modal can swipe through
const deck = injectDecklistContext()
const swipeStartIndex = computed(() =>
  deck?.value.cards.findIndex(card => card.name === name && (!section || card.section === section)) ?? -1
)
const currentIndex = ref(swipeStartIndex.value)
const currentCard = computed(() => deck?.value.cards[currentIndex.value])
const { headerClass } = useDecklistStyles(deck?.value.header.headerGradient)

const reference = computed(() => ({
  getBoundingClientRect: () => ({
    width: 0,
    height: 0,
    left: anchor.value.x,
    right: anchor.value.x,
    top: anchor.value.y,
    bottom: anchor.value.y,
    ...anchor.value
  } as DOMRect)
}))

const handlePointerEnter = (ev: PointerEvent) => {
  if (!isMobile) {
    anchor.value = { x: ev.clientX, y: ev.clientY }
    tooltipOpen.value = true
  }
}

const handlePointerLeave = () => {
  if (!isMobile) tooltipOpen.value = false
}

const handlePointerMove = (ev: PointerEvent) => {
  if (!isMobile) anchor.value = { x: ev.clientX, y: ev.clientY }
}

const handleClick = () => {
  tooltipOpen.value = false
  showModal.value = true
}

</script>

<template>
  <UTooltip
    v-model:open="tooltipOpen"
    :disabled="isMobile"
    :arrow="false"
    :delay-duration="100"
    :reference="reference"
    :content="{
      align: 'start',
      side: 'right',
      sideOffset: 10,
      updatePositionStrategy: 'always'
    }"
    :ui="{
      content: 'bg-transparent border-0 shadow-none p-0'
    }"
  >
    <span
      class="font-semibold text-primary cursor-pointer"
      :class="{ underline: isMobile }"
      role="button"
      :aria-label="`View ${cardLabel} card image`"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
      @pointermove="handlePointerMove"
      @click="handleClick"
    >
      {{ name }}
    </span>

    <template #content>
      <img
        :src="image"
        :alt="cardLabel"
        class="w-70 h-auto rounded-xl"
      >
    </template>
  </UTooltip>

  <!-- Card modal: tap on mobile, click on desktop -->
  <UModal
    v-model:open="showModal"
    :title="cardLabel"
    :description="`${cardLabel} card image`"
    :ui="{
      content: 'bg-transparent shadow-none ring-0',
      overlay: 'bg-black/80'
    }"
  >
    <template #content>
      <div v-if="deck && currentCard" class="flex flex-col gap-3 p-2">
        <div class="rounded-xl p-4" :class="headerClass">
          <MagicDecklistHeader v-bind="deck.header" />
        </div>
        <UCarousel
          v-slot="{ item }"
          :items="deck.cards"
          :start-index="swipeStartIndex"
          :arrows="!isMobile"
          :ui="{ container: '-ms-2', item: 'basis-[92%] ps-2', prev: 'sm:start-2', next: 'sm:end-2' }"
          @select="currentIndex = $event"
        >
          <MagicCardFlipImage
            :image="item.imageUrl"
            :back-image="item.backImageUrl"
            :label="item.name"
            compact
          />
        </UCarousel>
        <div class="text-center text-white">
          <p class="m-0 font-semibold">
            {{ currentCard.quantity }}× {{ currentCard.name }}
          </p>
          <p class="m-0 text-sm opacity-80">
            {{ currentCard.section }} · {{ currentIndex + 1 }} / {{ deck.cards.length }}
          </p>
        </div>
      </div>
      <div v-else class="p-4">
        <MagicCardFlipImage :image="image" :back-image="backImage" :label="cardLabel" />
      </div>
    </template>
  </UModal>
</template>
