<script setup lang="ts">
import { useDecklistStyles } from '~/composables/useDecklistStyles'
import MagicCardManaSymbol, { type ManaCombination } from './card/ManaSymbol.vue'

const { name, player = '', placement = '', headerGradient = undefined } = defineProps<{
  name: string
  player?: string
  placement?: string
  headerGradient?: ManaCombination
}>()

const { textClasses } = useDecklistStyles(headerGradient)
</script>

<template>
  <div class="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-2">
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-2">
        <h2
          class="text-xl font-semibold leading-tight m-0"
          :class="textClasses.heading"
        >
          {{ name }}
        </h2>
        <MagicCardManaSymbol
          v-if="headerGradient"
          :combination="headerGradient"
        />
      </div>
      <p
        v-if="player"
        class="text-base font-semibold leading-tight m-0"
        :class="textClasses.subheading"
      >
        {{ player }}
      </p>
    </div>
    <div
      v-if="placement"
      class="text-right text-base font-semibold"
      :class="textClasses.placement"
    >
      {{ placement }}
    </div>
  </div>
</template>
