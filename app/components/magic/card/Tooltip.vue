<script setup lang="ts">
interface Props {
  name: string
  image?: string
  /** Second face's image, for transform/modal double-faced cards. Mobile only — a button below the preview toggles it. */
  backImage?: string
  /** Scryfall set code — when given, `image` is resolved to that specific printing. */
  set?: string
}

const { name, image = '', backImage = '', set = '' } = defineProps<Props>()

const cardLabel = computed(() => set ? `${name} (${set})` : name)

const tooltipOpen = ref(false)
const anchor = ref({ x: 0, y: 0 })
const showModal = ref(false)

// Composables
const { isMobile } = useDevice()

// Provided by Decklist: lets the mobile modal swipe through the deck's cards
const swipeCards = inject<ComputedRef<{ name: string; imageUrl: string; backImageUrl?: string }[]> | null>('decklistSwipeCards', null)
const swipeStartIndex = computed(() => swipeCards?.value.findIndex(card => card.name === name) ?? -1)

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
  if (isMobile) showModal.value = true
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
      class="font-semibold text-primary"
      :class="isMobile ? 'cursor-pointer underline' : 'cursor-help'"
      :role="isMobile ? 'button' : undefined"
      :aria-label="isMobile ? `View ${cardLabel} card image` : undefined"
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

  <!-- Mobile Modal -->
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
      <UCarousel
        v-if="swipeCards && swipeStartIndex >= 0"
        v-slot="{ item }"
        :items="swipeCards"
        :start-index="swipeStartIndex"
        class="p-4"
      >
        <MagicCardFlipImage
          :image="item.imageUrl"
          :back-image="item.backImageUrl"
          :label="item.name"
        />
      </UCarousel>
      <div v-else class="p-4">
        <MagicCardFlipImage :image="image" :back-image="backImage" :label="cardLabel" />
      </div>
    </template>
  </UModal>
</template>
