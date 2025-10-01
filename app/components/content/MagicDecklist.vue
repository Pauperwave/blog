<script setup lang="ts">
import { computed } from "vue"

// Capture props into a variable
const props = defineProps<{
    name: string
    author?: string
    position?: string
    description?: string
}>()

// Create a title string with optional position
const title = computed(() => {
    return props.position ? `${props.name} — ${props.position}` : props.name
})
</script>

<template>
    <div class="decklist rounded-2xl shadow-lg bg-white p-6 space-y-4">
        <!-- Header -->
        <header class="border-b pb-4 mb-4">
            <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
            <p v-if="props.author" class="text-sm text-gray-600">By {{ props.author }}</p>
            <p v-if="props.description" class="mt-2 text-gray-700">{{ props.description }}</p>
        </header>

        <!-- Decklist body (Markdown content via slot) -->
        <div class="prose prose-sm max-w-none">
            <slot />
        </div>
    </div>
</template>