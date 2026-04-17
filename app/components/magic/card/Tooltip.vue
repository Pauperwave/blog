<script setup lang="ts">
// Props
const props = defineProps<{
  name: string
  image?: string
  set?: string
}>()

// State
const tooltipOpen = ref(false)
const anchor = ref({ x: 0, y: 0 })
const showModal = ref(false)

// Composables
const isMobile = useMediaQuery('(max-width: 768px)')

// Computed
const displayText = computed(() => props.name)
const imageUrl = computed(() => props.image || null)

const reference = computed(() => ({
  getBoundingClientRect: () =>
    ({
      width: 0,
      height: 0,
      left: anchor.value.x,
      right: anchor.value.x,
      top: anchor.value.y,
      bottom: anchor.value.y,
      ...anchor.value
    } as DOMRect)
}))

// Event handlers
const handlePointerEnter = (ev: PointerEvent) => {
  if (!isMobile.value) {
    anchor.value = { x: ev.clientX, y: ev.clientY }
    tooltipOpen.value = true
  }
}

const handlePointerLeave = () => {
  if (!isMobile.value) {
    tooltipOpen.value = false
  }
}

const handlePointerMove = (ev: PointerEvent) => {
  if (!isMobile.value) {
    anchor.value = { x: ev.clientX, y: ev.clientY }
  }
}

const handleClick = () => {
  if (isMobile.value) {
    showModal.value = true
  }
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
      :aria-label="isMobile ? `View ${name} card image` : undefined"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
      @pointermove="handlePointerMove"
      @click="handleClick"
    >
      {{ displayText }}
    </span>

    <template #content>
      <img
        :src="imageUrl || undefined"
        :alt="name"
        class="w-70 h-auto rounded-xl"
      >
    </template>
  </UTooltip>

  <!-- Mobile Modal -->
  <UModal
    v-model:open="showModal"
    :title="name"
    :description="`${name} card image`"
    :ui="{
      content: 'bg-transparent shadow-none ring-0',
      overlay: 'bg-black/80'
    }"
  >
    <template #content>
      <div class="flex items-center justify-center p-4">
        <img
          :src="imageUrl || undefined"
          :alt="name"
          class="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
        >
      </div>
    </template>
  </UModal>
</template>
