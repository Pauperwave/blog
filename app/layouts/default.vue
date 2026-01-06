<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";
import appMeta from "~/app.meta";

const navItems: NavigationMenuItem[] = [
    { label: "YouTube channel", icon: "logos:youtube-icon", target: "_blank", to: "https://www.youtube.com/@alessandromoretti1177" },
    { label: "Repository", icon: "mdi:github", target: "_blank", to: "https://github.com/Pauperwave/blog" },
];
</script>

<template>
    <u-app>
        <u-header mode="slideover">
            <template #left>
                <u-user name="Pauperwave Blog" to="/" :avatar="{ src: 'https://avatars.githubusercontent.com/u/225214755?v=4' }"></u-user>
            </template>
            <template #right>
                <color-mode-button></color-mode-button>
            </template>
            <u-navigation-menu :items="navItems"></u-navigation-menu>
            <template #body>
                <u-navigation-menu :items="navItems"></u-navigation-menu>
            </template>
        </u-header>
        <u-main>
            <u-container>
                <nuxt-page></nuxt-page>
            </u-container>
        </u-main>
        <!-- <u-footer class="border-t border-t-default">
            <template #bottom>
                <u-container>
                    <u-footer-columns></u-footer-columns>
                </u-container>
            </template>
            <template #left>
                <div class="flex flex-col items-stretch gap-4">
                    <u-user name="Created by Matteo Beltrame" :avatar="{ src: 'https://tratteo.it/favicon.svg' }"></u-user>
                    <copyable-text class="h-8 text-nowrap" :content="appMeta.author.email"></copyable-text>
                </div>
            </template>
        </u-footer> -->
    </u-app>
</template>
