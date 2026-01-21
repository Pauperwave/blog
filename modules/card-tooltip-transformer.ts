import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'card-tooltip-transformer'
  },
  setup(_options, nuxt) {
    // Hook into content:file:beforeParse to transform markdown before parsing
    nuxt.hook('content:file:beforeParse', (ctx: any) => {
      const file = ctx.file || ctx
      
      if (file.extension === '.md') {
        // Pattern for [[cardName | set]] (with pipe separator)
        const patternWithSet = /\[\[([^\|\]]+)\s*\|\s*([^\]]+)\]\]/g
        
        // Pattern for [[cardName]] (no set specified)
        const patternSimple = /\[\[([^\]]+)\]\]/g
        
        // First, replace cards with set codes
        let content = file.body as string
        content = content.replace(patternWithSet, (_match: string, name: string, set: string) => {
          const cleanName = name.trim()
          const cleanSet = set.trim()
          return `:CardTooltip{name="${cleanName}" set="${cleanSet}"}`
        })
        
        // Then, replace simple card names
        content = content.replace(patternSimple, (_match: string, name: string) => {
          const cleanName = name.trim()
          return `:CardTooltip{name="${cleanName}"}`
        })
        
        file.body = content
      }
    })
  }
})





