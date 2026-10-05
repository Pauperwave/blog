export type TimeSinceUnit = 'now' | 'minutes' | 'hours' | 'days' | 'months' | 'years'

export interface TimeSince {
  unit: TimeSinceUnit
  count: number
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * "How long ago" as ONE relevant unit (minutes under an hour, hours under a day, days under a
 * month, months under a year, then years), whole units only. Months are 30 days, years 365.
 * Returns null for an invalid date.
 */
export function timeSince(isoDate: string, now: Date = new Date()): TimeSince | null {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null

  // A date in the future (clock skew) reads as "just now" rather than negative
  const elapsed = Math.max(now.getTime() - date.getTime(), 0)

  if (elapsed < MINUTE) return { unit: 'now', count: 0 }
  if (elapsed < HOUR) return { unit: 'minutes', count: Math.floor(elapsed / MINUTE) }
  if (elapsed < DAY) return { unit: 'hours', count: Math.floor(elapsed / HOUR) }

  const days = Math.floor(elapsed / DAY)
  if (days < 30) return { unit: 'days', count: days }
  if (days < 365) return { unit: 'months', count: Math.floor(days / 30) }
  return { unit: 'years', count: Math.floor(days / 365) }
}
