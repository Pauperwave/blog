<!-- components/FilterSection.vue -->
<script setup lang="ts">
interface FilterOption {
  value: string
  label: string
  count: number
}

interface Props {
  label: string
  pluralLabel: string
  color?: 'neutral' | 'primary' | 'info' | 'warning' | 'error'
  options: FilterOption[]
  selectedValue: string | null
  allLabel: string
  defaultOpen?: boolean
  maxHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'neutral',
  defaultOpen: true,
  maxHeight: false
})

const emit = defineEmits<{
  select: [value: string | null]
}>()

const isOpen = ref(props.defaultOpen)
</script>

<template>
  <UCollapsible :default-open="defaultOpen">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <p 
        class="text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400 flex items-center gap-2 cursor-pointer"
        @click="isOpen = !isOpen"
      >
        <UIcon 
          :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" 
          class="w-4 h-4" 
        />
        {{ label }}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ options.length }} {{ pluralLabel }}
      </p>
    </div>
    
    <template #content>
      <div 
        :class="[
          'flex flex-wrap gap-2 pt-2',
          maxHeight && 'max-h-36 overflow-y-auto pr-1'
        ]"
      >
        <UButton
          size="xs"
          :color="color"
          :variant="selectedValue === null ? 'solid' : 'outline'"
          class="cursor-pointer"
          @click="emit('select', null)"
        >
          {{ allLabel }}
        </UButton>
        
        <UButton
          v-for="option in options"
          :key="option.value"
          size="xs"
          :color="color"
          :variant="selectedValue === option.value ? 'solid' : 'outline'"
          class="cursor-pointer"
          @click="emit('select', option.value)"
        >
          {{ option.label }} ({{ option.count }})
        </UButton>
      </div>
    </template>
  </UCollapsible>
</template>
