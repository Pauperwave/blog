<script setup lang="ts">
import type { DecklistContext } from '~/composables/useDecklistContext'
import type { DeckStats } from '~/utils/deck-stats'
import DecklistGraphic from './DecklistGraphic.vue'

defineProps<{
  header: DecklistContext['header']
  cards: DecklistContext['cards']
  stats: DeckStats
}>()

const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <UModal
    v-model:open="open"
    fullscreen
    :title="`${header.name} - carte`"
    :description="`Carte del mazzo ${header.name}`"
  >
    <template #content>
      <div class="relative h-full overflow-y-auto">
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          class="absolute end-3 top-3 z-20 cursor-pointer"
          aria-label="Chiudi"
          @click="open = false"
        />
        <DecklistGraphic
          :header="header"
          :cards="cards"
          :stats="stats"
        />
      </div>
    </template>
  </UModal>
</template>
