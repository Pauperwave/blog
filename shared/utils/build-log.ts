const env = typeof process !== 'undefined' ? process.env : {}

// VERCEL is set by Vercel in every build/runtime environment — hard guard so
// verbose logs can never leak into a Vercel build even if the flag is set by mistake.
export const isVerboseBuildLogsEnabled = env.PW_VERBOSE_BUILD_LOGS === '1' && !env.VERCEL

export function buildLog(...args: Parameters<typeof console.log>): void {
  if (isVerboseBuildLogsEnabled) {
    console.log(...args)
  }
}
