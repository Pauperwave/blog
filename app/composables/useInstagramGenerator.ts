import { generateImage, getHTMLElement, type GenerateImageOptions } from './useShareImage'

/**
 * Instagram format configurations
 */
export const INSTAGRAM_FORMATS = {
  reel: {
    key: 'reel',
    label: 'Reel',
    description: 'Instagram Reel/Story (1080x1920)',
    width: 1080,
    height: 1920,
    contentWidth: 900,
    scaleFactor: 2.2
  },
  portrait: {
    key: 'portrait',
    label: 'Portrait Post',
    description: 'Instagram Portrait Post (1080x1350)',
    width: 1080,
    height: 1350,
    contentWidth: 900,
    scaleFactor: 1.5
  }
} as const

export type InstagramFormatKey = keyof typeof INSTAGRAM_FORMATS
export type InstagramFormat = typeof INSTAGRAM_FORMATS[InstagramFormatKey]

/**
 * Generated image with metadata
 */
export interface GeneratedImage {
  format: InstagramFormat
  blob: Blob
  dataUrl: string
  objectUrl: string // For preview and download
}

/**
 * State for the Instagram generator
 */
interface InstagramGeneratorState {
  isGenerating: boolean
  currentFormat: InstagramFormatKey
  images: Map<InstagramFormatKey, GeneratedImage>
  error: Error | null
}

/**
 * High-level composable for generating Instagram images in multiple formats
 */
export function useInstagramGenerator() {
  const toast = useToast()
  
  const state = reactive<InstagramGeneratorState>({
    isGenerating: false,
    currentFormat: 'reel',
    images: new Map(),
    error: null
  })

  /**
   * Generate all 3 Instagram formats sequentially
   */
  async function generateAllFormats(
    elementOrComponent: HTMLElement | ComponentPublicInstance,
    backgroundColor: string
  ): Promise<void> {
    const element = getHTMLElement(elementOrComponent)
    
    if (!element) {
      throw new Error('Could not get valid HTML element for image generation')
    }

    state.isGenerating = true
    state.error = null
    state.images.clear()

    try {
      console.log('[InstagramGenerator] Starting generation for all formats')

      // Generate each format sequentially
      const formatKeys: InstagramFormatKey[] = ['reel', 'portrait']
      
      for (const formatKey of formatKeys) {
        const format = INSTAGRAM_FORMATS[formatKey]
        
        console.log(`[InstagramGenerator] Generating ${format.label}...`)

        const options: GenerateImageOptions = {
          backgroundColor,
          width: format.width,
          height: format.height,
          contentWidth: format.contentWidth,
          scaleFactor: format.scaleFactor
        }

        const result = await generateImage(element, options)
        
        // Create object URL for preview and download
        const objectUrl = URL.createObjectURL(result.blob)

        state.images.set(formatKey, {
          format,
          blob: result.blob,
          dataUrl: result.dataUrl,
          objectUrl
        })

        console.log(`[InstagramGenerator] ${format.label} generated (${result.blob.size} bytes)`)
      }

      console.log('[InstagramGenerator] All formats generated successfully')
    } catch (error) {
      console.error('[InstagramGenerator] Error generating images:', error)
      state.error = error as Error
      throw error
    } finally {
      state.isGenerating = false
    }
  }

  /**
   * Switch to a different format
   */
  function switchFormat(formatKey: InstagramFormatKey): void {
    if (!state.images.has(formatKey)) {
      console.warn(`[InstagramGenerator] Format ${formatKey} not generated yet`)
      return
    }
    
    state.currentFormat = formatKey
    console.log(`[InstagramGenerator] Switched to ${formatKey}`)
  }

  /**
   * Get the currently selected image
   */
  const currentImage = computed<GeneratedImage | null>(() => {
    return state.images.get(state.currentFormat) || null
  })

  /**
   * Create sanitized filename
   */
  function createFilename(deckName: string, playerName: string | undefined, formatKey: InstagramFormatKey): string {
    const sanitize = (str: string) => 
      str.trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .replace(/-+/g, '-')

    let filename = sanitize(deckName)
    
    if (playerName) {
      const sanitizedPlayer = sanitize(playerName)
      filename = `${filename}-by-${sanitizedPlayer}`
    }

    const format = INSTAGRAM_FORMATS[formatKey]
    filename = `${filename}-${format.key}`

    return `${filename}.png`
  }

  /**
   * Download the current format
   */
  async function downloadCurrent(deckName: string, playerName?: string): Promise<void> {
    const image = currentImage.value
    
    if (!image) {
      toast.add({
        title: 'Error',
        description: 'No image available to download',
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })
      return
    }

    try {
      const filename = createFilename(deckName, playerName, state.currentFormat)

      // Create download link
      const link = document.createElement('a')
      link.href = image.objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.add({
        title: 'Image downloaded!',
        description: `Saved as ${filename}`,
        icon: 'i-lucide-check',
        color: 'success'
      })
    } catch (error) {
      console.error('[InstagramGenerator] Failed to download:', error)
      toast.add({
        title: 'Failed to download',
        description: 'Could not download image',
        icon: 'i-lucide-x',
        color: 'error'
      })
    }
  }

  /**
   * Copy the current format to clipboard
   */
  async function copyCurrent(): Promise<void> {
    const image = currentImage.value
    
    if (!image) {
      toast.add({
        title: 'Error',
        description: 'No image available to copy',
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })
      return
    }

    // Check browser support
    if (!navigator.clipboard?.write) {
      toast.add({
        title: 'Not supported',
        description: 'Your browser doesn\'t support copying images. Use Download instead.',
        icon: 'i-lucide-alert-circle',
        color: 'warning'
      })
      return
    }

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [image.blob.type]: image.blob
        })
      ])

      toast.add({
        title: 'Image copied!',
        description: `${image.format.label} copied to clipboard`,
        icon: 'i-lucide-check',
        color: 'success'
      })
    } catch (error) {
      console.error('[InstagramGenerator] Failed to copy:', error)
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.add({
          title: 'Permission denied',
          description: 'Please allow clipboard access to copy images',
          icon: 'i-lucide-alert-circle',
          color: 'warning'
        })
      } else {
        toast.add({
          title: 'Failed to copy',
          description: 'Could not copy image to clipboard',
          icon: 'i-lucide-x',
          color: 'error'
        })
      }
    }
  }

  /**
   * Reset state and cleanup object URLs
   */
  function reset(): void {
    console.log('[InstagramGenerator] Resetting state and cleaning up URLs')
    
    // Revoke all object URLs to free memory
    state.images.forEach((image) => {
      URL.revokeObjectURL(image.objectUrl)
    })

    state.images.clear()
    state.currentFormat = 'reel'
    state.error = null
  }

  /**
   * Cleanup on unmount
   */
  onUnmounted(() => {
    reset()
  })

  return {
    // State
    isGenerating: computed(() => state.isGenerating),
    currentFormat: computed(() => state.currentFormat),
    currentImage,
    availableFormats: Object.values(INSTAGRAM_FORMATS),
    error: computed(() => state.error),

    // Actions
    generateAllFormats,
    switchFormat,
    downloadCurrent,
    copyCurrent,
    reset
  }
}
