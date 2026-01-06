<script setup lang="ts">
interface Props {
  name: string
  image?: string
}

const props = defineProps<Props>()

// Puoi costruire l'URL dell'immagine dinamicamente
const imageUrl = computed(() => {
  return props.image || `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(props.name)}&format=image`
})
</script>

<template>
  <UTooltip :delay-duration="300" :content="{ side: 'top', sideOffset: 8 }">
    <span class="font-semibold text-primary cursor-help">
      {{ name }}
    </span>
    
    <template #content>
      <img 
        :src="imageUrl" 
        :alt="name"
        class="w-48 h-auto rounded-lg shadow-xl"
      />
    </template>
  </UTooltip>
</template>
