<!-- app/components/charts/ScatterChart.vue -->
<script lang="ts" setup>
type ScatterPoint = {
  x: number
  y: number
}

type ScatterSeriesItem = {
  name: string
  data: ScatterPoint[]
}

interface Props {
  title?: string
  description?: string
  series?: ScatterSeriesItem[]
  xAxisName?: string
  yAxisName?: string
  symbolSize?: number
  height?: string
}

const {
  title = undefined,
  description = undefined,
  series = [],
  xAxisName = undefined,
  yAxisName = undefined,
  symbolSize = 12,
  height = '500px'
} = defineProps<Props>()

const theme = useChartTheme()
const { isMobile } = useDevice()

const hasMultipleSeries = computed(() => series.length > 1)

const chartOption = computed(() => ({
  title: {
    text: title ?? '',
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
        top: title ? 36 : 0,
        data: series.map(s => s.name),
        textStyle: theme.baseTextStyle.value,
      }
    : undefined,
  textStyle: theme.baseTextStyle.value,
  backgroundColor: 'transparent',
  grid: {
    left: '3%',
    right: '4%',
    bottom: '8%',
    top: hasMultipleSeries.value ? (title ? '30%' : '18%') : (title ? '20%' : '10%'),
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    name: xAxisName,
    nameTextStyle: { color: theme.colors.value.textSecondary },
    axisLabel: { color: theme.colors.value.textSecondary, fontSize: isMobile ? 11 : 12 },
    axisLine: { lineStyle: { color: theme.colors.value.axisLine } },
    splitLine: { lineStyle: { color: theme.colors.value.splitLine } },
  },
  yAxis: {
    type: 'value',
    name: yAxisName,
    nameTextStyle: { color: theme.colors.value.textSecondary },
    axisLabel: { color: theme.colors.value.textSecondary },
    axisLine: { lineStyle: { color: theme.colors.value.axisLine } },
    splitLine: { lineStyle: { color: theme.colors.value.splitLine } },
  },
  series: series.map((s, i) => ({
    name: s.name,
    type: 'scatter',
    symbolSize: symbolSize,
    itemStyle: {
      color: theme.colors.value.palette[i % theme.colors.value.palette.length],
      opacity: 0.85,
    },
    data: s.data.map(p => [p.x, p.y]),
  })),
}))
</script>

<template>
  <client-only>
    <VChart
      id="scatter-chart"
      :title="title"
      :desc="description"
      :style="{ height: height }"
      :option="chartOption"
      autoresize
    />
    <template #fallback>
      <div :style="{ height: height }" />
    </template>
  </client-only>
</template>
