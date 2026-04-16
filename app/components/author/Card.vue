<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'

defineProps<{
  author: Author
  clickable?: boolean
}>()
</script>

<template>
  <div
    :class="[
      'relative z-10 pointer-events-auto transition-transform duration-200',
      clickable ? 'cursor-pointer hover:-translate-y-0.5 focus-within:-translate-y-0.5' : 'cursor-default',
    ]"
  >
    <div class="flex items-center gap-2">
      <UAvatar
        :src="author.avatar"
        :alt="author.name"
        size="md"
        class="shrink-0"
      />
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-highlighted truncate">{{ author.name }}</p>
        <p v-if="author.description" class="text-xs text-muted truncate">{{ author.description }}</p>
      </div>
    </div>
  </div>
</template>
