// ./modules/card-tooltip-transformer
import { defineNuxtModule } from '@nuxt/kit'
import { createRegExp, exactly, oneOrMore, charNotIn, maybe, whitespace, global } from 'magic-regexp'

export default defineNuxtModule({
  meta: {
    name: 'card-tooltip-transformer'
  },
  setup(_options, nuxt) {
    console.log('🚀 [Card Tooltip Transformer] MODULE LOADED!')

    // Hook into content:file:beforeParse to transform markdown before parsing
    /* eslint-disable @typescript-eslint/no-explicit-any */
    nuxt.hook('content:file:beforeParse', (ctx: any) => {
      const file = ctx.file || ctx

      const allowedFolders = [
        'articles',
        'decklists',
        'reports',
        'spoilers',
        'tutorials',
      ]

      if (file.extension === '.md' && allowedFolders.some(folder => file.path?.includes(folder))) {
        // Pattern for [[cardName | set]] (with pipe separator)
        const patternWithSet = createRegExp(
          exactly('[['),
          oneOrMore(charNotIn('|]')).groupedAs('name'),
          maybe(whitespace),
          exactly('|'),
          maybe(whitespace),
          oneOrMore(charNotIn(']')).groupedAs('set'),
          exactly(']]'),
          [global]
        )
        
        // Pattern for [[cardName]] (no set specified)
        const patternSimple = createRegExp(
          exactly('[['),
          oneOrMore(charNotIn(']')).groupedAs('name'),
          exactly(']]'),
          [global]
        )
        
        // First, replace cards with set codes
        let content = file.body as string
        content = content.replace(patternWithSet, (_match: string, name: string, set: string) => {
          const cleanName = name.trim()
          const cleanSet = set.trim()
          return `:MagicCardTooltip{name="${cleanName}" set="${cleanSet}"}`
        })
        
        // Then, replace simple card names
        content = content.replace(patternSimple, (_match: string, name: string) => {
          const cleanName = name.trim()
          return `:MagicCardTooltip{name="${cleanName}"}`
        })
        
        file.body = content
      }
    })
  }
})