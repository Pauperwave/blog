<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui"
import SearchButton from "~/components/ui/search/SearchButton.vue"

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
      <SearchButton class="lg:hidden" :collapsed="true" />
      <ColorModeButton />
    </template>
    <!-- Desktop -->
    <template #default>
      <!-- <UNavigationMenu :items="navItems" /> -->
      <SearchButton class="hidden lg:flex" :collapsed="false" />
    </template>
    <!-- Mobile slideover -->
    <template #body>
      <div class="flex flex-col">
        <SearchButton variant="ghost" />
        <UNavigationMenu :items="navItems" />
      </div>
    </template>
  </UHeader>
</template>
