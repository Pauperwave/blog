<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

// title: 404 Not Found
useSeoMeta({
  title: `${props.error.status} ${props.error.statusText}`,
  description: props.error.statusText,
})
</script>

<template>
  <UApp>
    <UHeader mode="slideover">
      <template #left>
        <UUser
          name="Pauperwave Blog"
          to="/"
          :avatar="{
            src: 'https://avatars.githubusercontent.com/u/225214755?v=4'
          }"
        />
      </template>
    </UHeader>

    <UMain>
      <div class="error-container flex flex-col items-center justify-center text-center gap-6 px-4">
        <NuxtImg
          src="/assets/404/Fblthp-the-Lost-War-of-the-Spark-Art.jpg"
          alt="Fblthp the Lost"
          class="rounded-xl max-w-4xl w-full"
        />
        <UError
          :ui="{ root: 'min-h-0' }"
          :clear="{
            size: 'xl',
            color: 'primary',
            icon: 'i-lucide-arrow-left',
            class: 'rounded-full cursor-pointer',
            label: 'Torna al sicuro'
          }"
          :error="{
            ...error,
            statusMessage: 'Ti senti perso?',
          }"
        >
          <template #message>
            Anche Fblthp si perde spesso tra i piani.<br>
            Questo sentiero non conduce ad alcun piano conosciuto.
          </template>
        </UError>
      </div>
    </UMain>
  </UApp>
</template>

<style scoped>
.error-container {
  min-height: calc(100vh - var(--ui-header-height));
}
</style>
