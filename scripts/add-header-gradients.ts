#!/usr/bin/env node
/**
 * Script to automatically detect and add headerGradient to decklists
 * Analyzes card mana costs to determine deck colors
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { closeDatabase } from '../server/utils/card-database.ts'
import { detectDeckColors, getDecklistFiles, parseDecklist } from './lib/decklist-gradient.ts'

async function processFile(filePath: string): Promise<void> {
  console.log(`\n📄 Processing: ${filePath}`)

  const content = await readFile(filePath, 'utf-8')
  const decklists = parseDecklist(content, filePath).filter(d => !d.existingGradient)

  if (decklists.length === 0) {
    console.log('  No decklists without headerGradient found')
    return
  }

  console.log(`  Found ${decklists.length} decklist(s) without headerGradient`)

  let updatedContent = content
  let offset = 0

  for (const decklist of decklists) {
    let gradient: string | null = null
    try {
      const detected = await detectDeckColors(decklist.cards)
      gradient = detected.gradient

      console.log(`  ${decklist.name} (${decklist.player})`)
      console.log(`    Colors: ${detected.colors.join(', ') || 'colorless'}`)
      console.log(`    Suggested gradient: ${gradient || 'UNKNOWN'}`)
    } catch (error) {
      console.error(`  Error analyzing ${decklist.name}:`, error)
    }

    if (gradient) {
      const lines = updatedContent.split('\n')
      const adjustedStartLine = decklist.startLine + offset

      // Find the opening --- after ::magic-decklist
      let openMarker = adjustedStartLine + 1
      while (openMarker < lines.length && lines[openMarker].trim() !== '---') {
        openMarker++
      }

      // Find the closing --- of the frontmatter
      let closeMarker = openMarker + 1
      while (closeMarker < lines.length && lines[closeMarker].trim() !== '---') {
        closeMarker++
      }

      // Insert headerGradient before the closing ---
      lines.splice(closeMarker, 0, `headerGradient: ${gradient}`)
      updatedContent = lines.join('\n')
      offset++ // Account for added line

      console.log(`    ✅ Added headerGradient: ${gradient}`)
    } else {
      console.log(`    ⚠️ Could not determine gradient`)
    }
  }

  // Write updated content
  await writeFile(filePath, updatedContent)
  console.log(`  💾 File updated`)
}

async function main() {
  const filesToProcess = getDecklistFiles()

  // fallow-ignore-next-line code-duplication
  console.log('🎨 Decklist Header Gradient Analyzer')
  console.log(`   Processing ${filesToProcess.length} files\n`)

  for (const file of filesToProcess) {
    const fullPath = join(process.cwd(), file)
    await processFile(fullPath)
  }

  closeDatabase()
  console.log('\n✨ Done!')
}

main().catch(console.error)
