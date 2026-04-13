<script setup lang="ts">
const props = defineProps<{
  name: string
  rating: string | number
}>()

const authorData = ref<{ avatar?: string } | null>(null)

// Fetch author data if avatar is not provided
onMounted(async () => {
  const author = await useAuthor(props.name)
  authorData.value = { avatar: author.avatar }
})
</script>

<template>
  <div class="my-6">
    <div class="flex items-center gap-3 mb-3">
      <UAvatar
        v-if="authorData?.avatar"
        :src="authorData?.avatar"
        :alt="name"
        size="md"
        class="shrink-0"
      />
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ name }}
        </h3>
        <UBadge color="primary" variant="subtle">
          Voto: {{ rating }}
        </UBadge>
      </div>
    </div>
    <div class="prose prose-gray dark:prose-invert max-w-none">
      <slot />
    </div>
  </div>
</template>
