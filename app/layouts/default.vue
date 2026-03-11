<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <UApp>
    <Header />
    <UMain
      :class="route.path === '/' ? 'bg-linear-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900' : ''"
    >
      <UContainer>
        <NuxtPage />
      </UContainer>
    </UMain>
    <Footer />
  </UApp>
</template>
