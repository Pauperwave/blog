<script lang="ts" setup>
interface Author {
  name: string;
  description?: string;
  avatar?: string;
  bio?: string;
  url?: string;
}

interface Props {
  author: Author;
  variant?: 'compact' | 'full' | 'inline';
  showBio?: boolean;
  clickable?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'full',
  showBio: false,
  clickable: true,
});

const isExternalLink = computed(() => {
  return props.author.url?.startsWith('http');
});

const linkTarget = computed(() => {
  return isExternalLink.value ? '_blank' : undefined;
});

const linkRel = computed(() => {
  return isExternalLink.value ? 'noopener noreferrer' : undefined;
});

const avatarSize = computed(() => {
  switch (props.variant) {
    case 'compact':
      return 'sm';
    case 'inline':
      return 'md';
    case 'full':
    default:
      return 'lg';
  }
});

const shouldLink = computed(() => {
  return props.clickable && props.author.url;
});
</script>

<template>
  <!-- Inline variant: identical to UUser -->
  <div
    v-if="variant === 'inline'"
    :class="[
      'relative flex items-center gap-2',
      props.class
    ]"
  >
    <UAvatar
      :src="author.avatar"
      :alt="author.name"
      :size="avatarSize"
      class="shrink-0"
    />
    
    <div class="min-w-0">
      <ULink
        v-if="shouldLink"
        :aria-label="author.name"
        :to="isExternalLink ? undefined : author.url"
        :href="isExternalLink ? author.url : undefined"
        :target="linkTarget"
        :rel="linkRel"
        class="focus:outline-none peer"
        raw
      >
        <span class="absolute inset-0" aria-hidden="true" />
      </ULink>

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

  <!-- Compact and Full variants: keep original behavior -->
  <component
    v-else
    :is="shouldLink ? (isExternalLink ? 'a' : 'NuxtLink') : 'div'"
    :href="shouldLink ? author.url : undefined"
    :to="shouldLink && !isExternalLink ? author.url : undefined"
    :target="linkTarget"
    :rel="linkRel"
    :class="[
      'author-card',
      'flex flex-col gap-2',
      variant === 'compact' ? 'gap-1' : '',
      shouldLink ? 'cursor-pointer transition-all hover:opacity-80' : 'cursor-default',
      props.class
    ]"
  >
    <UAvatar
      :src="author.avatar"
      :alt="author.name"
      :size="avatarSize"
      :class="variant === 'compact' ? 'w-8 h-8' : ''"
    />
    
    <div class="flex flex-col" :class="variant === 'compact' ? 'gap-0' : 'gap-1'">
      <p
        :class="[
          'font-semibold',
          variant === 'compact' ? 'text-sm' : 'text-base'
        ]"
      >
        {{ author.name }}
      </p>
      
      <p
        v-if="author.description && variant !== 'compact'"
        class="text-sm text-gray-600 dark:text-gray-400"
      >
        {{ author.description }}
      </p>
      
      <div
        v-if="showBio && author.bio"
        class="mt-2 text-sm text-gray-700 dark:text-gray-300"
      >
        {{ author.bio }}
      </div>
    </div>
  </component>
</template>

<style scoped>
.author-card {
  text-decoration: none;
}
</style>
