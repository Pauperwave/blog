import { toPng } from 'html-to-image'

export interface UseShareImageOptions {
  watermarkLogo?: string
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  imageFormat?: 'png' | 'jpeg'
}

export function useShareImage(options: UseShareImageOptions = {}) {
  const {
    watermarkLogo = '/logo/pauperwave.png',
    watermarkPosition = 'bottom-right',
    imageFormat = 'png'
  } = options

  const toast = useToast()
  const isGenerating = ref(false)

  /**
   * Load watermark image and return as HTMLImageElement
   */
  async function loadWatermarkImage(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = watermarkLogo
    })
  }

  /**
   * Create watermark overlay element
   */
  function createWatermarkElement(img: HTMLImageElement): HTMLElement {
    const watermark = document.createElement('div')
    watermark.style.position = 'absolute'
    watermark.style.opacity = '0.6'
    watermark.style.zIndex = '9999'
    watermark.style.pointerEvents = 'none'
    watermark.setAttribute('data-watermark', 'true')

    // Position based on option
    const positions = {
      'top-left': { top: '16px', left: '16px' },
      'top-right': { top: '16px', right: '16px' },
      'bottom-left': { bottom: '16px', left: '16px' },
      'bottom-right': { bottom: '16px', right: '16px' }
    }
    
    const pos = positions[watermarkPosition]
    Object.assign(watermark.style, pos)

    // Clone and style the image
    const watermarkImg = img.cloneNode(true) as HTMLImageElement
    watermarkImg.style.width = '80px'
    watermarkImg.style.height = 'auto'
    watermarkImg.style.display = 'block'

    watermark.appendChild(watermarkImg)
    return watermark
  }

  /**
   * Get actual DOM element from Vue component or raw element
   */
  function getHTMLElement(elementOrComponent: any): HTMLElement | null {
    // If it's null or undefined, return null
    if (!elementOrComponent) {
      return null
    }

    // If it's a Vue component instance, get its root element
    if (elementOrComponent.$el && elementOrComponent.$el instanceof HTMLElement) {
      return elementOrComponent.$el
    }

    // If it's already an HTMLElement, return it
    if (elementOrComponent instanceof HTMLElement) {
      return elementOrComponent
    }

    // If it's a Vue ref, unwrap it
    if (elementOrComponent.value) {
      return getHTMLElement(elementOrComponent.value)
    }

    console.warn('Could not extract HTMLElement from:', elementOrComponent)
    return null
  }

  /**
   * Generate image blob from HTML element with watermark
   */
  async function generateImage(elementOrComponent: any): Promise<Blob> {
    let watermarkElement: HTMLElement | null = null
    const element = getHTMLElement(elementOrComponent)

    if (!element) {
      throw new Error('Could not get valid HTML element for image generation')
    }

    // Find all elements that should be ignored and store their original display values
    const ignoredElements = element.querySelectorAll('[data-html2canvas-ignore], [data-screenshot-ignore]')
    const originalDisplayValues = new Map<Element, string>()

    try {
      // Hide ignored elements
      ignoredElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          originalDisplayValues.set(el, el.style.display)
          el.style.display = 'none'
        }
      })

      // Load and add watermark
      const watermarkImg = await loadWatermarkImage()
      watermarkElement = createWatermarkElement(watermarkImg)
      element.appendChild(watermarkElement)

      // Wait a bit for the watermark to render
      await new Promise(resolve => setTimeout(resolve, 100))

      // Generate image with high quality settings
      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2, // Retina/HiDPI support
        cacheBust: true,
        backgroundColor: '#0f172a'
      })

      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      return blob
    } finally {
      // Restore ignored elements
      ignoredElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          const originalDisplay = originalDisplayValues.get(el)
          el.style.display = originalDisplay || ''
        }
      })

      // Always remove watermark after capture
      if (watermarkElement && watermarkElement.parentNode === element) {
        element.removeChild(watermarkElement)
      }
    }
  }

  /**
   * Create filename from deck name and player name
   * Format: "Deck-Name-by-Player-Name.png"
   */
  function createFilename(deckName: string, playerName?: string): string {
    // Replace spaces with dashes and remove special characters
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

    return `${filename}.${imageFormat}`
  }

  /**
   * Download element as image file
   */
  async function downloadAsImage(
    elementOrComponent: any,
    deckName: string,
    playerName?: string
  ): Promise<void> {
    const element = getHTMLElement(elementOrComponent)
    
    if (!element) {
      console.error('Element not found for image generation')
      toast.add({
        title: 'Error',
        description: 'Could not find element to capture',
        icon: 'i-lucide-alert-circle',
        color: 'error'
      })
      return
    }

    isGenerating.value = true

    try {
      const blob = await generateImage(element)
      const filename = createFilename(deckName, playerName)

      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.add({
        title: 'Image downloaded!',
        description: `Saved as ${filename}`,
        icon: 'i-lucide-check',
        color: 'success'
      })
    } catch (error) {
      console.error('Failed to generate image:', error)
      toast.add({
        title: 'Failed to generate image',
        description: 'Could not create shareable image',
        icon: 'i-lucide-x',
        color: 'error'
      })
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Copy element as image to clipboard
   */
  async function copyToClipboard(elementOrComponent: any): Promise<void> {
    const element = getHTMLElement(elementOrComponent)
    
    if (!element) {
      console.error('Element not found for image generation')
      toast.add({
        title: 'Error',
        description: 'Could not find element to capture',
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

    isGenerating.value = true

    try {
      const blob = await generateImage(element)

      // Copy to clipboard using Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])

      toast.add({
        title: 'Image copied!',
        description: 'You can now paste it anywhere',
        icon: 'i-lucide-check',
        color: 'success'
      })
    } catch (error) {
      console.error('Failed to copy image:', error)
      
      // Check if it's a permission error
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.add({
          title: 'Permission denied',
          description: 'Please allow clipboard access to copy images',
          icon: 'i-lucide-alert-circle',
          color: 'warning'
        })
      } else {
        toast.add({
          title: 'Failed to copy image',
          description: 'Could not copy image to clipboard',
          icon: 'i-lucide-x',
          color: 'error'
        })
      }
    } finally {
      isGenerating.value = false
    }
  }

  return {
    downloadAsImage,
    copyToClipboard,
    isGenerating: readonly(isGenerating)
  }
}
