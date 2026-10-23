/**
 * Character ranges of code in the markdown: fenced blocks and inline code spans.
 * `[[Card Name]]` occurrences inside these ranges are illustrative "raw syntax"
 * examples (e.g. in docs) and must not be transformed.
 */
export function getFencedRanges(content: string): Array<[number, number]> {
  const blocks = getFenceBlockRanges(content)
  return [...blocks, ...getInlineCodeRanges(content, blocks)]
}

/**
 * Fenced code blocks (``` or ~~~, any length ≥ 3, including nested fences opened
 * by a longer run of the same character per CommonMark).
 */
function getFenceBlockRanges(content: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  const lines = content.split('\n')

  let fenceChar: string | null = null
  let fenceLen = 0
  let fenceStart = -1
  let offset = 0

  for (const line of lines) {
    const trimmed = line.trim()

    if (fenceChar === null) {
      const openMatch = trimmed.match(/^(`{3,}|~{3,})/)
      if (openMatch) {
        fenceChar = openMatch[1]![0]!
        fenceLen = openMatch[1]!.length
        fenceStart = offset
      }
    } else {
      const closeRegex = new RegExp(`^\\${fenceChar}{${fenceLen},}\\s*$`)
      if (closeRegex.test(trimmed)) {
        ranges.push([fenceStart, offset + line.length])
        fenceChar = null
        fenceLen = 0
        fenceStart = -1
      }
    }

    offset += line.length + 1 // +1 for the '\n' stripped by split()
  }

  // Unclosed fence (malformed markdown) — protect through end of file rather than
  // treat the rest of the document as live content.
  if (fenceChar !== null) ranges.push([fenceStart, content.length])

  return ranges
}

// A run of N backticks, then the next run of exactly N (CommonMark code span)
const inlineCodePattern = /(?<!`)(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g

/** Inline code spans outside the fenced blocks; like CommonMark's, they never cross a blank line */
function getInlineCodeRanges(
  content: string,
  blocks: Array<[number, number]>
): Array<[number, number]> {
  const ranges: Array<[number, number]> = []

  for (const match of content.matchAll(inlineCodePattern)) {
    if (isInsideFence(match.index, blocks)) continue
    if (/\n[ \t]*\r?\n/.test(match[2]!)) continue
    ranges.push([match.index, match.index + match[0].length])
  }

  return ranges
}

export function isInsideFence(index: number, ranges: Array<[number, number]>): boolean {
  return ranges.some(([start, end]) => index >= start && index < end)
}
