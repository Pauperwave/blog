<!-- app/components/charts/ConfidenceBandChart.vue -->
<script lang="ts" setup>
type ConfidenceBandPoint = {
  x: string | number
  value: number
  lower: number
  upper: number
}

const props = defineProps<{
  title?: string
  description?: string
  data?: ConfidenceBandPoint[]
  seriesName?: string
  bandLabel?: string
  smooth?: boolean
  height?: string
  yAxisName?: string
}>()

const theme = useChartTheme()
const { isMobile } = useDevice()

const valueLabel = computed(() => props.seriesName ?? props.title ?? 'Value')
const band = computed(() => props.bandLabel ?? 'Confidence Band')

const categories = computed(() => (props.data ?? []).map(d => String(d.x)))
const lowerValues = computed(() => (props.data ?? []).map(d => d.lower))
const bandValues = computed(() => (props.data ?? []).map(d => d.upper - d.lower))
const values = computed(() => (props.data ?? []).map(d => d.value))

const chartOption = computed(() => {
  const color = theme.colors.value.palette[0]

  return {
    title: {
      text: props.title ?? '',
      textStyle: theme.baseTextStyle.value,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: theme.colors.value.tooltipBackground,
      borderColor: theme.colors.value.tooltipBorder,
      textStyle: { color: theme.colors.value.text },
      formatter: (params: Array<{ dataIndex: number }>) => {
        const point = props.data?.[params[0]?.dataIndex ?? 0]
        if (!point) return ''
        return `${point.x}<br/>${valueLabel.value}: ${point.value}<br/>Range: ${point.lower} – ${point.upper}`
      },
    },
    legend: {
      type: 'scroll',
      top: props.title ? 28 : 0,
      data: [valueLabel.value, band.value],
      textStyle: theme.baseTextStyle.value,
    },
    textStyle: theme.baseTextStyle.value,
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: props.title ? '25%' : '18%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: categories.value,
      axisLabel: {
        color: theme.colors.value.textSecondary,
        fontSize: isMobile ? 11 : 12,
        interval: 'auto',
      },
      axisLine: { lineStyle: { color: theme.colors.value.axisLine } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: props.yAxisName,
      nameTextStyle: { color: theme.colors.value.textSecondary },
      axisLabel: { color: theme.colors.value.textSecondary },
      axisLine: { lineStyle: { color: theme.colors.value.axisLine } },
      splitLine: { lineStyle: { color: theme.colors.value.splitLine } },
    },
    series: [
      {
        // Invisible lower-bound anchor: the stack base the band is drawn on top of.
        name: '__confidence-lower',
        type: 'line',
        stack: 'confidence-band',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        tooltip: { show: false },
        data: lowerValues.value,
      },
      {
        // Visible band fill: stacked on top of the lower anchor, so it renders as [lower, upper].
        name: band.value,
        type: 'line',
        stack: 'confidence-band',
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { color, opacity: theme.isDark.value ? 0.28 : 0.2 },
        tooltip: { show: false },
        data: bandValues.value,
      },
      {
        // The actual value line, drawn on top, not part of the stack.
        name: valueLabel.value,
        type: 'line',
        symbol: 'circle',
        symbolSize: 6,
        smooth: props.smooth ?? false,
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        z: 10,
        data: values.value,
      },
    ],
  }
})
</script>

<template>
  <client-only>
    <VChart
      id="confidence-band-chart"
      :title="title"
      :desc="description"
      :style="{ height: height ?? '500px' }"
      :option="chartOption"
      autoresize
    />
    <template #fallback>
      <div :style="{ height: height ?? '500px' }" />
    </template>
  </client-only>
</template>
