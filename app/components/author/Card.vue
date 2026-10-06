<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'
import { getAuthorSlug } from '~/composables/useAuthorSlug'

interface Props {
  author: Author
}

const { author } = defineProps<Props>()

const handleAuthorClick = () => {
  navigateTo(`/authors/${getAuthorSlug(author.name)}`)
}
</script>

<template>
  <div
    class="relative z-10 pointer-events-auto cursor-pointer"
    @click="handleAuthorClick"
  >
    <div class="flex items-center gap-2">
      <UAvatar
        :as="{ img: 'img' }"
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
