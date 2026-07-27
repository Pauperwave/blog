<script setup lang="ts">
import { getYoutubeThumbnail } from '~/utils/youtube'

interface Props {
  url: string
  title?: string
}

const { url, title = '' } = defineProps<Props>()

const thumbnail = getYoutubeThumbnail(url)
</script>

<template>
  <UCard
    class="group relative my-6 max-w-sm overflow-hidden"
    :ui="{ body: 'p-0' }"
  >
    <ULink
      :to="url"
      target="_blank"
      rel="noopener"
      raw
      :aria-label="title || 'Video correlato'"
      class="absolute inset-0 z-10 focus:outline-none"
    />
    <div class="relative aspect-video overflow-hidden bg-elevated">
      <img
        v-if="thumbnail"
        :src="thumbnail"
        :alt="title || 'Video correlato'"
        class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
      >
      <div class="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/40">
        <UIcon
          name="i-lucide-play-circle"
          class="size-10 text-white drop-shadow"
        />
      </div>
    </div>
    <div class="p-3">
      <p class="text-xs font-medium uppercase tracking-wider text-muted">
        Video correlato
      </p>
      <p
        v-if="title"
        class="mt-1 text-sm font-medium text-highlighted line-clamp-2"
      >
        {{ title }}
      </p>
    </div>
  </UCard>
</template>
