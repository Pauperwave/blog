<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'

defineProps<{
  author: Author
}>()
</script>

<template>
  <UCard
    id="author-about"
    variant="soft"
  >
    <template #header>
      <div class="flex flex-col">
        <p class="font-bold text-highlighted">
          Riguardo l'autore
        </p>
        <slot name="body" />
      </div>
    </template>
    <template #footer>
      <div class="flex-1">
        <AuthorCard
          :author="author"
        />
      </div>
    </template>
  </UCard>
</template>

