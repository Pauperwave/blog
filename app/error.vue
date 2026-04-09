<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: `${props.error.status} - ${props.error.statusText}`,
  description: props.error.statusText,
})
</script>

<template>
  <UApp>
    <UHeader mode="slideover">
      <template #left>
        <UUser name="Pauperwave Blog" to="/"
          :avatar="{ src: 'https://avatars.githubusercontent.com/u/225214755?v=4' }" />
      </template>
    </UHeader>
    <UMain class="px-4">
      <UContainer>
        <UError :clear="{
          size: 'xl',
          color: 'primary',
          icon: 'i-lucide-arrow-left',
          class: 'rounded-full',
          label: 'Torna al sicuro'
        }" :error="{
            ...error,
            statusMessage: 'Ti senti perso?',
            message: 'Fblthp ha sempre odiato la folla.'
          }">
          <img src="~/assets/404/Fblthp-the-Lost-War-of-the-Spark-Art.jpg" alt="Fblthp the Lost"
            class="mx-auto mb-6 rounded-xl" />
        </UError>
      </UContainer>
    </UMain>
  </UApp>
</template>
