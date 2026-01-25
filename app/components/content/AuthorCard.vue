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
  variant?: 'compact' | 'full' | 'inline';
  showBio?: boolean;
  clickable?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'inline',
  showBio: false,
  clickable: true,
  class: ''
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
  <div v-if="variant === 'inline'" :class="[
    'relative z-10 flex items-center gap-2 border-2 border-red-500 group/author-card pointer-events-auto',
    'transition-all duration-300',
    props.class
  ]">
    <UAvatar :src="author.avatar" :alt="author.name" :size="avatarSize" class="shrink-0 relative z-10" />

    <div class="min-w-0 flex-1 relative z-10">
      <p class="text-sm font-medium text-highlighted truncate">
        {{ author.name }}
      </p>

      <p v-if="author.description" class="text-xs text-muted truncate">
        {{ author.description }}
      </p>

      <!-- Social links row - appears on hover -->
      <div
        class="flex flex-col gap-2 mt-2 opacity-0 max-h-0 overflow-hidden group-hover/author-card:opacity-100 group-hover/author-card:max-h-20 transition-all duration-300">
        <div class="flex items-center gap-2">
          <a v-if="author.socials?.twitter" :href="author.socials.twitter" target="_blank" rel="noopener noreferrer"
            class="text-gray-500 hover:text-blue-400 transition-colors relative z-10" @click.stop>
            <Icon name="mdi:twitter" class="w-4 h-4" />
          </a>
          <a v-if="author.socials?.github" :href="author.socials.github" target="_blank" rel="noopener noreferrer"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative z-10" @click.stop>
            <Icon name="mdi:github" class="w-4 h-4" />
          </a>
          <a v-if="author.socials?.youtube" :href="author.socials.youtube" target="_blank" rel="noopener noreferrer"
            class="text-gray-500 hover:text-red-600 transition-colors relative z-10" @click.stop>
            <Icon name="mdi:youtube" class="w-4 h-4" />
          </a>
          <a v-if="author.socials?.twitch" :href="author.socials.twitch" target="_blank" rel="noopener noreferrer"
            class="text-gray-500 hover:text-purple-600 transition-colors relative z-10" @click.stop>
            <Icon name="mdi:twitch" class="w-4 h-4" />
          </a>
          <a v-if="author.socials?.website" :href="author.socials.website" target="_blank" rel="noopener noreferrer"
            class="text-gray-500 hover:text-primary transition-colors relative z-10" @click.stop>
            <Icon name="mdi:web" class="w-4 h-4" />
          </a>
        </div>

        <!-- Link to author page -->
        <NuxtLink :to="`/authors/${getAuthorSlug(author.name)}`"
          class="text-xs text-primary hover:underline relative z-10" @click.stop>
          Vedi profilo
        </NuxtLink>
      </div>
    </div>
  </div>

  <!-- Compact and Full variants: keep original behavior -->
  <component :is="shouldLink ? (isExternalLink ? 'a' : 'NuxtLink') : 'div'" v-else
    :href="shouldLink ? author.url : undefined" :to="shouldLink && !isExternalLink ? author.url : undefined"
    :target="linkTarget" :rel="linkRel" :class="[
      'author-card',
      'flex flex-col gap-2',
      variant === 'compact' ? 'gap-1' : '',
      shouldLink ? 'cursor-pointer transition-all hover:opacity-80' : 'cursor-default',
      props.class
    ]">
    <UAvatar :src="author.avatar" :alt="author.name" :size="avatarSize"
      :class="variant === 'compact' ? 'w-8 h-8' : ''" />

    <div class="flex flex-col" :class="variant === 'compact' ? 'gap-0' : 'gap-1'">
      <p :class="[
        'font-semibold',
        variant === 'compact' ? 'text-sm' : 'text-base'
      ]">
        {{ author.name }}
      </p>

      <p v-if="author.description && variant !== 'compact'" class="text-sm text-gray-600 dark:text-gray-400">
        {{ author.description }}
      </p>

      <div v-if="showBio && author.bio" class="mt-2 text-sm text-gray-700 dark:text-gray-300">
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
