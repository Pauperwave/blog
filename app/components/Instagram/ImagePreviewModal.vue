<script setup lang="ts">
import { useInstagramGenerator, type InstagramFormatKey } from '~/composables/useInstagramGenerator'

const props = defineProps<{
  /** Whether the modal is open */
  open: boolean
  /** Element or component to capture */
  element: any
  /** Background color for the image */
  backgroundColor: string
  /** Deck name for filename */
  deckName: string
  /** Player name for filename (optional) */
  playerName?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const {
  isGenerating,
  currentFormat,
  currentImage,
  availableFormats,
  error,
  generateAllFormats,
  switchFormat,
  downloadCurrent,
  copyCurrent,
  reset
} = useInstagramGenerator()

// Format selector options for USelect
const formatOptions = computed(() => {
  return availableFormats.map(format => ({
    value: format.key,
    label: `${format.label} (${format.width}×${format.height})`
  }))
})

// Selected format for two-way binding
const selectedFormat = computed({
  get: () => currentFormat.value,
  set: (value: InstagramFormatKey) => switchFormat(value)
})

// Two-way binding for modal open state
const internalOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

/**
 * Generate images when modal opens
 */
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    try {
      await generateAllFormats(
        props.element,
        props.backgroundColor,
        props.deckName,
        props.playerName
      )
    } catch (error) {
      console.error('[ImagePreviewModal] Failed to generate images:', error)
    }
  } else {
    // Cleanup when modal closes
    reset()
  }
})

/**
 * Handle download button click
 */
async function handleDownload() {
  await downloadCurrent(props.deckName, props.playerName)
}

/**
 * Handle copy button click
 */
async function handleCopy() {
  await copyCurrent()
}
</script>

<template>
  <UModal
    v-model:open="internalOpen"
    title="Share to Instagram"
    :overlay="true"
    fullscreen
    :ui="{
      body: 'flex items-center justify-center',
      overlay: {
        base: 'bg-gray-900/75 dark:bg-gray-900/75',
        background: 'bg-gray-900/75 backdrop-blur-sm'
      }
    }"
  >
    <!-- Body: Loading or Preview -->
    <template #body>
      <div class="w-full h-full flex items-center justify-center px-4">
        <!-- Loading State -->
        <div v-if="isGenerating" class="flex flex-col items-center justify-center py-12 gap-4">
          <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl text-primary" />
          <p class="text-base text-gray-600 dark:text-gray-400">
            Generating Instagram formats...
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500">
            This may take a few seconds
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-12 gap-4">
          <UIcon name="i-lucide-alert-circle" class="text-4xl text-red-500" />
          <p class="text-base text-gray-900 dark:text-white font-semibold">
            Failed to generate images
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ error.message }}
          </p>
          <UButton
            label="Close"
            color="gray"
            @click="internalOpen = false"
          />
        </div>

        <!-- Preview State -->
        <div v-else-if="currentImage" class="flex flex-col items-center justify-center gap-4 w-full h-full max-w-4xl">
          <!-- Image Preview -->
          <div class="flex justify-center items-center w-full h-full">
            <img
              :src="currentImage.objectUrl"
              :alt="`${deckName} - ${currentImage.format.label}`"
              class="max-w-full max-h-full object-contain rounded shadow-lg"
            />
          </div>

          <!-- Format Info -->
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              {{ currentImage.format.width }} × {{ currentImage.format.height }}px
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Footer: Format Selector & Action Buttons -->
    <template #footer>
      <div class="flex flex-col sm:flex-row items-center gap-4 w-full">
        <!-- Cancel button (left-aligned, subtle) -->
        <UButton
          label="Cancel"
          color="gray"
          variant="subtle"
          @click="internalOpen = false"
        />
        
        <!-- Format Selector (center on desktop, full width on mobile) -->
        <div class="flex items-center gap-3 flex-1 justify-center">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Format:
          </label>
          <USelect
            v-model="selectedFormat"
            :items="formatOptions"
            value-key="value"
            :disabled="isGenerating || !currentImage"
            class="w-auto min-w-[200px]"
          />
        </div>
        
        <!-- Action buttons (right-aligned) -->
        <div class="flex gap-2">
          <UButton
            label="Copy"
            icon="i-lucide-copy"
            color="primary"
            variant="outline"
            :disabled="!currentImage || isGenerating"
            @click="handleCopy"
          />
          <UButton
            label="Download"
            icon="i-lucide-download"
            color="primary"
            :disabled="!currentImage || isGenerating"
            @click="handleDownload"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
