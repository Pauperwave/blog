<script setup lang="ts">
import appMeta from "~/app.meta"

defineProps<{
  title?: string
  description?: string
  subtitle?: string
}>()
</script>

<template>
  <div class="relative w-full h-full flex bg-slate-950 text-white overflow-hidden">
    <!-- Background gradient blob -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full" style="filter: blur(64px)" />
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-primary-500/10 rounded-full" style="filter: blur(64px)" />

    <div class="relative w-full h-full flex flex-col justify-between p-14">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-1 h-8 bg-emerald-400 rounded-full" />
        <span class="text-emerald-400 font-bold text-xl tracking-widest uppercase">{{ appMeta.author.url }}</span>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col justify-center">
        <h1 class="text-7xl font-extrabold leading-tight text-white mb-4">{{ title }}</h1>
        <p v-if="description" class="text-3xl text-emerald-400">{{ description }}</p>
        <p v-else-if="subtitle" class="text-3xl text-emerald-400">{{ subtitle }}</p>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img
            :src="appMeta.author.image"
            width="48"
            height="48"
            class="rounded-full"
            style="border: 2px solid rgba(52, 211, 153, 0.5)"
            alt=""
          >
          <div>
            <p class="text-3xl font-semibold text-white m-0">{{ appMeta.author.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
