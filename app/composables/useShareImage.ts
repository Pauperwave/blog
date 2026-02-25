import { domToPng } from 'modern-screenshot'

/**
 * Options for generating a single image format
 */
export interface GenerateImageOptions {
  backgroundColor: string
  width: number
  height: number
  contentWidth: number
  scaleFactor?: number
}

/**
 * Result from generating an image
 */
export interface GeneratedImageResult {
  blob: Blob
  dataUrl: string
}

interface ElementLikeComponent {
  $el?: unknown
}

interface RefLikeValue {
  value?: unknown
}

/**
 * Get actual DOM element from Vue component or raw element
 */
export function getHTMLElement(elementOrComponent: unknown): HTMLElement | null {
  if (!elementOrComponent) return null

  if (
    typeof elementOrComponent === 'object'
    && '$el' in elementOrComponent
    && (elementOrComponent as ElementLikeComponent).$el instanceof HTMLElement
  ) {
    return (elementOrComponent as ElementLikeComponent).$el as HTMLElement
  }

  if (elementOrComponent instanceof HTMLElement) {
    return elementOrComponent
  }

  if (
    typeof elementOrComponent === 'object'
    && 'value' in elementOrComponent
    && (elementOrComponent as RefLikeValue).value
  ) {
    return getHTMLElement((elementOrComponent as RefLikeValue).value)
  }

  console.warn('Could not extract HTMLElement from:', elementOrComponent)
  return null
}

/**
 * Generate image from element with specified format options.
 * Low-level utility - returns both blob and dataUrl for flexibility.
 */
export async function generateImage(
  elementOrComponent: unknown,
  options: GenerateImageOptions
): Promise<GeneratedImageResult> {
  const { backgroundColor, width, height, contentWidth } = options
  
  const element = getHTMLElement(elementOrComponent)

  if (!element) {
    throw new Error('Could not get valid HTML element for image generation')
  }

  console.log('[Instagram] Starting generation:', { width, height, contentWidth, backgroundColor })
  console.log('[Instagram] Element:', element.tagName, element.className)

  // Create wrapper with specified dimensions
  // Positioned behind modal so user doesn't see the generation
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: ${width}px;
    height: ${height}px;
    background: ${backgroundColor};
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    z-index: -9999;
    pointer-events: none;
  `

  try {
    // Clone the element
    const clonedElement = element.cloneNode(true) as HTMLElement
    
    console.log('[Instagram] Cloned element, children:', clonedElement.children.length)

    // Remove footer elements
    clonedElement.querySelectorAll('[data-html2canvas-ignore], [data-screenshot-ignore]')
      .forEach(el => el.remove())

    // Apply Instagram styling to cloned element
    // Use CSS transform to scale everything proportionally
    // This preserves the layout and scales fonts, mana symbols, spacing - everything!
    const scaleFactor = options.scaleFactor ?? 1.8
    
    // Calculate width before scaling
    const scaledWidth = contentWidth / scaleFactor
    
    // Set dimensions
    clonedElement.style.width = `${scaledWidth}px`
    clonedElement.style.maxWidth = `${scaledWidth}px`
    clonedElement.style.margin = '0'
    
    // Apply scale transform from center
    clonedElement.style.transform = `scale(${scaleFactor})`
    clonedElement.style.transformOrigin = 'center center'

    // Force single column layout
    const decklistGrid = clonedElement.querySelector('.decklist-grid') as HTMLElement
    if (decklistGrid) {
      decklistGrid.style.gridTemplateColumns = '1fr'
      console.log('[Instagram] Grid found and styled')
    } else {
      console.warn('[Instagram] No .decklist-grid found!')
    }

    // Add to wrapper and DOM
    wrapper.appendChild(clonedElement)
    
    // Add Pauperwave logo in bottom right corner
    const logo = document.createElement('img')
    logo.src = '/logo/pauperwave.png'
    logo.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      height: 80px;
      width: auto;
      opacity: 0.9;
      object-fit: contain;
    `
    wrapper.appendChild(logo)
    
    document.body.appendChild(wrapper)

    console.log('[Instagram] Wrapper in DOM, waiting...')

    // Wait for layout and logo to load
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('[Instagram] Calling domToPng...')

    // Generate image with modern-screenshot
    const dataUrl = await domToPng(wrapper, {
      width,
      height,
      scale: 1, // Exact dimensions, not 2x
      quality: 0.95
    })

    console.log('[Instagram] Image generated, dataUrl length:', dataUrl.length)

    // Convert data URL to blob
    const response = await fetch(dataUrl)
    const blob = await response.blob()

    console.log('[Instagram] Blob created, size:', blob.size)

    // Return both blob and dataUrl for flexibility
    return { blob, dataUrl }
  } catch (error) {
    console.error('[Instagram] Error:', error)
    throw error
  } finally {
    // Always cleanup
    if (wrapper.parentNode) {
      console.log('[Instagram] Cleaning up wrapper')
      document.body.removeChild(wrapper)
    }
  }
}
