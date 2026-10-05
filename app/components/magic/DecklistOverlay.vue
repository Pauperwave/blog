<script setup lang="ts">
import type { DecklistHeaderInfo } from '~/composables/useDecklistContext'
import type { DeckCard } from '~/utils/deck-cards'
import { deckImageFileName } from '~/utils/deck-image'
import type { DeckStats } from '~/utils/deck-stats'
import DecklistGraphic from './DecklistGraphic.vue'

const { header } = defineProps<{
  header: DecklistHeaderInfo
  cards: DeckCard[]
  stats: DeckStats
}>()

const open = defineModel<boolean>('open', { required: true })

const graphic = useTemplateRef<InstanceType<typeof DecklistGraphic>>('graphic')
const { isExporting, downloadImage, copyImage } = useElementImageExport(() => graphic.value?.$el)
const fileName = computed(() => deckImageFileName(header))
</script>

<template>
  <UModal
    v-model:open="open"
    fullscreen
    :title="`${header.name} - carte`"
    :description="`Carte del mazzo ${header.name}`"
  >
    <template #content>
      <div class="relative h-full overflow-auto pt-14">
        <div class="absolute end-3 top-3 z-20 flex items-center gap-2">
          <UButton
            icon="i-lucide-copy"
            size="sm"
            variant="subtle"
            class="cursor-pointer"
            label="Copia immagine"
            :loading="isExporting"
            @click="copyImage"
          />
          <UButton
            icon="i-lucide-download"
            size="sm"
            variant="subtle"
            class="cursor-pointer"
            label="Scarica immagine"
            :loading="isExporting"
            @click="downloadImage(fileName)"
          />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
            aria-label="Chiudi"
            @click="open = false"
          />
        </div>
        <DecklistGraphic
          ref="graphic"
          class="mx-auto"
          :header="header"
          :cards="cards"
          :stats="stats"
        />
      </div>
    </template>
  </UModal>
</template>
