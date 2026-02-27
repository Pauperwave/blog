<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui"

const clipboard = useClipboard()
const copied = ref<boolean>(false)

const props = defineProps<{
  content: string;
  items?: DropdownMenuItem[]
}>()

const emit = defineEmits<{
  (e: "click", val: string, ev: MouseEvent): void
}>()

function onClick(event: MouseEvent) {
  emit("click", props.content, event)
  clipboard.copy(props.content)
  copied.value = true
  setTimeout(() => {
    return (copied.value = false)
  }, 1500)
}
</script>

<template>
  <UFieldGroup class="w-full">
    <UInput
      :model-value="content"
      aria-label="Copy text"
      readonly
      class="w-full"
    />
    <UButton
      type="button"
      variant="subtle"
      :color="copied ? 'success' : 'neutral'"
      size="sm"
      aria-label="copy content"
      :icon="copied ? 'i-lucide-circle-check' : 'i-lucide-copy'"
      @click="onClick"
    />
    <UDropdownMenu
      v-if="(items?.length ?? 0) > 0"
      :items="props.items ?? []"
    >
      <UButton
        color="neutral"
        variant="subtle"
        icon="i-lucide-chevron-down"
        size="sm"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>

<style lang="css" scoped>
@reference "~/assets/css/main.css";
</style>
