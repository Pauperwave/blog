<!-- app/components/charts/ScatterChart.vue -->
<script lang="ts" setup>
type ScatterPoint = [number, number]

type ScatterSeriesItem = {
  name: string
  data: ScatterPoint[]
}

const props = defineProps<{
  title?: string
  description?: string
  series?: ScatterSeriesItem[]
  xAxisName?: string
  yAxisName?: string
  symbolSize?: number
  height?: string
}>()

const theme = useChartTheme()
const { isMobile } = useDevice()

const hasMultipleSeries = computed(() => (props.series ?? []).length > 1)

const chartOption = computed(() => ({
  title: {
    text: props.title ?? '',
    top: 0,
    textStyle: theme.baseTextStyle.value,
  },
  tooltip: {
    trigger: 'item',
    backgroundColor: theme.colors.value.tooltipBackground,
    borderColor: theme.colors.value.tooltipBorder,
    textStyle: { color: theme.colors.value.text },
  },
  legend: hasMultipleSeries.value
    ? {
        type: 'scroll',
        top: props.title ? 36 : 0,
        data: (props.series ?? []).map(s => s.name),
        textStyle: theme.baseTextStyle.value,
      }
    : undefined,
  textStyle: theme.baseTextStyle.value,
  backgroundColor: 'transparent',
  grid: {
    left: '3%',
    right: '4%',
    bottom: '8%',
    top: hasMultipleSeries.value ? (props.title ? '30%' : '18%') : (props.title ? '20%' : '10%'),
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    name: props.xAxisName,
    nameTextStyle: { color: theme.colors.value.textSecondary },
    axisLabel: { color: theme.colors.value.textSecondary, fontSize: isMobile ? 11 : 12 },
    axisLine: { lineStyle: { color: theme.colors.value.axisLine } },
    splitLine: { lineStyle: { color: theme.colors.value.splitLine } },
  },
  yAxis: {
    type: 'value',
    name: props.yAxisName,
    nameTextStyle: { color: theme.colors.value.textSecondary },
    axisLabel: { color: theme.colors.value.textSecondary },
    axisLine: { lineStyle: { color: theme.colors.value.axisLine } },
    splitLine: { lineStyle: { color: theme.colors.value.splitLine } },
  },
  series: (props.series ?? []).map((s, i) => ({
    name: s.name,
    type: 'scatter',
    symbolSize: props.symbolSize ?? 12,
    itemStyle: {
      color: theme.colors.value.palette[i % theme.colors.value.palette.length],
      opacity: 0.85,
    },
    data: s.data,
  })),
}))
</script>

<template>
  <client-only>
    <VChart
      id="scatter-chart"
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
