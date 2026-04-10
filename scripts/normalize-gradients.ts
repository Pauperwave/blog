#!/usr/bin/env bun
/**
 * Script to normalize all headerGradient values to lowercase
 */

import { readFile, writeFile } from 'fs/promises'
import { readdirSync } from 'fs'
import { join } from 'path'

async function normalizeFile(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8')
  
  // Replace headerGradient: Value with headerGradient: value (lowercase)
  const normalized = content.replace(/headerGradient:\s*(\S+)/g, (match, value) => {
    const lowerValue = value.toLowerCase()
    if (value !== lowerValue) {
      console.log(`  ${filePath}: ${value} -> ${lowerValue}`)
      return `headerGradient: ${lowerValue}`
    }
    return match
  })
  
  if (content !== normalized) {
    await writeFile(filePath, normalized)
  }
}

async function main() {
  const decklistsDir = 'content/blog/decklists'
  const filesToProcess = readdirSync(decklistsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => join(decklistsDir, f))

  console.log('🔤 Normalizing headerGradient values to lowercase\n')

  for (const file of filesToProcess) {
    const fullPath = join(process.cwd(), file)
    await normalizeFile(fullPath)
  }

  console.log('\n✨ Normalization complete!')
}

main().catch(console.error)
