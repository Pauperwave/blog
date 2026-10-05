import { describe, it, expect } from 'vitest'
import { timeSince } from './time-since'

const now = new Date('2026-10-05T12:00:00Z')

describe('timeSince', () => {
  it('reads under a minute as now', () => {
    expect(timeSince('2026-10-05T11:59:30Z', now)).toEqual({ unit: 'now', count: 0 })
  })

  it('uses minutes under an hour', () => {
    expect(timeSince('2026-10-05T11:15:00Z', now)).toEqual({ unit: 'minutes', count: 45 })
  })

  it('uses hours under a day', () => {
    expect(timeSince('2026-10-05T09:00:00Z', now)).toEqual({ unit: 'hours', count: 3 })
  })

  it('uses days under a month', () => {
    expect(timeSince('2026-10-02T12:00:00Z', now)).toEqual({ unit: 'days', count: 3 })
  })

  it('uses months under a year', () => {
    expect(timeSince('2026-07-05T12:00:00Z', now)).toEqual({ unit: 'months', count: 3 })
  })

  it('uses years from a year on', () => {
    expect(timeSince('2024-10-05T12:00:00Z', now)).toEqual({ unit: 'years', count: 2 })
  })

  it('floors to whole units', () => {
    expect(timeSince('2026-10-05T09:59:00Z', now)).toEqual({ unit: 'hours', count: 2 })
  })

  it('reads a future date as now', () => {
    expect(timeSince('2026-10-06T12:00:00Z', now)).toEqual({ unit: 'now', count: 0 })
  })

  it('returns null for an invalid date', () => {
    expect(timeSince('not a date', now)).toBeNull()
  })
})
