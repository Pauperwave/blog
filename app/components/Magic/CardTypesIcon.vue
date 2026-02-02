<script setup lang="ts">
const props = defineProps<{
  type: string
  size?: 'sm' | 'md' | 'lg'
}>()

const sizeClass = computed(() => {
  const size = props.size || 'md'
  const map: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'ms-size-sm',
    md: 'ms-size-md',
    lg: 'ms-size-lg'
  }
  return map[size]
})

const typeClass = computed(() => {
  const key = props.type.trim().toLowerCase()
  const map: Record<string, string> = {
    artifacts: 'artifact',
    creatures: 'creature',
    enchantments: 'enchantment',
    instants: 'instant',
    lands: 'land',
    sorceries: 'sorcery',
  }

  return map[key]
})
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
