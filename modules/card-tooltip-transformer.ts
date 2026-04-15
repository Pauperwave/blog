// ./modules/card-tooltip-transformer.ts
import { defineNuxtModule } from '@nuxt/kit'
import type { FileBeforeParseHook } from '@nuxt/content'
import { createRegExp, exactly, oneOrMore, charNotIn, maybe, whitespace, global } from 'magic-regexp'

import { buildLog } from '../shared/utils'

export default defineNuxtModule({
  meta: {
    name: 'card-tooltip-transformer'
  },
  setup(_options, nuxt) {
    buildLog('🚀 [Card Tooltip Transformer] MODULE LOADED!')

    const hookContentBeforeParse = nuxt.hook as unknown as (
      name: 'content:file:beforeParse',
      handler: (ctx: FileBeforeParseHook) => void | Promise<void>
    ) => void

    // Hook into content:file:beforeParse to transform markdown before parsing
    hookContentBeforeParse('content:file:beforeParse', (ctx: FileBeforeParseHook) => {
      const file = ctx.file || ctx

      const forbiddenFolders = [
        'docs',
      ]

      if (file.extension === '.md' && !forbiddenFolders.some(folder => file.path?.includes(folder))) {
        if (!file.body.includes('[[')) return  // early exit, no [[...]] present
        file.body = transformCardTooltips(file.body, file.path)
      }
    })
  }
})

interface CardTransformation {
  original: string
  cardName: string
  set?: string
}

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

function transformCardTooltips(content: string, filePath: string): string {
  const transformations: CardTransformation[] = []

  // First, replace cards with set codes
  content = content.replace(patternWithSet, (match: string, name: string, set: string) => {
    const cleanName = name.trim()
    const cleanSet = set.trim()

    transformations.push({
      original: match,
      cardName: cleanName,
      set: cleanSet
    })

    return `:MagicCardTooltip{name="${cleanName}" set="${cleanSet}"}`
  })

  // Then, replace simple card names
  content = content.replace(patternSimple, (match: string, name: string) => {
    const cleanName = name.trim()

    transformations.push({
      original: match,
      cardName: cleanName
    })

    return `:MagicCardTooltip{name="${cleanName}"}`
  })

  logTransformations(transformations, filePath)

  return content
}

function logTransformations(
  transformations: CardTransformation[],
  filePath: string
): void {
  if (transformations.length === 0) return

  buildLog(`\n📝 [Card Tooltip Transformer] Processing file: ${filePath}`)
  buildLog(`   └─ Found ${transformations.length} card tooltip(s)`)
  buildLog(`\n   🃏 Transformed Card Tooltips:`)

  transformations.forEach((t, idx) => {
    buildLog(`      ${idx + 1}. ${t.original}`)
    buildLog(`         └─ Card: "${t.cardName}"${t.set ? ` (Set: ${t.set})` : ''}`)
    buildLog(`         └─ Component: :MagicCardTooltip{name="${t.cardName}"${t.set ? ` set="${t.set}"` : ''}}`)
  })

  buildLog(`   ✅ Card tooltips transformed successfully\n`)
}
