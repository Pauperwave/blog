<script setup lang="ts">
import type { ButtonProps } from '#ui/types'

interface Props {
  title?: string
  description?: string
  oldBlogUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Ciao a tutti! 💛',
  description: 'Abbiamo migrato il blog rapidamente. Parte dei contenuti è ancora sul vecchio sito e verrà trasferita a breve; altri resteranno disponibili solo lì. Tutti i nuovi contenuti saranno pubblicati qui. Aggiorna i tuoi preferiti: il nuovo indirizzo è blog.pauperwave.org',
  oldBlogUrl: 'https://newpauperwave.altervista.org'
})

const actions = computed<ButtonProps[]>(() => {
  if (!props.oldBlogUrl) return []
  return [{
    label: 'Vecchio blog',
    color: 'warning',
    variant: 'soft',
    size: 'xs',
    to: props.oldBlogUrl,
    target: '_blank',
    trailingIcon: 'i-lucide-external-link'
  }]
})
</script>

<template>
  <UAlert
    icon="i-lucide-info"
    color="warning"
    variant="subtle"
    :title="title"
    :description="description"
    :actions="actions"
  />
</template>
