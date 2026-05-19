<script setup lang="ts">
import appMeta from "~/app.meta"

defineProps<{
  title?: string
  subtitle?: string
  thumbnail?: string | undefined
  tags?: string[]
  date?: string
  author?: {
    image: string
    name: string
    description: string
    bio: string
  } | undefined
}>()
</script>

<template>
  <div class="relative w-full h-full flex bg-slate-950 text-white overflow-hidden">

    <!-- Ambient glow -->
    <div
      class="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/10 rounded-full"
      style="filter: blur(90px)"
    />

    <!-- Thumbnail (right side) -->
    <img
      v-if="thumbnail"
      :src="thumbnail"
      class="absolute right-0 top-0 w-[65%] h-full object-cover object-top"
      alt=""
    >

    <!-- Content (left side) -->
    <div class="relative w-[85%] h-full flex flex-col justify-between p-10">

      <!-- Site branding -->
      <div class="flex items-center gap-3">
        <div class="w-1 h-8 bg-emerald-400 rounded-full" />
        <span class="text-emerald-400 font-bold text-xl tracking-widest uppercase">
          {{ appMeta.author.url }}
        </span>
      </div>

      <!-- Main content block -->
      <div class="flex flex-col gap-5">
        <!-- Date -->
        <span v-if="date" class="text-lg font-medium text-slate-400 tracking-wide">
          {{ date }}
        </span>

        <!-- Title -->
        <h1 class="text-5xl font-extrabold leading-tight text-white">
          {{ title }}
        </h1>

        <!-- Subtitle -->
        <p v-if="subtitle" class="text-2xl font-medium leading-snug text-slate-300">
          {{ subtitle }}
        </p>

        <!-- Tags -->
        <div v-if="tags?.length" class="flex flex-wrap gap-2">
          <span
            v-for="tag in tags"
            :key="tag"
            class="font-medium inline-flex items-center text-xl px-2 py-1 gap-1 rounded-md bg-emerald-400/10 text-emerald-400"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Author -->
      <div v-if="author" class="flex items-center gap-4">
        <img
          :src="author.image"
          :alt="author.name"
          class="size-10 rounded-full object-cover shrink-0"
          style="border: 2px solid rgba(52, 211, 153, 0.5); box-shadow: 0 0 0 2px #020617;"
        >
        <div class="flex flex-col gap-0.5">
          <p class="font-semibold text-xl text-white leading-tight">{{ author.name }}</p>
          <p class="text-base text-slate-400 leading-tight">{{ author.description }}</p>
        </div>
      </div>

    </div>
  </div>
</template>