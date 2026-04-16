<!-- app\components\Article\AuthorsSection.vue -->
<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'

defineProps<{
  authors: Author[] | undefined
}>()
</script>

<template>
  <template v-if="authors && authors.length > 0">
    <div class="flex flex-col gap-4">
      <AuthorAboutCard
        v-for="author in authors"
        :key="author.name"
        :author="author"
      >
        <template
          v-if="author.bio"
          #body
        >
          <p class="text-sm text-muted mt-2">
            {{ author.bio }}
          </p>
        </template>
      </AuthorAboutCard>
    </div>
  </template>
</template>
