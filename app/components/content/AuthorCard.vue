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
      'relative z-10 flex items-center gap-2 group/author-card pointer-events-auto',
      'transition-all duration-300',
      props.class
    ]"
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
      <!-- Social links row - appears on hover -->
      <div
        class="flex flex-col gap-2 mt-2 opacity-0 max-h-0 overflow-hidden group-hover/author-card:opacity-100 group-hover/author-card:max-h-20 transition-all duration-300"
      >
        <div class="flex items-center gap-2">
          <a
            v-if="author.socials?.twitter"
            :href="author.socials.twitter"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-500 hover:text-blue-400 transition-colors relative z-10"
            @click.stop
          >
            <Icon
              name="mdi:twitter"
              class="w-4 h-4"
            />
          </a>
          <a
            v-if="author.socials?.github"
            :href="author.socials.github"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors relative z-10"
            @click.stop
          >
            <Icon
              name="mdi:github"
              class="w-4 h-4"
            />
          </a>
          <a
            v-if="author.socials?.youtube"
            :href="author.socials.youtube"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-500 hover:text-red-600 transition-colors relative z-10"
            @click.stop
          >
            <Icon
              name="mdi:youtube"
              class="w-4 h-4"
            />
          </a>
          <a
            v-if="author.socials?.twitch"
            :href="author.socials.twitch"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-500 hover:text-purple-600 transition-colors relative z-10"
            @click.stop
          >
            <Icon
              name="mdi:twitch"
              class="w-4 h-4"
            />
          </a>
          <a
            v-if="author.socials?.website"
            :href="author.socials.website"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-500 hover:text-primary transition-colors relative z-10"
            @click.stop
          >
            <Icon
              name="mdi:web"
              class="w-4 h-4"
            />
          </a>
        </div>

        <!-- Link to author page -->
        <NuxtLink
          :to="`/authors/${getAuthorSlug(author.name)}`"
          class="text-xs text-primary hover:underline relative z-10"
          @click.stop
        >
          Vedi profilo
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
