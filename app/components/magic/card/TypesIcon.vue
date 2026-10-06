<script setup lang="ts">
import type { MainDeckSection } from '#shared/utils'

// mana-font icon of each section; typed on the shared sections, so a new section can't miss its icon
const TYPE_ICONS: Record<MainDeckSection, string> = {
  Creatures: 'creature',
  Instants: 'instant',
  Sorceries: 'sorcery',
  Artifacts: 'artifact',
  Enchantments: 'enchantment',
  Lands: 'land'
}

interface Props {
  type: string
  size?: 'sm' | 'md' | 'lg'
}

const { type, size = 'md' } = defineProps<Props>()

const sizeClass = computed(() => {
  const map: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'ms-size-sm',
    md: 'ms-size-md',
    lg: 'ms-size-lg'
  }
  return map[size]
})

const typeClass = computed(() => TYPE_ICONS[type as MainDeckSection] as string | undefined)
</script>

<template>
  <i
    v-if="typeClass"
    :class="['ms', `ms-${typeClass}`, 'ms-card-type', sizeClass]"
    :title="type"
  />
</template>

<style scoped>
@import "mana-font/css/mana.css";

i.ms {
  vertical-align: middle;
  line-height: 1;
}

.ms-size-sm { font-size: 14px; }
.ms-size-md { font-size: 16px; }
.ms-size-lg { font-size: 18px; }
</style>
