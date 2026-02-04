// test-db.ts
import { Database } from 'bun:sqlite'

const db = new Database('./server/database/cards.db', { readonly: true })

const cards = [
  'Delver of Secrets', // Senza " // Insectile Aberration"
  'Sagu Wildling',     // Senza " // Roost Seek"
  'The Modern Age'     // Senza " // Vector Glider"
]

for (const name of cards) {
  const row = db.prepare('SELECT name, image_url FROM cards WHERE name = ?').get(name)
  console.log('\n', name)
  console.log('  Found:', !!row)
  if (row) {
    console.log('  URL:', row.image_url)
  }
}

db.close()
