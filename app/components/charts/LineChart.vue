<!-- app/components/charts/LineChart.vue -->
<script lang="ts" setup>
type LineSeriesItem = {
  name: string
  data: number[]
}

const props = defineProps<{
  title?: string
  description?: string
  categories?: string[]
  series?: LineSeriesItem[]
  stacked?: boolean
  area?: boolean
  smooth?: boolean
  height?: string
  yAxisName?: string
}>()

const theme = useChartTheme()
const { isMobile } = useDevice()

const showsArea = computed(() => props.area ?? props.stacked ?? false)

const chartOption = computed(() => ({
  title: {
    text: props.title ?? '',
    textStyle: theme.baseTextStyle.value,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: theme.colors.value.tooltipBackground,
    borderColor: theme.colors.value.tooltipBorder,
    textStyle: { color: theme.colors.value.text },
  },
  legend: {
    type: 'scroll',
    top: props.title ? 28 : 0,
    data: (props.series ?? []).map(s => s.name),
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
    data: props.categories ?? [],
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
  series: (props.series ?? []).map((s, i) => {
    const color = theme.colors.value.palette[i % theme.colors.value.palette.length]
    return {
      name: s.name,
      type: 'line',
      stack: props.stacked ? 'total' : undefined,
      areaStyle: showsArea.value ? { opacity: 0.6, color } : undefined,
      smooth: props.smooth ?? false,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color },
      lineStyle: { color, width: 2 },
      data: s.data,
    }
  }),
}))
</script>

<template>
  <client-only>
    <VChart
      id="line-chart"
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
