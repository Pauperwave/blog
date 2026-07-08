export interface ChartThemeColors {
  text: string
  textSecondary: string
  axisLine: string
  splitLine: string
  tooltipBackground: string
  tooltipBorder: string
  /** 8-slot categorical palette, fixed order — never cycle/reassign per filter. */
  palette: string[]
}

const LIGHT_PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834']
const DARK_PALETTE = ['#3987e5', '#199e70', '#c98500', '#008300', '#9085e9', '#e66767', '#d55181', '#d95926']

/**
 * Shared ECharts theming for all chart components (BarChart, LineChart,
 * ConfidenceBandChart, PieChart). Categorical palette is the dataviz skill's
 * validated reference instance (worst adjacent CVD ΔE 24.2 light / 10.3 dark).
 */
export const useChartTheme = () => {
  const colorMode = useColorMode()
  const isDark = computed(() => colorMode.value === 'dark')

  const colors = computed<ChartThemeColors>(() => isDark.value
    ? {
        text: '#e5e7eb',
        textSecondary: '#9ca3af',
        axisLine: '#374151',
        splitLine: '#1f2937',
        tooltipBackground: '#1f2937',
        tooltipBorder: '#374151',
        palette: DARK_PALETTE,
      }
    : {
        text: '#111827',
        textSecondary: '#4b5563',
        axisLine: '#d1d5db',
        splitLine: '#e5e7eb',
        tooltipBackground: '#ffffff',
        tooltipBorder: '#e5e7eb',
        palette: LIGHT_PALETTE,
      })

  const baseTextStyle = computed(() => ({
    color: colors.value.text,
    fontFamily: '"Geist", sans-serif',
  }))

  return { isDark, colors, baseTextStyle }
}
