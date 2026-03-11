<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"

const navItems: NavigationMenuItem[] = [
  { label: "Autori", icon: "i-lucide-users", to: "/authors" },
]
</script>

<template>
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
      <!-- Expanded on desktop, icon-only on mobile -->
      <UNavigationMenu :items="navItems" />
      <SearchButton class="hidden lg:flex" :collapsed="false" />
      <SearchButton class="flex lg:hidden" :collapsed="true" />
    </template>
    <!-- Mobile slideover -->
    <template #body>
      <UNavigationMenu :items="navItems" />
    </template>
  </UHeader>
</template>