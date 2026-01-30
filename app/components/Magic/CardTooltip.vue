<script setup lang="ts">
interface Props {
  name: string
  image?: string
  set?: string  // Optional set code (e.g., "lea", "m21")
}

const props = defineProps<Props>()

// Display format: Always just "Card Name" (set is used only for image URL)
const displayText = computed(() => {
  return props.name
})

// Build Scryfall API URL with optional set parameter
const imageUrl = computed(() => {
  // if the prop is passed use that
  if (props.image) {
    console.log(`✅ Using cached image: ${props.name}`)
    return props.image
  }

  console.log(`❌ Calling Scryfall API: ${props.name}`)
  const baseUrl = 'https://api.scryfall.com/cards/named'
  const params = new URLSearchParams({
    exact: props.name,
    format: 'image'
  })
  
  if (props.set) {
    params.append('set', props.set)
  }
  
  return `${baseUrl}?${params.toString()}`
})

// Mouse position tracking for virtual reference (desktop)
const open = ref(false)
const anchor = ref({ x: 0, y: 0 })

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

// Mobile detection and modal state
const isMobile = ref(false)
const showModal = ref(false)

// Check if we're on mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// Handle desktop hover
const handlePointerEnter = (ev: PointerEvent) => {
  if (!isMobile.value) {
    anchor.value = { x: ev.clientX, y: ev.clientY }
    open.value = true
  }
}

const handlePointerLeave = () => {
  if (!isMobile.value) {
    open.value = false
  }
}

const handlePointerMove = (ev: PointerEvent) => {
  if (!isMobile.value) {
    anchor.value = { x: ev.clientX, y: ev.clientY }
  }
}

// Handle mobile click
const handleClick = () => {
  if (isMobile.value) {
    showModal.value = true
  }
}

// Handle window resize
const handleResize = () => {
  checkMobile()
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <!-- Desktop Tooltip -->
  <UTooltip
    v-if="!isMobile"
    :arrow="false"
    :delay-duration="100"
    :open="open"
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
      class="font-semibold text-primary cursor-help"
      @pointerenter="handlePointerEnter"
      @pointerleave="handlePointerLeave"
      @pointermove="handlePointerMove"
    >
      {{ displayText }}
    </span>
    
    <template #content>
      <img 
        :src="imageUrl" 
        :alt="name"
        class="w-70 h-auto rounded-xl"
      >
    </template>
  </UTooltip>

  <!-- Mobile: Clickable text -->
  <span 
    v-else
    class="font-semibold text-primary cursor-pointer underline"
    role="button"
    :aria-label="`View ${name} card image`"
    @click="handleClick"
  >
    {{ displayText }}
  </span>

  <!-- Mobile Modal -->
  <UModal
    v-model:open="showModal"
    :ui="{
      content: 'bg-transparent shadow-none ring-0',
      overlay: 'bg-black/80'
    }"
  >
    <template #content>
      <div class="flex items-center justify-center p-4">
        <img
          :src="imageUrl"
          :alt="name"
          class="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
        >
      </div>
    </template>
  </UModal>
</template>
