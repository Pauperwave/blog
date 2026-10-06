/**
 * Pins the five basic lands to their Theros Beyond Death printings, so the whole blog shows the
 * same lands. Scryfall's oracle-cards bulk file has one arbitrary printing per card, hence the
 * override.
 */

import type Database from 'better-sqlite3'

const BASIC_LAND_PRINTINGS = [
  { name: 'Plains', number: '250' },
  { name: 'Island', number: '251' },
  { name: 'Swamp', number: '252' },
  { name: 'Mountain', number: '253' },
  { name: 'Forest', number: '254' },
]
const SET_CODE = 'thb'
// Scryfall asks for 50-100ms between requests
const REQUEST_DELAY_MS = 100

interface PrintingResponse {
  name: string
  set: string
  image_uris?: { normal?: string }
}

export async function applyBasicLandOverrides(
  db: Database.Database,
  headers: Record<string, string>
): Promise<void> {
  const update = db.prepare('UPDATE cards SET image_url = ?, back_image_url = NULL WHERE name = ?')

  for (const { name, number } of BASIC_LAND_PRINTINGS) {
    const response = await fetch(`https://api.scryfall.com/cards/${SET_CODE}/${number}`, { headers })
    if (!response.ok) {
      throw new Error(`Scryfall ${SET_CODE}/${number} (${name}) failed: ${response.status}`)
    }

    const printing = await response.json() as PrintingResponse
    const imageUrl = printing.image_uris?.normal
    if (printing.name !== name || printing.set !== SET_CODE || !imageUrl) {
      throw new Error(
        `Unexpected printing for ${SET_CODE}/${number}: expected ${name}, got ${printing.name} (${printing.set})`
      )
    }

    update.run(imageUrl, name)
    console.log(`   └─ ${name}: ${SET_CODE.toUpperCase()} #${number}`)
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS))
  }
}
