<script setup lang="ts">
import appMeta from "~/app.meta"

defineProps<{
  title?: string
  thumbnail?: string | undefined
  author?: {
    image: string
    name: string
  } | undefined
}>()
</script>

<template>
  <div class="relative w-full h-full flex bg-slate-950 text-white overflow-hidden">
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
    <div class="absolute right-0 top-0 w-[45%] h-full">
      <img v-if="thumbnail" :src="thumbnail" class="w-full h-full object-cover" >
      <div class="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/60 to-transparent" />
    </div>
    <div class="relative z-10 w-[65%] h-full flex flex-col justify-between p-14">
      <div class="flex items-center gap-3">
        <div class="w-1 h-8 bg-emerald-400 rounded-full" />
        <span class="text-emerald-400 font-bold text-xl tracking-widest uppercase">{{ appMeta.name }}</span>
      </div>
      <h1 class="text-5xl font-extrabold leading-tight text-white">{{ title }}</h1>
      <div class="flex items-center justify-between">
        <div v-if="author" class="flex items-center gap-3">
          <img
            :src="author.image"
            width="52"
            height="52"
            class="rounded-full border-2 border-emerald-400/50"
            alt=""
          >
          <div>
            <p class="font-semibold text-lg text-white m-0">{{ author.name }}</p>
            <p class="text-sm text-white/50 m-0">Autore</p>
          </div>
        </div>
        <div class="px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/30">
          <span class="text-emerald-400 text-sm font-semibold">pauperwave.it</span>
        </div>
      </div>
    </div>
  </div>
</template>
