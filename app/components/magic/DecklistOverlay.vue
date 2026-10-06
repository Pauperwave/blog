<script setup lang="ts">
import type { DecklistHeaderInfo } from '~/composables/useDecklistContext'
import type { DeckCard } from '~/utils/deck-cards'
import { deckImageFileName } from '~/utils/deck-image'
import type { DeckStats } from '~/utils/deck-stats'
import DecklistGraphic from './DecklistGraphic.vue'

const { header, shareUrl } = defineProps<{
  header: DecklistHeaderInfo
  cards: DeckCard[]
  stats: DeckStats
  /** Link that opens this overlay directly */
  shareUrl: string
}>()

const open = defineModel<boolean>('open', { required: true })

const graphic = useTemplateRef<InstanceType<typeof DecklistGraphic>>('graphic')
const { isExporting, downloadImage, copyImage } = useElementImageExport(() => graphic.value?.$el)
const { copyToClipboard } = useCopyToClipboard()
const copyShareUrl = () => copyToClipboard(shareUrl, {
  successDescription: 'Link copiato negli appunti',
  errorDescription: 'Impossibile copiare il link negli appunti'
})
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
      <!-- .self: only clicks on the empty side areas close it, not clicks on the graphic -->
      <div class="relative h-full overflow-auto pt-10" @click.self="open = false">
        <!-- pointer-events-none: the empty parts of the bar still close the overlay on click -->
        <div class="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-center gap-2">
          <UButton
            icon="i-lucide-copy"
            size="sm"
            variant="subtle"
            class="pointer-events-auto cursor-pointer"
            label="Copia immagine"
            :loading="isExporting"
            @click="copyImage"
          />
          <UButton
            icon="i-lucide-download"
            size="sm"
            variant="subtle"
            class="pointer-events-auto cursor-pointer"
            label="Scarica immagine"
            :loading="isExporting"
            @click="downloadImage(fileName)"
          />
          <UButton
            icon="i-lucide-share-2"
            size="sm"
            variant="subtle"
            class="pointer-events-auto cursor-pointer"
            label="Condividi"
            @click="copyShareUrl"
          />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            class="pointer-events-auto absolute end-0 cursor-pointer"
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
