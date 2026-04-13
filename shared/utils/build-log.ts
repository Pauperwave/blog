const env = typeof process !== 'undefined' ? process.env : {}

export const isVerboseBuildLogsEnabled = env.PW_VERBOSE_BUILD_LOGS === '0'

export function buildLog(...args: Parameters<typeof console.log>): void {
  if (isVerboseBuildLogsEnabled) {
    console.log(...args)
  }
}
