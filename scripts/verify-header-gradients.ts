#!/usr/bin/env node
/**
 * Script to verify headerGradient assignments in decklists
 * Reports mismatches between detected colors and assigned gradient
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { closeDatabase } from '../server/utils/card-database.ts'
import { detectDeckColors, getDecklistFiles, parseDecklist } from './lib/decklist-gradient.ts'

async function processFile(filePath: string): Promise<void> {
  const content = await readFile(filePath, 'utf-8')
  const decklists = parseDecklist(content, filePath)

  if (decklists.length === 0) return

  for (const decklist of decklists) {
    let detected: string | null = null
    let colors: string[] = []
    try {
      const result = await detectDeckColors(decklist.cards)
      detected = result.gradient
      colors = result.colors
    } catch (error) {
      console.error(`  Error analyzing ${decklist.name}:`, error)
      continue
    }

    const hasMismatch = decklist.existingGradient && detected && decklist.existingGradient !== detected
    const hasNoGradient = !decklist.existingGradient

    if (hasMismatch) {
      console.log(`\n⚠️  MISMATCH in ${filePath}`)
      console.log(`   Deck: ${decklist.name} (${decklist.player})`)
      console.log(`   Detected colors: ${colors.join(', ') || 'colorless'}`)
      console.log(`   Suggested: ${detected}`)
      console.log(`   Current:   ${decklist.existingGradient}`)
    } else if (hasNoGradient) {
      console.log(`\n❌ MISSING in ${filePath}`)
      console.log(`   Deck: ${decklist.name} (${decklist.player})`)
      console.log(`   Detected colors: ${colors.join(', ') || 'colorless'}`)
      console.log(`   Suggested: ${detected || 'UNKNOWN'}`)
    }
  }
}

async function main() {
  const filesToProcess = getDecklistFiles()

  // fallow-ignore-next-line code-duplication
  console.log('🔍 Verifying Header Gradient Assignments')
  console.log(`   Processing ${filesToProcess.length} files\n`)

  for (const file of filesToProcess) {
    const fullPath = join(process.cwd(), file)
    await processFile(fullPath)
  }

  closeDatabase()
  console.log('\n✨ Verification complete!')
}

main().catch(console.error)
