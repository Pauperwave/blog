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
  legend: {
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
    center: ['50%', '45%'],
    label: {
      fontSize: 12,
      fontFamily: '"Geist", sans-serif',
      color: theme.colors.value.text,
      formatter: '{b} {d}%',
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
