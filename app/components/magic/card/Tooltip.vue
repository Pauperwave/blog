<script setup lang="ts">
const props = defineProps<{
  name: string
  image?: string
  /** Scryfall set code — when given, `image` is resolved to that specific printing. */
  set?: string
}>()

const cardLabel = computed(() => props.set ? `${props.name} (${props.set})` : props.name)

const tooltipOpen = ref(false)
const anchor = ref({ x: 0, y: 0 })
const showModal = ref(false)

// Composables
const { isMobile } = useDevice()

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
      <div class="flex items-center justify-center p-4">
        <img
          :src="image"
          :alt="cardLabel"
          class="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
        >
      </div>
    </template>
  </UModal>
</template>
