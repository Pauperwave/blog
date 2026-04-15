export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

/**
 * Safely parse JSON string with fallback
 * @param json - JSON string to parse
 * @param fallback - Value to return if parsing fails
 * @param label - Label for error logging
 * @returns Parsed value or fallback
 */
export function safeParse<T>(json: string | undefined, fallback: T, label: string): T {
  if (!json) return fallback
  try { return JSON.parse(json) as T }
  catch (e) { console.error(`Failed to parse ${label}:`, e); return fallback }
}

/**
 * Format decklist for MTGO (Magic: The Gathering Online)
 * @param mainDeckSections - Array of main deck section names
 * @param cardsBySection - Object mapping section names to card arrays
 * @param hasSideboard - Whether the decklist has a sideboard
 * @returns Formatted decklist string for MTGO
 */
export function formatDecklistForMTGO(
  mainDeckSections: string[],
  cardsBySection: Record<string, Array<{ quantity: number; name: string }>>,
  hasSideboard: boolean
): string {
  const mainLines = mainDeckSections.flatMap(section =>
    (cardsBySection[section] ?? []).map(c => `${c.quantity} ${c.name}`)
  )

  const sideLines = hasSideboard
    ? ['', 'Sideboard', ...(cardsBySection['Sideboard'] ?? []).map(c => `${c.quantity} ${c.name}`)]
    : []

  return [...mainLines, ...sideLines].join('\n')
}
