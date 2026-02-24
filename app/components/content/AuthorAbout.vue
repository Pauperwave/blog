<script setup lang="ts">
const props = defineProps<{
  src: string;
  name: string;
  description?: string;
  url?: string;
  socials?: {
    twitter?: string;
    github?: string;
    youtube?: string;
    twitch?: string;
    website?: string;
  };
}>()
</script>

<template>
  <UCard
    id="author-about"
    variant="soft"
    class="mt-16"
  >

    <template #header>
      <div class="flex flex-col">
        <p class="font-bold text-highlighted">Riguardo l'autore</p>
        <slot name="body" />
      </div>
    </template>

    <template #footer>
      <div class="flex items-center gap-2">
        <AuthorCard
          :author="{
            name: props.name,
            avatar: props.src,
            description: props.description,
            url: props.url,
            socials: props.socials
          }"
          :clickable="!!props.url"
          class="flex-1"
        />
        <div class="ml-auto flex items-center gap-2 justify-end">
          <slot name="actions" />
        </div>
      </div>
    </template>

  </UCard>
</template>

<style lang="css" scoped>
@reference "~/assets/css/main.css";
</style>
