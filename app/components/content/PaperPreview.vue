<script setup lang="ts">
interface Props {
  url: string
  title?: string
}

const { url, title = '' } = defineProps<Props>()

const source = computed(() => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
})
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
      :aria-label="title || 'Paper correlato'"
      class="absolute inset-0 z-10 focus:outline-none"
    />
    <div class="flex items-center gap-4 p-4">
      <div class="flex aspect-square size-16 shrink-0 items-center justify-center rounded-lg bg-elevated transition-colors group-hover:bg-primary/10">
        <UIcon
          name="i-lucide-file-text"
          class="size-8 text-primary"
        />
      </div>
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wider text-muted">
          Paper correlato
        </p>
        <p
          v-if="title"
          class="mt-1 text-sm font-medium text-highlighted line-clamp-2"
        >
          {{ title }}
        </p>
        <p
          v-if="source"
          class="mt-1 text-xs text-muted truncate"
        >
          {{ source }}
        </p>
      </div>
    </div>
  </UCard>
</template>
