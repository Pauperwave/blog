<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";
import appMeta from "~/app.meta";

const navItems: NavigationMenuItem[] = [
    { label: "YouTube channel", icon: "logos:youtube-icon", target: "_blank", to: "https://www.youtube.com/@pauperwave" },
    { label: "Repository", icon: "mdi:github", target: "_blank", to: "https://github.com/Pauperwave/test" },
];
</script>

<template>
    <UApp>
        <UHeader mode="slideover">
            <template #left>
                <UUser name="Pauperwave Blog" to="/" :avatar="{ src: 'https://avatars.githubusercontent.com/u/225214755?v=4' }"></UUser>
            </template>
            <template #right>
                <ColorModeButton></ColorModeButton>
            </template>
            <UNavigationMenu :items="navItems"></UNavigationMenu>
            <template #body>
                <UNavigationMenu :items="navItems"></UNavigationMenu>
            </template>
        </UHeader>
        <UMain>
            <UContainer>
                <NuxtPage />
            </UContainer>
        </UMain>
        <!-- <UFooter class="border-t border-t-default">
            <template #bottom>
                <UContainer>
                    <UFooterColumns />
                </UContainer>
            </template>
            <template #left>
                <div class="flex flex-col items-stretch gap-4">
                    <UUser name="Created by Matteo Beltrame" :avatar="{ src: 'https://tratteo.it/favicon.svg' }"></UUser>
                    <CopyableText class="h-8 text-nowrap" :content="appMeta.author.email" />
                </div>
            </template>
        </UFooter> -->
    </UApp>
</template>
