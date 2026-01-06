<template>
    <u-app>
        <u-header mode="slideover">
            <template #left>
                <u-user name="Pauperwave Blog" to="/" :avatar="{ src: 'https://avatars.githubusercontent.com/u/225214755?v=4' }"></u-user>
            </template>
        </u-header>
        <u-main class="px-4">
            <u-container>
                <u-error
                    :error="{
                        statusCode: error?.statusCode,
                        statusMessage: error?.statusMessage,
                        message: error?.message,
                    }"
                />
            </u-container>
        </u-main>
    </u-app>
</template>

<script lang="ts" setup>
const error = useError();

useSeoMeta({
    title: error.value?.statusCode.toString(),
    description: error.value?.statusMessage,
});
</script>

<style lang="css"></style>
