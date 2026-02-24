<script setup lang="ts">
interface Author {
  name: string;
  description?: string;
  avatar?: string;
  bio?: string;
  url?: string;
  socials?: {
    twitter?: string;
    github?: string;
    youtube?: string;
    twitch?: string;
    website?: string;
  };
}

interface Props {
  author: Author;
  clickable?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
  class: ''
})
</script>

<template>
  <div
    :class="[
      'relative z-10 pointer-events-auto transition-transform duration-200',
      props.clickable ? 'cursor-pointer hover:-translate-y-0.5 focus-within:-translate-y-0.5' : 'cursor-default',
      props.class
    ]"
  >
    <div
      class="flex items-center gap-2"
    >
      <UAvatar
        :src="author.avatar"
        :alt="author.name"
        size="md"
        class="shrink-0 relative z-10"
      />
      <div class="min-w-0 flex-1 relative z-10">
        <p class="text-sm font-medium text-highlighted truncate">
          {{ author.name }}
        </p>
        <p
          v-if="author.description"
          class="text-xs text-muted truncate"
        >
          {{ author.description }}
        </p>
      </div>
    </div>
  </div>
</template>
