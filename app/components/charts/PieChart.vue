<!-- app/components/content/PieChart.vue -->
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

const chartOption = computed(() => ({
  title: { text: props.title ?? '' },
  tooltip: { trigger: 'item', formatter: '{b} {d}%' },
  backgroundColor: 'transparent',
  legend: {
    top: '25%',
    orient: 'vertical',
    left: 'left',
    data: (props.data ?? []).map(d => d.name),
  },
  series: [{
    name: props.title,
    type: 'pie',
    data: props.data ?? [],
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
  </client-only>
</template>
