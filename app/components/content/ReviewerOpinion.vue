<script setup lang="ts">
const props = defineProps<{
  name: string
  rating: number
}>()

const authorData = ref<{ avatar?: string } | null>(null)

const author = await useAuthor(props.name)
authorData.value = { avatar: author.avatar }
</script>

<template>
  <div class="my-6">
    <UCard :ui="{ body: 'pl-4', header: 'px-4 py-3' }">
      <template #header>
        <div class="flex items-center gap-3">
          <UAvatar
            v-if="authorData"
            :src="authorData.avatar"
            :alt="name"
            icon="i-lucide-user"
            size="md"
            class="shrink-0"
          />
          <div class="flex items-center gap-2 flex-1">
            <h3 class="text-lg font-semibold text-highlighted">
              {{ name }}
            </h3>
            <UBadge color="primary" variant="soft">
              Voto: {{ rating }}
            </UBadge>
          </div>
        </div>
      </template>
      <div class="prose prose-gray dark:prose-invert max-w-none border-l-4 border-default pl-4 italic text-dimmed">
        <slot />
      </div>
    </UCard>
  </div>
</template>
