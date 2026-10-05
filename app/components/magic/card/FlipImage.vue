<script setup lang="ts">
interface Props {
  image: string
  /** Second face's image, for transform/modal double-faced cards. A button below the image toggles it. */
  backImage?: string
  label: string
  /** Smaller max height, to leave room for content around the image */
  compact?: boolean
}

const { image, backImage = '', label, compact = false } = defineProps<Props>()

const showBack = ref(false)
// Matches Scryfall's own card page exactly (measured live): flipping to the
// back face takes 750ms, flipping back to the front takes 200ms — two
// different transition durations depending on the target state, not a
// single symmetric one.
const flipDuration = computed(() => showBack.value ? '750ms' : '200ms')

const toggleFace = () => {
  if (backImage) showBack.value = !showBack.value
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <!-- 3D flip, same technique as Scryfall's own card page: both faces
         stacked with backface-visibility hidden, back pre-rotated 180deg,
         and the wrapper rotates on toggle. -->
    <div class="relative max-w-full" :class="compact ? 'max-h-[65vh]' : 'max-h-[75vh]'" style="perspective: 1200px;">
      <div
        class="relative"
        :style="{
          transformStyle: 'preserve-3d',
          transform: showBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: `transform ${flipDuration}`
        }"
      >
        <img
          :src="image"
          :alt="label"
          class="block max-w-full rounded-xl shadow-2xl"
          :class="compact ? 'max-h-[65vh]' : 'max-h-[75vh]'"
          style="backface-visibility: hidden;"
        >
        <img
          v-if="backImage"
          :src="backImage"
          :alt="`${label} (back face)`"
          class="absolute inset-0 w-full h-full rounded-xl shadow-2xl object-cover"
          style="backface-visibility: hidden; transform: rotateY(180deg);"
        >
      </div>
    </div>
    <UButton
      v-if="backImage"
      icon="i-lucide-repeat"
      label="Transform"
      aria-label="Transform card"
      size="lg"
      color="neutral"
      variant="solid"
      @click="toggleFace"
    />
  </div>
</template>
