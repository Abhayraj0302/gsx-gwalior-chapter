import { useState } from 'react'
import { events, type Event } from '../data/content'
import { eventState, tMinusDays, type EventState } from '../lib/dates'

export type FeaturedEvent = {
  event: Event
  state: EventState
  /** Whole IST calendar days until the event (0 today, negative when past). */
  tMinus: number
}

function pickFeatured(now: Date): FeaturedEvent | null {
  if (events.length === 0) return null
  const scored = events.map((event) => ({ event, state: eventState(event.start, event.end, now) }))
  const live = scored.find((e) => e.state === 'today') ?? scored.find((e) => e.state === 'upcoming')
  const chosen =
    live ??
    [...scored].sort((a, b) => new Date(b.event.start).getTime() - new Date(a.event.start).getTime())[0]
  return { ...chosen, tMinus: tMinusDays(chosen.event.start, now) }
}

/** Computed once at mount. Prefers today's event, then the next one, then the latest past one. */
export function useEventState(): FeaturedEvent | null {
  const [featured] = useState(() => pickFeatured(new Date()))
  return featured
}
