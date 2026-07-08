<!-- app/components/charts/BarChart.vue -->
<script lang="ts" setup>
type BarChartDataItem = {
  name: string
  value: number
}

const props = defineProps<{
  title?: string
  description?: string
  data?: BarChartDataItem[]
  seriesName?: string
  height?: string
  horizontal?: boolean
  yAxisName?: string
}>()

const theme = useChartTheme()
const { isMobile } = useDevice()

const categories = computed(() => (props.data ?? []).map(d => d.name))
const values = computed(() => (props.data ?? []).map(d => d.value))

const categoryAxis = computed(() => ({
  type: 'category' as const,
  data: categories.value,
  axisLabel: {
    color: theme.colors.value.textSecondary,
    fontSize: isMobile ? 11 : 12,
    rotate: props.horizontal ? 0 : (isMobile ? 45 : 0),
    interval: 0,
  },
  axisLine: { lineStyle: { color: theme.colors.value.axisLine } },
  splitLine: { show: false },
}))

const valueAxis = computed(() => ({
  type: 'value' as const,
  name: props.yAxisName,
  nameTextStyle: { color: theme.colors.value.textSecondary },
  axisLabel: { color: theme.colors.value.textSecondary },
  axisLine: { lineStyle: { color: theme.colors.value.axisLine } },
  splitLine: { lineStyle: { color: theme.colors.value.splitLine } },
}))

const chartOption = computed(() => ({
  title: {
    text: props.title ?? '',
    textStyle: theme.baseTextStyle.value,
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: theme.colors.value.tooltipBackground,
    borderColor: theme.colors.value.tooltipBorder,
    textStyle: { color: theme.colors.value.text },
  },
  textStyle: theme.baseTextStyle.value,
  backgroundColor: 'transparent',
  grid: {
    left: '3%',
    right: '4%',
    bottom: props.horizontal ? '3%' : '10%',
    top: props.title ? '20%' : '10%',
    containLabel: true,
  },
  xAxis: props.horizontal ? valueAxis.value : categoryAxis.value,
  yAxis: props.horizontal ? categoryAxis.value : valueAxis.value,
  series: [{
    type: 'bar',
    name: props.seriesName ?? props.title,
    data: values.value.map((value, i) => ({
      value,
      itemStyle: {
        color: theme.colors.value.palette[i % theme.colors.value.palette.length],
        borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
      },
    })),
    label: { show: false },
  }],
}))
</script>

<template>
  <client-only>
    <VChart
      id="bar-chart"
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
