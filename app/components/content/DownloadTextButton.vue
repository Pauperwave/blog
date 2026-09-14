<script setup lang="ts">
interface Props {
  filename: string
  content: string
  label?: string
}

const { filename, content, label = "Scarica" } = defineProps<Props>()

const download = () => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}
</script>

<template>
  <UButton
    color="neutral"
    variant="subtle"
    icon="i-lucide-download"
    class="my-2"
    @click="download"
  >
    {{ label }}
  </UButton>
</template>
