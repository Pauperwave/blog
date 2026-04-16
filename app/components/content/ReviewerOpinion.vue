<script setup lang="ts">
const props = defineProps<{
  name: string
  rating: number
}>()

const { data: author, error } = await useAuthor(props.name)
</script>

<template>
  <div class="my-2">
    <div class="flex items-center gap-3">
      <UAvatar
        :src="author?.avatar"
        :alt="author?.name ?? name"
        icon="i-lucide-user"
        size="xl"
        class="shrink-0"
      />
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold text-highlighted">
          {{ author?.name ?? name }}
        </h3>
        <UBadge color="warning" variant="soft" size="lg" leading-icon="i-lucide-star">
          {{ rating }}
        </UBadge>
      </div>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      :description="error.message"
      class="mt-3"
    />

    <blockquote v-else class="border-l-4 border-s-2 border-accented ps-4 mt-3 italic text-muted">
      <slot />
    </blockquote>
  </div>
</template>
