<script setup lang="ts">
const error = useError()

useSeoMeta({
  title: error.value?.statusCode.toString(),
  description: error.value?.statusMessage,
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
        <UError
          :error="{
            statusCode: error?.statusCode,
            statusMessage: error?.statusMessage,
            message: error?.message,
          }"
        />
      </UContainer>
    </UMain>
  </UApp>
</template>