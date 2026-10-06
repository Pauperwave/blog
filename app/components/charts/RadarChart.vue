<!-- app/components/charts/RadarChart.vue -->
<script lang="ts" setup>
type RadarIndicator = {
  name: string
  max: number
}

type RadarSeriesItem = {
  name: string
  values: number[]
}

interface Props {
  title?: string
  description?: string
  indicators?: RadarIndicator[]
  series?: RadarSeriesItem[]
  height?: string
}

const {
  title = undefined,
  description = undefined,
  indicators = [],
  series = [],
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
        bottom: 0,
        data: series.map(s => s.name),
        textStyle: theme.baseTextStyle.value,
      }
    : undefined,
  textStyle: theme.baseTextStyle.value,
  backgroundColor: 'transparent',
  radar: {
    indicator: indicators.map(i => ({ name: i.name, max: i.max })),
    center: ['50%', title ? '55%' : '52%'],
    radius: isMobile ? '55%' : '65%',
    axisName: {
      color: theme.colors.value.textSecondary,
      fontSize: isMobile ? 10 : 12,
    },
    axisLine: { lineStyle: { color: theme.colors.value.axisLine } },
    splitLine: { lineStyle: { color: theme.colors.value.splitLine } },
    splitArea: { show: false },
  },
  series: [{
    type: 'radar',
    data: series.map((s, i) => {
      const color = theme.colors.value.palette[i % theme.colors.value.palette.length]
      return {
        name: s.name,
        value: s.values,
        areaStyle: { color, opacity: 0.15 },
        lineStyle: { color, width: 2 },
        itemStyle: { color },
      }
    }),
  }],
}))
</script>

<template>
  <client-only>
    <VChart
      id="radar-chart"
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
