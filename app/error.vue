<script setup lang="ts">
const error = useError()

useSeoMeta({
  title: error.value?.status?.toString(),
  description: error.value?.statusText,
})
</script>


<template>
  <UApp>
    <UHeader mode="slideover">
      <template #left>
        <UUser
          name="Pauperwave Blog"
          to="/"
          :avatar="{ src: 'https://avatars.githubusercontent.com/u/225214755?v=4' }"
        />
      </template>
    </UHeader>
    <UMain class="px-4">
      <UContainer>
        <UError :error="error" />
      </UContainer>
    </UMain>
  </UApp>
</template>