<script setup lang="ts">
import { toBlob } from 'html-to-image'
import type { DecklistContext } from '~/composables/useDecklistContext'
import type { DeckStats } from '~/utils/deck-stats'
import DecklistGraphic from './DecklistGraphic.vue'

const { header } = defineProps<{
  header: DecklistContext['header']
  cards: DecklistContext['cards']
  stats: DeckStats
}>()

const open = defineModel<boolean>('open', { required: true })

const toast = useToast()
const graphic = useTemplateRef<InstanceType<typeof DecklistGraphic>>('graphic')
const isExporting = ref(false)

const fileName = computed(() => `${[header.name, header.player].filter((part): part is string => Boolean(part)).map(slugify).join('-')}.png`)

async function renderImage(): Promise<Blob> {
  const element = graphic.value?.$el as HTMLElement | undefined
  if (!element) throw new Error('Graphic area not mounted')

  // pixelRatio 2 for a sharp image on social feeds
  const blob = await toBlob(element, { pixelRatio: 2, cacheBust: true })
  if (!blob) throw new Error('Image rendering failed')
  return blob
}

async function downloadImage() {
  isExporting.value = true
  try {
    const url = URL.createObjectURL(await renderImage())
    const link = document.createElement('a')
    link.href = url
    link.download = fileName.value
    link.click()
    URL.revokeObjectURL(url)
    toast.add({ title: 'Immagine scaricata', icon: 'i-lucide-check', color: 'success' })
  } catch {
    toast.add({ title: 'Download non riuscito', description: 'Impossibile generare l\'immagine', icon: 'i-lucide-x', color: 'error' })
  } finally {
    isExporting.value = false
  }
}

async function copyImage() {
  isExporting.value = true
  try {
    // The promise goes straight into ClipboardItem: Safari only allows the write inside the click gesture
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': renderImage() })])
    toast.add({ title: 'Immagine copiata', description: 'Incollala dove vuoi', icon: 'i-lucide-check', color: 'success' })
  } catch {
    toast.add({ title: 'Copia non riuscita', description: 'Impossibile copiare l\'immagine negli appunti', icon: 'i-lucide-x', color: 'error' })
  } finally {
    isExporting.value = false
  }
}
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
            @click="downloadImage"
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
