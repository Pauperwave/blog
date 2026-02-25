// ./modules/card-tooltip-transformer.ts
import { defineNuxtModule } from '@nuxt/kit'
import type { FileBeforeParseHook } from '@nuxt/content'
import { createRegExp, exactly, oneOrMore, charNotIn, maybe, whitespace, global } from 'magic-regexp'

export default defineNuxtModule({
  meta: {
    name: 'card-tooltip-transformer'
  },
  setup(_options, nuxt) {
    console.log('🚀 [Card Tooltip Transformer] MODULE LOADED!')

    const hookContentBeforeParse = nuxt.hook as unknown as (
      name: 'content:file:beforeParse',
      handler: (ctx: FileBeforeParseHook) => void | Promise<void>
    ) => void

    // Hook into content:file:beforeParse to transform markdown before parsing
    hookContentBeforeParse('content:file:beforeParse', (ctx: FileBeforeParseHook) => {
      const file = ctx.file || ctx

      const allowedFolders = [
        'articles',
        'decklists',
        'reports',
        // 'spoilers',
        'tutorials',
        // 'docs',
      ]

      if (file.extension === '.md' && allowedFolders.some(folder => file.path?.includes(folder))) {
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

function transformCardTooltips(content: string, filePath: string): string {
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

function logTransformations(transformations: CardTransformation[], filePath: string): void {
  if (transformations.length === 0) return

  console.log(`\n📝 [Card Tooltip Transformer] Processing file: ${filePath}`)
  console.log(`   └─ Found ${transformations.length} card tooltip(s)`)
  console.log(`\n   🃏 Transformed Card Tooltips:`)
  
  transformations.forEach((t, idx) => {
    console.log(`      ${idx + 1}. ${t.original}`)
    console.log(`         └─ Card: "${t.cardName}"${t.set ? ` (Set: ${t.set})` : ''}`)
    console.log(`         └─ Component: :MagicCardTooltip{name="${t.cardName}"${t.set ? ` set="${t.set}"` : ''}}`)
  })
  
  console.log(`   ✅ Card tooltips transformed successfully\n`)
}
