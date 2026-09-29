import type { MouseEvent } from 'react'
import { hero, type SectionId } from '../../../data/content'
import { useEventState } from '../../../hooks/useEventState'
import { formatIstDay, formatIstMonth, formatIstTime } from '../../../lib/dates'
import { scrollToSection } from '../../../lib/scrollTo'
import { cx } from '../../../lib/cx'
import { Button } from '../../ui/Button'
import './NextUpStub.css'

// lib/dates only adds the IST suffix in formatIstRange.
const TZ_SUFFIX = 'IST'
const EVENTS_ID: SectionId = 'events'

type NextUpStubProps = {
  className?: string
}

export function NextUpStub({ className }: NextUpStubProps) {
  const featured = useEventState()
  if (!featured || featured.state === 'past') return null

  const { event, state } = featured
  const prefix = state === 'today' ? hero.nextUp.todayPrefix : hero.nextUp.prefix
  const onEvents = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection(EVENTS_ID)
  }

  return (
    <p className={cx('nextup t-meta', className)}>
      <span className="live-dot" aria-hidden="true" />
      <a className="nextup__link" href={`#${EVENTS_ID}`} onClick={onEvents}>
        <span className="nextup__what">
          <span className="nextup__prefix">{prefix}</span>{' '}
          <span aria-hidden="true">—</span>{' '}
          <span className="nextup__title">{event.title}</span>
        </span>{' '}
        <span className="nextup__dot" aria-hidden="true">
          ·
        </span>{' '}
        <span className="nextup__when">
          <time className="nextup__date" dateTime={event.start}>
            {formatIstDay(event.start)} {formatIstMonth(event.start)}
          </time>
          <span className="nextup__time">
            {' '}
            <span aria-hidden="true">·</span>{' '}
            <time dateTime={event.start}>
              {formatIstTime(event.start)} {TZ_SUFFIX}
            </time>
          </span>
        </span>
      </a>
      <span className="nextup__sep" aria-hidden="true">
        ·
      </span>
      <Button variant="ghost" external href={event.registerUrl} className="nextup__register">
        {hero.nextUp.register}
      </Button>
    </p>
  )
}
