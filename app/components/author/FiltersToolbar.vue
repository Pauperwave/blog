<script setup lang="ts">
type SortMode = 'articles' | 'recent' | 'name'

interface Props {
  modelValue: string
  showOnlyActive: boolean
  sortMode: SortMode
  hasActiveFilters: boolean
  resultsCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'toggle-active' | 'clear'): void
  (event: 'set-sort', value: SortMode): void
}>()

const trimmedQuery = computed(() => props.modelValue.trim())
</script>

<template>
  <UCard class="mb-6">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col lg:flex-row lg:items-center gap-3">
        <div class="w-full lg:max-w-md">
          <UInput
            :model-value="props.modelValue"
            placeholder="Cerca per nome, nickname o bio..."
            class="w-full"
            @update:model-value="emit('update:modelValue', String($event ?? ''))"
          />
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <UButton
            :variant="props.showOnlyActive ? 'solid' : 'outline'"
            color="primary"
            size="sm"
            @click="emit('toggle-active')"
          >
            Solo autori attivi
          </UButton>

          <UButton
            :variant="props.sortMode === 'articles' ? 'solid' : 'outline'"
            color="neutral"
            size="sm"
            @click="emit('set-sort', 'articles')"
          >
            Più articoli
          </UButton>

          <UButton
            :variant="props.sortMode === 'recent' ? 'solid' : 'outline'"
            color="neutral"
            size="sm"
            @click="emit('set-sort', 'recent')"
          >
            Più recenti
          </UButton>

          <UButton
            :variant="props.sortMode === 'name' ? 'solid' : 'outline'"
            color="neutral"
            size="sm"
            @click="emit('set-sort', 'name')"
          >
            A-Z
          </UButton>

          <UButton
            v-if="props.hasActiveFilters"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="emit('clear')"
          >
            Reset
          </UButton>
        </div>
      </div>

      <div class="flex items-center justify-between gap-2 flex-wrap text-sm text-gray-600 dark:text-gray-400">
        <span>{{ props.resultsCount }} risultati</span>
        <span v-if="trimmedQuery">
          Ricerca: "{{ trimmedQuery }}"
        </span>
      </div>
    </div>
  </UCard>
</template>
