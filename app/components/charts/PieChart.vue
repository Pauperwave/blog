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

const colorMode = useColorMode()

const chartOption = computed(() => ({
  title: {
    text: props.title ?? '',
    textStyle: {
      color: colorMode.value === 'dark' ? '#e5e7eb' : '#111827',
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b} {d}%'
  },
  textStyle: {
    color: colorMode.value === 'dark' ? '#e5e7eb' : '#111827',
  },
  backgroundColor: 'transparent',
  legend: {
    top: '25%',
    orient: 'vertical',
    left: 'left',
    data: (props.data ?? []).map(d => d.name),
    textStyle: {
      color: colorMode.value === 'dark' ? '#e5e7eb' : '#111827',
    },
  },
  series: [{
    type: 'pie',
    data: props.data ?? [],
    name: props.title,
    center: ['50%', '45%'],
    label: {
      fontSize: 12,
      fontFamily: 'Inter, sans-serif',
      color: colorMode.value === 'dark' ? '#e5e7eb' : '#111827',
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
