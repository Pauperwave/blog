const argv = typeof process !== 'undefined' && Array.isArray(process.argv) ? process.argv : []
const env = typeof process !== 'undefined' ? process.env : {}

const isBuildCommand = argv.includes('build') || argv.includes('generate')
const isVerboseBuildLogsEnabled = env.PW_VERBOSE_BUILD_LOGS === '1'

export const shouldMuteBuildLogs = isBuildCommand && !isVerboseBuildLogsEnabled

export function buildLog(...args: Parameters<typeof console.log>): void {
  if (shouldMuteBuildLogs) return
  console.log(...args)
}
