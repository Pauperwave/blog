<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const navItems: NavigationMenuItem[] = [
  { label: "Autori", icon: "mdi:account-group", to: "/authors" },
];
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
      <template #right>
        <ColorModeButton />
      </template>
      <!-- Desktop -->
      <template #default>
        <UNavigationMenu :items="navItems" />
      </template>
      <!-- Mobile slideover -->
      <template #body>
        <UNavigationMenu :items="navItems" />
      </template>
    </UHeader>
    <UMain>
      <UContainer>
        <!-- <div class="border border-4 border-fuchsia-600"> -->
        <NuxtPage />
        <!-- </div> -->
      </UContainer>
    </UMain>
    <BlogFooter />
  </UApp>
</template>
