<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";
import { PAUPERWAVE_SOCIAL_LINKS } from "~/constants/social-links";
import appMeta from "~/app.meta";

const navItems: NavigationMenuItem[] = [
    { label: "YouTube channel", icon: "logos:youtube-icon", target: "_blank", to: PAUPERWAVE_SOCIAL_LINKS.youtube },
    { label: "Repository", icon: "mdi:github", target: "_blank", to: PAUPERWAVE_SOCIAL_LINKS.github },
];
</script>

<template>
    <UApp>
        <UHeader mode="slideover">
            <template #left>
                <UUser name="Pauperwave Blog" to="/" :avatar="{ src: 'https://avatars.githubusercontent.com/u/225214755?v=4' }"></UUser>
            </template>
            <template #right>
                <ColorModeButton />
            </template>
            <UNavigationMenu :items="navItems"></UNavigationMenu>
            <template #body>
                <UNavigationMenu :items="navItems"></UNavigationMenu>
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
