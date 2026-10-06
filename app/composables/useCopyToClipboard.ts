interface CopyMessages {
  successDescription?: string
  errorDescription?: string
}

/** Copies text to the clipboard and tells the user how it went with a toast. */
export function useCopyToClipboard() {
  const toast = useToast()

  async function copyToClipboard(
    text: string,
    {
      successDescription = 'Copiato negli appunti',
      errorDescription = 'Impossibile copiare negli appunti'
    }: CopyMessages = {}
  ) {
    try {
      await navigator.clipboard.writeText(text)
      toast.add({
        title: 'Copiato!',
        description: successDescription,
        icon: 'i-lucide-check',
        color: 'success'
      })
    } catch {
      toast.add({
        title: 'Copia non riuscita',
        description: errorDescription,
        icon: 'i-lucide-x',
        color: 'error'
      })
    }
  }

  const copyLink = (url: string) => copyToClipboard(url, {
    successDescription: 'Link copiato negli appunti',
    errorDescription: 'Impossibile copiare il link negli appunti'
  })

  return { copyToClipboard, copyLink }
}
