<script setup lang="ts">
import type { DecklistHeaderInfo, DecklistSwipeCard } from '~/composables/useDecklistContext'
import { useDecklistStyles } from '~/composables/useDecklistStyles'
import DecklistHeader from './DecklistHeader.vue'

const { header, cards, startIndex } = defineProps<{
  header: DecklistHeaderInfo
  cards: DecklistSwipeCard[]
  startIndex: number
}>()

const open = defineModel<boolean>('open', { required: true })

const { headerClass } = useDecklistStyles(header.headerGradient)

const currentIndex = ref(startIndex)
const currentCard = computed(() => cards[currentIndex.value])

// The carousel remounts at startIndex on every open, so the caption must restart there too
watch(open, (isOpen) => {
  if (isOpen) currentIndex.value = startIndex
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="`${header.name} - carte`"
    :description="`Carte del mazzo ${header.name}`"
    :ui="{
      content: 'bg-transparent shadow-none ring-0',
      overlay: 'bg-black/80'
    }"
  >
    <template #content>
      <div v-if="currentCard" class="flex flex-col gap-3 p-2">
        <div class="rounded-xl p-4" :class="headerClass">
          <DecklistHeader v-bind="header" />
        </div>
        <UCarousel
          v-slot="{ item }"
          :items="cards"
          :start-index="startIndex"
          :ui="{ container: '-ms-2', item: 'basis-[92%] ps-2' }"
          @select="currentIndex = $event"
        >
          <MagicCardFlipImage
            :image="item.imageUrl"
            :back-image="item.backImageUrl"
            :label="item.name"
            compact
          />
        </UCarousel>
        <div class="text-center text-white">
          <p class="m-0 font-semibold">
            {{ currentCard.quantity }}× {{ currentCard.name }}
          </p>
          <p class="m-0 text-sm opacity-80">
            {{ currentCard.section }} · {{ currentIndex + 1 }} / {{ cards.length }}
          </p>
        </div>
      </div>
    </template>
  </UModal>
</template>
