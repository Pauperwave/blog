// ./modules/card-component-transformer.ts
import { defineNuxtModule } from '@nuxt/kit'

import { buildLog } from '#shared/utils'
import { openCardDatabase, resolveCardImage } from './utils/card-images'
import { transformCardComponents } from './utils/card-components'
import { onContentFileBeforeParse } from './utils/content-hook'

export default defineNuxtModule({
  meta: {
    name: 'card-component-transformer'
  },
  async setup(_options, nuxt) {
    buildLog('🚀 [Card Component Transformer] MODULE LOADED!')

    const db = await openCardDatabase()

    onContentFileBeforeParse(nuxt, async (ctx) => {
      const file = ctx.file || ctx

      if (file.extension !== '.md') return
      // Early exit; covers the kebab-case and PascalCase names of both components
      if (!file.body.includes('magic-card') && !file.body.includes('MagicCard')) return

      file.body = await transformCardComponents(
        file.body,
        file.path,
        cardString => resolveCardImage(db, cardString)
      )
    })

    nuxt.hook('build:done', () => {
      db?.close()
    })
  }
})
