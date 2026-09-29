/** Date helpers pinned to Asia/Kolkata so the event state flips on IST calendar days. */

export const IST = 'Asia/Kolkata'
export type EventState = 'upcoming' | 'today' | 'past'

/** "YYYY-MM-DD" for a Date as seen in IST. */
export function istDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000)
}

/** Whole calendar days from `now` to the event start, in IST (negative when past). */
export function tMinusDays(startIso: string, now: Date = new Date()): number {
  return dayNumber(istDateKey(new Date(startIso))) - dayNumber(istDateKey(now))
}

export function eventState(startIso: string, endIso: string, now: Date = new Date()): EventState {
  const todayKey = istDateKey(now)
  const startKey = istDateKey(new Date(startIso))
  if (todayKey === startKey) return 'today'
  if (now.getTime() > new Date(endIso).getTime()) return 'past'
  return 'upcoming'
}

/** "3 Oct 2026" */
export function formatIstDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: IST, day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

/** "01" */
export function formatIstDay(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: IST, day: '2-digit' }).format(new Date(iso))
}

/** "OCT" */
export function formatIstMonth(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: IST, month: 'short' }).format(new Date(iso)).toUpperCase()
}

/** "10:00" (24h) */
export function formatIstTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: IST, hour: '2-digit', minute: '2-digit', hour12: false }).format(
    new Date(iso),
  )
}

/** "10:00 – 13:00 IST" */
export function formatIstRange(startIso: string, endIso: string): string {
  return `${formatIstTime(startIso)} – ${formatIstTime(endIso)} IST`
}
