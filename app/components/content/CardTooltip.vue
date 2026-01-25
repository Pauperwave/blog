<template>
  <UTooltip
    :delay-duration="300"
    :content="{ side: 'top', sideOffset: 8 }"
  >
    <span class="font-semibold text-primary cursor-help">
      {{ displayText }}
    </span>
    
    <template #content>
      <img 
        :src="imageUrl" 
        :alt="name"
        class="w-48 h-auto rounded-lg shadow-xl"
      >
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
interface Props {
  name: string
  image?: string
  set?: string  // Optional set code (e.g., "lea", "m21")
}

const props = defineProps<Props>()

// Display format: Always just "Card Name" (set is used only for image URL)
const displayText = computed(() => {
  return props.name
})

// Build Scryfall API URL with optional set parameter
const imageUrl = computed(() => {
  if (props.image) {
    return props.image
  }
  
  const baseUrl = 'https://api.scryfall.com/cards/named'
  const params = new URLSearchParams({
    exact: props.name,
    format: 'image'
  })
  
  if (props.set) {
    params.append('set', props.set)
  }
  
  return `${baseUrl}?${params.toString()}`
})
</script>