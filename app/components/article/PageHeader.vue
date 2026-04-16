<!-- app\components\Article\PageHeader.vue -->
<script setup lang="ts">
import type { Author } from '~/composables/useAuthor'

defineProps<{
  data: { title?: string; description?: string; tags?: string[]; thumbnail?: string; date?: string } | null | undefined
  authors: Author[]
  formattedDate: string
  getTagFilterLink: (tag: string) => { path: string; query: Record<string, string> }
}>()
</script>

<template>
  <UPageHeader
    :title="data?.title"
    :description="data?.description"
    headline="Blog"
  >
    <div class="flex items-end flex-wrap gap-4 justify-between mt-4">
      <div class="flex flex-col gap-4">
        <div class="flex flex-row gap-2 items-center flex-wrap">
          <NuxtLink
            v-for="tag in data?.tags"
            :key="tag"
            :to="getTagFilterLink(tag)"
            class="rounded-full focus-visible:outline focus-visible:outline-primary"
          >
            <UBadge
              color="primary"
              variant="soft"
              class="cursor-pointer transition-opacity hover:opacity-80"
            >
              {{ tag }}
            </UBadge>
          </NuxtLink>
        </div>
        <div class="flex flex-wrap gap-2">
          <AuthorCard
            v-for="author in authors"
            :key="author.name"
            :author="author"
          />
        </div>
      </div>
      <div class="flex flex-row items-center gap-4">
        <p class="flex flex-row items-center gap-1 typ-sublabel">
          <icon
            name="i-lucide-calendar"
            class="text-primary"
          /> {{ formattedDate }}
        </p>
      </div>
      <NuxtImg
        v-if="data?.thumbnail"
        :src="data.thumbnail"
        :alt="data.title"
        class="w-full h-auto rounded-lg shadow-lg aspect-video object-cover"
        loading="lazy"
      />
    </div>
  </UPageHeader>
</template>
