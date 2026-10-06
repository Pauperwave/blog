<script setup lang="ts">
import { timeSince } from '#shared/utils'

const {
  public: { gitCommitSha, gitCommitDate }
} = useRuntimeConfig()

const shortSha = gitCommitSha ? gitCommitSha.slice(0, 7) : ''

// `now` is set on mount: the label depends on the current time, which differs between server
// render and client, so rendering it during SSR would cause a hydration mismatch
const now = ref<Date | null>(null)
let tick: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  now.value = new Date()
  tick = setInterval(() => {
    now.value = new Date()
  }, 60_000)
})
onUnmounted(() => clearInterval(tick))

const relativeFormat = new Intl.RelativeTimeFormat('it', { numeric: 'always' })
const RELATIVE_UNITS = {
  minutes: 'minute',
  hours: 'hour',
  days: 'day',
  months: 'month',
  years: 'year'
} as const

const updatedLabel = computed(() => {
  if (!gitCommitDate || !now.value) return ''
  const since = timeSince(gitCommitDate, now.value)
  if (!since) return ''
  if (since.unit === 'now') return 'Aggiornato ora'
  return `Aggiornato ${relativeFormat.format(-since.count, RELATIVE_UNITS[since.unit])}`
})

const updatedAtText = computed(() => {
  if (!gitCommitDate) return ''
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeStyle: 'short' })
    .format(new Date(gitCommitDate))
})
</script>

<template>
  <p v-if="shortSha || updatedLabel" class="text-xs text-dimmed text-center">
    <span v-if="shortSha" class="font-mono">{{ shortSha }}</span>
    <span v-if="shortSha && updatedLabel"> • </span>
    <UTooltip v-if="updatedLabel" :text="updatedAtText">
      <span class="cursor-default">{{ updatedLabel }}</span>
    </UTooltip>
  </p>
</template>
