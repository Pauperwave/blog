import { describe, it, expect } from 'vitest'
import { getFencedRanges, isInsideFence } from './fence'

describe('getFencedRanges / isInsideFence', () => {
  it('protects a triple-backtick fenced block', () => {
    const content = [
      'before [[Real Card]]',
      '```md',
      '[[Fenced Card]]',
      '```',
      'after [[Another Real Card]]'
    ].join('\n')

    const ranges = getFencedRanges(content)
    const fencedIndex = content.indexOf('[[Fenced Card]]')
    const realIndex = content.indexOf('[[Real Card]]')
    const anotherRealIndex = content.indexOf('[[Another Real Card]]')

    expect(isInsideFence(fencedIndex, ranges)).toBe(true)
    expect(isInsideFence(realIndex, ranges)).toBe(false)
    expect(isInsideFence(anotherRealIndex, ranges)).toBe(false)
  })

  it('protects a 4-backtick fence containing a nested 3-backtick fence as literal text', () => {
    const content = [
      '````text',
      '```js',
      '[[Nested Card]]',
      '```',
      '````',
      'live [[Real Card]]'
    ].join('\n')

    const ranges = getFencedRanges(content)
    const nestedIndex = content.indexOf('[[Nested Card]]')
    const realIndex = content.indexOf('[[Real Card]]')

    expect(isInsideFence(nestedIndex, ranges)).toBe(true)
    expect(isInsideFence(realIndex, ranges)).toBe(false)
  })

  it('protects tilde fences the same way as backtick fences', () => {
    const content = ['~~~', '[[Fenced Card]]', '~~~', '[[Real Card]]'].join('\n')

    const ranges = getFencedRanges(content)
    const fencedIndex = content.indexOf('[[Fenced Card]]')
    const realIndex = content.indexOf('[[Real Card]]')

    expect(isInsideFence(fencedIndex, ranges)).toBe(true)
    expect(isInsideFence(realIndex, ranges)).toBe(false)
  })

  it('treats content with no fences as entirely unprotected', () => {
    const content = 'just [[Real Card]] text, no fences anywhere'
    const ranges = getFencedRanges(content)

    expect(ranges).toEqual([])
    expect(isInsideFence(content.indexOf('[[Real Card]]'), ranges)).toBe(false)
  })

  it('protects an inline code span but not the text around it', () => {
    const content = 'syntax `[[Card Name]]` here, and [[Real Card]] there'
    const ranges = getFencedRanges(content)

    expect(isInsideFence(content.indexOf('[[Card Name]]'), ranges)).toBe(true)
    expect(isInsideFence(content.indexOf('[[Real Card]]'), ranges)).toBe(false)
  })

  it('closes an inline code span with a run of the same length', () => {
    const content = 'use ``a ` [[Span Card]]`` then [[Real Card]]'
    const ranges = getFencedRanges(content)

    expect(isInsideFence(content.indexOf('[[Span Card]]'), ranges)).toBe(true)
    expect(isInsideFence(content.indexOf('[[Real Card]]'), ranges)).toBe(false)
  })

  it('does not protect text after a backtick that is never closed', () => {
    const content = 'a stray ` backtick, then [[Real Card]]'
    const ranges = getFencedRanges(content)

    expect(isInsideFence(content.indexOf('[[Real Card]]'), ranges)).toBe(false)
  })

  it('does not let an inline code span cross a blank line', () => {
    const content = ['an open `tick', '', '[[Real Card]] and a closing` tick'].join('\n')
    const ranges = getFencedRanges(content)

    expect(isInsideFence(content.indexOf('[[Real Card]]'), ranges)).toBe(false)
  })

  it('protects everything after an unclosed fence rather than treating it as live', () => {
    const content = ['```md', '[[Fenced Card]]', 'no closing fence below'].join('\n')
    const ranges = getFencedRanges(content)

    expect(isInsideFence(content.indexOf('[[Fenced Card]]'), ranges)).toBe(true)
    expect(isInsideFence(content.length - 1, ranges)).toBe(true)
  })
})
