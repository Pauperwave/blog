<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

interface ImageItem {
  src: string
  alt?: string
}

interface Props {
  images?: (string | ImageItem)[]
}

const props = withDefaults(defineProps<Props>(), {
  images: () => []
})

// Parse images immediately so they're available for SSR fallback
const parsedImages = computed<ImageItem[]>(() => {
  if (props.images.length === 0) return []

  return props.images.map((img) => {
    // Check if it's already an object with src and alt
    if (typeof img === 'object' && img.src) {
      return {
        src: img.src,
        alt: img.alt || 'Image'
      }
    }
    // Otherwise it's just a string path
    return {
      src: img as string,
      alt: 'Image'
    }
  })
})
</script>

<template>
  <div class="my-6">
    <!-- Swiper Carousel -->
    <ClientOnly>
      <div
        v-if="parsedImages.length > 0"
        class="swiper-carousel-wrapper"
      >
        <Swiper
          :modules="[Navigation, Pagination, Autoplay]"
          :slides-per-view="1"
          :space-between="20"
          :navigation="true"
          :pagination="{ clickable: true }"
          :loop="true"
          :autoplay="{ delay: 3000, disableOnInteraction: false }"
          class="rounded-lg min-h-100"
        >
          <SwiperSlide
            v-for="(image, idx) in parsedImages"
            :key="idx"
          >
            <div class="flex justify-center items-center py-4 h-full">
              <img
                :src="image.src"
                :alt="image.alt"
                class="rounded-lg shadow-lg max-h-150 w-auto object-contain"
              >
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <!-- SSR Fallback: Show first image as placeholder -->
      <template #fallback>
        <div
          v-if="parsedImages.length > 0"
          class="swiper-carousel-wrapper"
        >
          <div class="relative rounded-lg min-h-100 bg-gray-100 dark:bg-gray-800">
            <div class="flex justify-center items-center py-4 h-full">
              <img
                :src="parsedImages[0]!.src"
                :alt="parsedImages[0]!.alt"
                class="rounded-lg shadow-lg max-h-150 w-auto object-contain"
              >
            </div>
            <!-- Indicator that carousel is loading -->
            <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              <div
                v-for="idx in parsedImages.length"
                :key="idx"
                class="w-2 h-2 rounded-full"
                :class="idx === 1 ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'"
              />
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.swiper-carousel-wrapper {
  position: relative;
  width: 100%;
}

/* Swiper navigation and pagination styling */
:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 8px;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 20px;
}

:deep(.swiper-pagination) {
  bottom: 10px !important;
}

:deep(.swiper-pagination-bullet) {
  background: #fff;
  opacity: 0.7;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: #3b82f6;
}
</style>
