<script lang="ts" setup>
import { useSlots } from 'vue'

const props = defineProps<{
  name?: string
  score?: number
}>()

const name = computed(() => props.name ?? "Nome della persona che valuta")

const slots = useSlots()
</script>

<template>
  <div class="p-6 border bg-blue dark:bg-black dark:border-gray-700 rounded">
    <h2 class="text-4xl font-semibold mb-2">
      {{ name }} - {{ score }}
    </h2>
    <div v-if="$slots.default">
      <slot />
    </div>
  </div>
</template>