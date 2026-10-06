import { DECK_PREVIEW_QUERY, deckPreviewPath } from '~/utils/deck-preview'

/**
 * Keeps the URL in step with a decklist's visual view and opens the view when the page loads from a preview link.
 * Gives back the link to the view (with ?preview) and the plain link to the deck (just the anchor).
 */
export function useDeckPreviewLink(anchorId: Ref<string>, showOverlay: Ref<boolean>, openOverlay: () => void) {
  const route = useRoute()
  const router = useRouter()
  const { isMobile } = useDevice()
  const { origin } = useRequestURL()

  const previewPath = computed(() => deckPreviewPath(route.path, anchorId.value))
  const previewUrl = computed(() => `${origin}${previewPath.value}`)
  // The plain anchor works on mobile too, where there is no visual view
  const deckUrl = computed(() => `${origin}${route.path}#${anchorId.value}`)

  // The URL follows the overlay, so it can be shared
  watch(showOverlay, (open) => {
    router.replace(open ? previewPath.value : { path: route.path, hash: `#${anchorId.value}` })
  })

  onMounted(() => {
    const isPreviewLink = route.query[DECK_PREVIEW_QUERY] !== undefined && route.hash === `#${anchorId.value}`
    if (!isMobile && isPreviewLink) openOverlay()
  })

  return { previewUrl, deckUrl }
}
