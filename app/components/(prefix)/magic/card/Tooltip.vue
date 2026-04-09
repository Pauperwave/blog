<script setup lang="ts">
interface Props {
  name: string
  image?: string
  set?: string
}

const props = defineProps<Props>()
const imageCache = useState<Record<string, string>>('card-tooltip-image-cache', () => ({}))

const displayText = computed(() => props.name)

function buildScryfallUrl(name: string, set?: string): string {
  const baseUrl = 'https://api.scryfall.com/cards/named'
  const params = new URLSearchParams({
    exact: name,
    format: 'image'
  })
  
  if (set) {
    params.append('set', set)
  }
  
  return `${baseUrl}?${params.toString()}`
}

const imageUrl = ref<string | null>(props.image || null)

async function getDatabaseImage(name: string): Promise<string | null> {
  try {
    const response = await $fetch<{
      cards?: Record<string, { imageUrl?: string }>
    }>('/api/cards', { query: { names: name } })

    const directMatch = response.cards?.[name]
    if (directMatch?.imageUrl) return directMatch.imageUrl

    const firstCard = Object.values(response.cards || {})[0]
    return firstCard?.imageUrl || null
  } catch {
    return null
  }
}

async function resolveImage(name: string, image?: string, set?: string): Promise<string | null> {
  if (image) return image
  if (set) return buildScryfallUrl(name, set)
  if (import.meta.server) return null

  const dbImage = await getDatabaseImage(name)
  return dbImage || buildScryfallUrl(name)
}

watch(
  () => [props.name, props.image, props.set] as const,
  async ([name, image, set]) => {
    const cacheKey = set ? `${name}::${set}` : name
    const cached = imageCache.value[cacheKey]
    if (cached) {
      imageUrl.value = cached
      return
    }

    const resolved = await resolveImage(name, image, set)
    imageUrl.value = resolved

    if (resolved) {
      imageCache.value[cacheKey] = resolved
    }
  },
  { immediate: true }
)

const tooltipOpen = ref(false)
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

// Mobile detection using native matchMedia API
const isMobile = useMediaQuery('(max-width: 768px)')
const showModal = ref(false)

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
