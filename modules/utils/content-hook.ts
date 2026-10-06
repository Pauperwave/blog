import type { FileBeforeParseHook } from '@nuxt/content'
import type { Nuxt } from '@nuxt/schema'

type BeforeParseHandler = (ctx: FileBeforeParseHook) => void | Promise<void>

/**
 * Registers a handler that runs on a content file's raw markdown before Nuxt Content parses it.
 * Nuxt Content's hooks are not in the NuxtHooks types while modules are registered, so the typed
 * call lives here once instead of a cast in every module.
 */
export function onContentFileBeforeParse(nuxt: Nuxt, handler: BeforeParseHandler): void {
  // loose-ok: 'content:file:beforeParse' is missing from NuxtHooks at module registration time
  const hook = nuxt.hook as unknown as (
    name: 'content:file:beforeParse',
    handler: BeforeParseHandler
  ) => void
  hook('content:file:beforeParse', handler)
}
