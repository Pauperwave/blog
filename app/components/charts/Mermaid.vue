<script setup lang="ts">
interface Props {
  code: string
  height?: string
}

const { code, height = undefined } = defineProps<Props>()
const el = useTemplateRef<HTMLElement>('el')
const { isDark } = useChartTheme()

let mermaidModule: typeof import('mermaid')['default'] | null = null

const render = async () => {
  if (!el.value) return
  if (!mermaidModule) {
    mermaidModule = (await import('mermaid')).default
  }
  mermaidModule.initialize({ startOnLoad: false, theme: isDark.value ? 'dark' : 'neutral' })
  const { svg } = await mermaidModule.render(`mermaid-${crypto.randomUUID()}`, code)
  el.value.innerHTML = svg
}

watch(el, (value) => { if (value) render() }, { immediate: true })
watch(isDark, () => { if (el.value) render() })
</script>

<template>
  <client-only>
    <div
      ref="el"
      class="my-6 flex justify-center overflow-x-auto"
      :style="{ minHeight: height ?? '100px' }"
    />
    <template #fallback>
      <div class="my-6" :style="{ height: height ?? '100px' }" />
    </template>
  </client-only>
</template>
