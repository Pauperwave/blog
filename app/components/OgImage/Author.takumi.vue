<script setup lang="ts">
import appMeta from "~/app.meta"

defineProps<{
  name?: string
  avatar?: string
  description?: string
  bio?: string
  articleCount?: number
}>()
</script>

<template>
  <div class="relative w-full h-full flex bg-slate-950 text-white overflow-hidden">
    <!-- Background gradient blob -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full" style="filter: blur(64px)" />
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-500/10 rounded-full" style="filter: blur(64px)" />

    <div class="relative z-10 w-full h-full flex flex-col justify-between p-14">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-1 h-8 bg-emerald-400 rounded-full" />
        <span class="text-emerald-400 font-bold text-xl tracking-widest uppercase">{{ appMeta.author.url }}</span>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col justify-center">
        <div class="flex items-center gap-6 mb-6">
          <img
            v-if="avatar"
            :src="avatar"
            width="80"
            height="80"
            class="rounded-full"
            alt=""
          >
          <div class="flex flex-row items-baseline gap-5">
            <h1 class="text-4xl font-bold leading-tight text-white">{{ name }}</h1>
            <p class="text-emerald-400 text-4xl font-semibold">Autore</p>
          </div>
        </div>
        <p class="text-3xl text-white/80 max-w-2xl">{{ bio }}</p>
        <p v-if="articleCount !== undefined" class="text-2xl text-emerald-400 mt-4">
          {{ articleCount }} articol{{ articleCount === 1 ? 'o' : 'i' }} pubblicati
        </p>
      </div>
    </div>
  </div>
</template>
