<script setup lang="ts">
const error = useError()

useSeoMeta({
  title: `${error.value?.status} - ${error.value?.statusText}`,
  description: error.value?.statusText,
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
        <UError :error>
          <img src="~/assets/404/Fblthp-the-Lost-War-of-the-Spark-Art.jpg" alt="Fblthp the Lost"
            class="mx-auto mb-6 rounded-xl" />
        </UError>
      </UContainer>
    </UMain>
  </UApp>
</template>