import { toCanvas } from 'html-to-image'

type ImageType = 'image/png' | 'image/jpeg'

// JPEG for the download (the PNG of a photo-heavy image is ~6 MB, social networks recompress anyway),
// PNG for the clipboard (the only image type ClipboardItem reliably accepts)
const DOWNLOAD_QUALITY = 0.9

/**
 * Renders a DOM element to an image to download or copy, telling the user how it went with a toast.
 * The element must be a single root node with no comment before it, or `$el` of a component is not the element.
 */
export function useElementImageExport(element: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  const toast = useToast()
  const isExporting = ref(false)

  async function renderImage(type: ImageType): Promise<Blob> {
    const target = toValue(element)
    if (!target) throw new Error('Element to export is not mounted')

    // pixelRatio 2 for a sharp image on social feeds. margin 0: the clone would otherwise keep the
    // computed auto margins (px) of a centered element, shifting the content and cropping the right edge
    const canvas = await toCanvas(target, { pixelRatio: 2, cacheBust: true, style: { margin: '0' } })
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, DOWNLOAD_QUALITY))
    if (!blob) throw new Error('Image rendering failed')
    return blob
  }

  async function downloadImage(fileName: string) {
    isExporting.value = true
    try {
      const url = URL.createObjectURL(await renderImage('image/jpeg'))
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.click()
      URL.revokeObjectURL(url)
      toast.add({ title: 'Immagine scaricata', icon: 'i-lucide-check', color: 'success' })
    } catch (error) {
      console.error('[useElementImageExport] image download failed', error)
      toast.add({ title: 'Download non riuscito', description: 'Impossibile generare l\'immagine', icon: 'i-lucide-x', color: 'error' })
    } finally {
      isExporting.value = false
    }
  }

  async function copyImage() {
    isExporting.value = true
    try {
      // The promise goes straight into ClipboardItem: Safari only allows the write inside the click gesture
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': renderImage('image/png') })])
      toast.add({ title: 'Immagine copiata', description: 'Incollala dove vuoi', icon: 'i-lucide-check', color: 'success' })
    } catch (error) {
      console.error('[useElementImageExport] image copy failed', error)
      toast.add({ title: 'Copia non riuscita', description: 'Impossibile copiare l\'immagine negli appunti', icon: 'i-lucide-x', color: 'error' })
    } finally {
      isExporting.value = false
    }
  }

  return { isExporting, downloadImage, copyImage }
}
