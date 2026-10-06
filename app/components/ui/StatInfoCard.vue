<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  description: string
  valueClass?: string
}

const { label, value, description, valueClass = 'text-2xl' } = defineProps<Props>()
</script>

<template>
  <UCard class="bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm">
    <p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {{ label }}
    </p>
    <p :class="['mt-1 font-bold', valueClass]">
      {{ value }}
    </p>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ description }}
    </p>
  </UCard>
</template>
