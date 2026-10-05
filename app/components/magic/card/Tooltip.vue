<script setup lang="ts">
import { injectDecklistContext } from '~/composables/useDecklistContext'

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
// Mounted on first use: most card names never open the standalone modal
const modalRequested = ref(false)

// Composables
const { isMobile } = useDevice()

// Provided by Decklist: its shared viewer (swipeable modal / overlay) opens on this card
const deck = injectDecklistContext()

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
  if (deck) {
    deck.openCard(name, section)
    return
  }
  modalRequested.value = true
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

  <!-- Standalone card modal, for card names outside a decklist (a decklist has its own shared viewer) -->
  <UModal
    v-if="modalRequested"
    v-model:open="showModal"
    :title="cardLabel"
    :description="`${cardLabel} card image`"
    :ui="{
      content: 'bg-transparent shadow-none ring-0',
      overlay: 'bg-black/80'
    }"
  >
    <template #content>
      <div class="p-4">
        <MagicCardFlipImage :image="image" :back-image="backImage" :label="cardLabel" />
      </div>
    </template>
  </UModal>
</template>
