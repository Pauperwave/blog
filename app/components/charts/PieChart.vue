<!-- app/components/charts/PieChart.vue -->
<script lang="ts" setup>
type ChartDataItem = {
  value: number
  name: string
}

const props = defineProps<{
  title?: string
  description?: string
  data?: ChartDataItem[]
  height?: string
}>()

const theme = useChartTheme()
// Same isMobile source every other chart component uses (BarChart,
// ConfidenceBandChart, LineChart, RadarChart, ScatterChart). On mobile a
// left-side vertical legend has no room and sits on top of the pie —
// stack it under the pie instead.
const { isMobile } = useDevice()

const chartOption = computed(() => ({
  title: {
    text: props.title ?? '',
    textStyle: theme.baseTextStyle.value,
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b} {d}%',
    backgroundColor: theme.colors.value.tooltipBackground,
    borderColor: theme.colors.value.tooltipBorder,
    textStyle: { color: theme.colors.value.text },
  },
  textStyle: theme.baseTextStyle.value,
  backgroundColor: 'transparent',
  color: theme.colors.value.palette,
  legend: isMobile
    ? {
        orient: 'horizontal',
        top: 'bottom',
        left: 'center',
        data: (props.data ?? []).map(d => d.name),
        textStyle: theme.baseTextStyle.value,
      }
    : {
        top: '25%',
        orient: 'vertical',
        left: 'left',
        data: (props.data ?? []).map(d => d.name),
        textStyle: theme.baseTextStyle.value,
      },
  series: [{
    type: 'pie',
    data: props.data ?? [],
    name: props.title,
    center: isMobile ? ['50%', '42%'] : ['50%', '45%'],
    radius: isMobile ? ['35%', '58%'] : ['45%', '70%'],
    padAngle: 2,
    itemStyle: {
      borderRadius: 8,
    },
    emphasis: {
      scale: true,
      scaleSize: 6,
      itemStyle: {
        shadowBlur: 16,
        shadowColor: 'rgba(0, 0, 0, 0.25)',
      },
    },
    label: {
      fontSize: 12,
      fontFamily: '"Geist", sans-serif',
      color: theme.colors.value.textSecondary,
      formatter: '{d}%',
    },
    labelLine: {
      length: 8,
      length2: 8,
    },
  }],
}))
</script>

<template>
  <client-only>
    <VChart
      id="pie-chart"
      :title="title"
      :desc="description"
      :style="{ height: height ?? '500px' }"
      :option="chartOption"
      autoresize
    />
    <template #fallback>
      <div
        :style="{ height: height ?? '500px' }"
      />
    </template>
  </client-only>
</template>
