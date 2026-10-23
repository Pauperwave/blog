import { parse } from 'yaml'

import { toArtCropUrl } from '#shared/utils'
import { getFencedRanges, isInsideFence } from './fence'

/** The grid image URL of a card string, or null when the card can't be found */
export type CardImageResolver = (cardString: string) => Promise<string | null>

interface Insertion {
  at: number
  text: string
}

// The content uses both the kebab-case and the PascalCase names of the components
const CARDS_COMPONENTS = ['magic-cards', 'MagicCards']
const ART_CROP_COMPONENTS = ['magic-card-art-crop', 'MagicCardArtCrop']
const ALL_COMPONENTS = [...CARDS_COMPONENTS, ...ART_CROP_COMPONENTS]

// ::magic-cards / ::magic-card-art-crop with their props as YAML front matter.
// Line endings are captured: the content files mix LF and CRLF.
const blockPattern = new RegExp(
  `^::(?<component>${ALL_COMPONENTS.join('|')})[ \\t]*\\r?\\n---\\r?\\n`
  + '(?<yaml>[\\s\\S]*?)(?<eol>\\r?\\n)---',
  'gm'
)

// :magic-card-art-crop{card="..."} inline (not the ::block form)
const inlinePattern = new RegExp(
  `(?<!:):(?:${ART_CROP_COMPONENTS.join('|')})\\{(?<attributes>[^}]*)\\}`,
  'g'
)

/**
 * Adds the resolved image URLs to the card components, so they render without asking
 * Scryfall at runtime: `images` (one per card, null if not found) on ::magic-cards,
 * `image` on ::magic-card-art-crop. The authors' props are left untouched.
 */
export async function transformCardComponents(
  content: string,
  filePath: string,
  resolveImage: CardImageResolver
): Promise<string> {
  const fencedRanges = getFencedRanges(content)
  const insertions: Insertion[] = []

  // console.warn, not buildLog: a card that's missing should show up in every build
  const warn = (message: string) => console.warn(`⚠️  [Card Components] ${filePath}: ${message}`)

  for (const match of content.matchAll(blockPattern)) {
    if (isInsideFence(match.index, fencedRanges)) continue

    const { component, yaml, eol } = match.groups as {
      component: string, yaml: string, eol: string
    }

    let props: Record<string, unknown> | null
    try {
      props = parse(yaml) as Record<string, unknown> | null
    } catch (error) {
      warn(`invalid YAML in ::${component}, left as is (${error})`)
      continue
    }

    // Right before the closing ---
    const at = match.index + match[0].length - '---'.length

    if (CARDS_COMPONENTS.includes(component)) {
      if (!Array.isArray(props?.cards)) {
        warn('::magic-cards without a `cards` list, left as is')
        continue
      }
      const cards = props.cards.map(String)
      const images = await Promise.all(cards.map(resolveImage))
      cards.forEach((card, index) => {
        if (!images[index]) warn(`card not found: ${card}`)
      })
      insertions.push({ at, text: `images: ${JSON.stringify(images)}${eol}` })
    } else {
      if (typeof props?.card !== 'string') {
        warn('::magic-card-art-crop without a `card`, left as is')
        continue
      }
      const grid = await resolveImage(props.card)
      if (!grid) warn(`card not found: ${props.card}`)
      const image = grid ? toArtCropUrl(grid) : null
      insertions.push({ at, text: `image: ${JSON.stringify(image)}${eol}` })
    }
  }

  for (const match of content.matchAll(inlinePattern)) {
    if (isInsideFence(match.index, fencedRanges)) continue

    const { attributes } = match.groups as { attributes: string }
    const card = attributes.match(/\bcard="([^"]*)"/)?.[1]
    if (!card) continue

    const grid = await resolveImage(card)
    if (!grid) {
      warn(`card not found: ${card}`)
      continue
    }

    // Right before the closing }
    const at = match.index + match[0].length - 1
    insertions.push({ at, text: ` image="${toArtCropUrl(grid)}"` })
  }

  // Back to front so earlier offsets stay valid as we splice
  insertions.sort((a, b) => b.at - a.at)
  for (const { at, text } of insertions) {
    content = content.slice(0, at) + text + content.slice(at)
  }

  return content
}
