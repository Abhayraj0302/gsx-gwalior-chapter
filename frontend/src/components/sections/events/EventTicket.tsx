import { useMemo, useState } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { Calendar, Clock, Download, ExternalLink, MapPin } from 'lucide-react'
import { eventsCopy, site } from '../../../data/content'
import { useEventState, type FeaturedEvent } from '../../../hooks/useEventState'
import { formatIstDate, formatIstDay, formatIstMonth, formatIstRange, type EventState } from '../../../lib/dates'
import { cx } from '../../../lib/cx'
import { icsHref } from '../../../lib/ics'
import { EASE_OUT, VIEWPORT } from '../../../lib/motion'
import { QrCode } from '../../ui/QrCode'
import { Button } from '../../ui/Button'
import { Chip } from '../../ui/Chip'
import { Magnetic } from '../../ui/Magnetic'
import { SerialDecode } from './SerialDecode'
import '../../ui/Card.css'
import './EventTicket.css'

// Uppercased by CSS.
const stubCopy = {
  tMinus: 'T-minus',
  day: 'day',
  days: 'days',
  held: 'Held',
  downloadsIcs: '(downloads an .ics file)',
} as const

// Entrance timings in seconds. The stub starts a beat after the main column and the stamp lands last.
const T = {
  rise: 0.5,
  item: 0.45,
  delayChildren: 0.12,
  partStagger: 0.12,
  mainStagger: 0.06,
  stubStagger: 0.09,
  stubLead: 0.05,
  tagStagger: 0.05,
  qrDelay: 0.2,
  serialDelayMs: 450,
  // Absolute: an explicit delay replaces the inherited stagger delay.
  stampDelay: 0.95,
  stamp: 0.5,
} as const

type TicketVariants = {
  ticket: Variants
  main: Variants
  stub: Variants
  tags: Variants
  item: Variants
  tag: Variants
  date: Variants
  stamp: Variants
  strip: Variants
}

function buildVariants(reduce: boolean): TicketVariants {
  if (reduce) {
    const still: Variants = { hidden: { opacity: 1 }, show: { opacity: 1, transition: { duration: 0 } } }
    return {
      ticket: still,
      main: still,
      stub: still,
      tags: still,
      item: still,
      tag: still,
      date: still,
      stamp: still,
      strip: still,
    }
  }
  const ease = EASE_OUT
  return {
    ticket: {
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: T.rise, ease, delayChildren: T.delayChildren, staggerChildren: T.partStagger },
      },
    },
    main: { hidden: {}, show: { transition: { staggerChildren: T.mainStagger } } },
    stub: { hidden: {}, show: { transition: { staggerChildren: T.stubStagger, delayChildren: T.stubLead } } },
    tags: { hidden: {}, show: { transition: { staggerChildren: T.tagStagger } } },
    item: { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: T.item, ease } } },
    tag: {
      hidden: { opacity: 0, scale: 0.9, y: 6 },
      show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease } },
    },
    date: {
      hidden: { opacity: 0, scale: 1.14 },
      show: { opacity: 1, scale: 1, transition: { duration: T.item, ease } },
    },
    // The resting angle is set in CSS on the wrapper, so this ends at rotate 0.
    stamp: {
      hidden: { opacity: 0, scale: 1.55, rotate: -9 },
      show: {
        opacity: 1,
        scale: [1.55, 0.95, 1],
        rotate: [-9, 1.5, 0],
        transition: {
          delay: T.stampDelay,
          duration: T.stamp,
          times: [0, 0.55, 1],
          ease,
          opacity: { delay: T.stampDelay, duration: 0.12 },
        },
      },
    },
    // Opens from the top-left corner so it works for both the vertical and horizontal strip.
    strip: {
      hidden: { clipPath: 'inset(0 100% 100% 0)' },
      show: { clipPath: 'inset(0 0% 0% 0)', transition: { duration: 0.5, ease } },
    },
  }
}

type EventTicketProps = {
  /** Omit to let the ticket look up the featured event itself. */
  featured?: FeaturedEvent | null
  className?: string
}

function tMinusLine(state: EventState, tMinus: number, startIso: string): string {
  if (state === 'today') return eventsCopy.chipToday
  if (state === 'past') return `${stubCopy.held} ${formatIstDay(startIso)} ${formatIstMonth(startIso)}`
  return `${stubCopy.tMinus} ${tMinus} ${tMinus === 1 ? stubCopy.day : stubCopy.days}`
}

// whileInView is on the unclipped article; clip-path only animates on children,
// since a fully clipped element never registers as in view.
export function EventTicket({ featured, className }: EventTicketProps) {
  const own = useEventState()
  const reduce = useReducedMotion() ?? false
  const v = useMemo(() => buildVariants(reduce), [reduce])
  const [printed, setPrinted] = useState(false)
  const resolved = featured === undefined ? own : featured
  if (!resolved) return null

  const { event, state, tMinus } = resolved
  const titleId = `${event.slug}-title`
  const isPast = state === 'past'
  const chipTone = isPast ? 'neutral' : 'live'
  const chipText = isPast ? eventsCopy.chipPast : state === 'today' ? eventsCopy.chipToday : event.badge

  const meta = [
    { key: 'date', Icon: Calendar, node: <time dateTime={event.start}>{formatIstDate(event.start)}</time> },
    { key: 'time', Icon: Clock, node: <span>{formatIstRange(event.start, event.end)}</span> },
    { key: 'venue', Icon: MapPin, node: <span>{event.venueShort}</span> },
  ] as const

  // Rendered in both halves; CSS offsets keep the two pieces moving as one band.
  const sheen = reduce ? null : <span className="event-ticket__sheen" aria-hidden="true" />

  return (
    <motion.article
      className={cx('ticket', 'event-ticket', printed && 'event-ticket--printed', className)}
      aria-labelledby={titleId}
      variants={v.ticket}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={VIEWPORT}
      onViewportEnter={() => setPrinted(true)}
    >
      <motion.div className="ticket__main event-ticket__main" variants={v.main}>
        <motion.div className="event-ticket__chip" variants={v.item}>
          <Chip tone={chipTone} dot={chipTone === 'live'}>
            {chipText}
          </Chip>
        </motion.div>

        <motion.h3 id={titleId} className="t-h2 event-ticket__title" variants={v.item}>
          {event.title}
        </motion.h3>

        <motion.p className="t-body event-ticket__desc" variants={v.item}>
          {event.description}
        </motion.p>

        <motion.p className="t-meta event-ticket__meta" variants={v.item}>
          {meta.map(({ key, Icon, node }, i) => (
            <span key={key} className="event-ticket__meta-group">
              {i > 0 && (
                <span className="event-ticket__meta-sep" aria-hidden="true">
                  ·
                </span>
              )}
              <span className="event-ticket__meta-item">
                <span className="event-ticket__meta-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                {node}
              </span>
            </span>
          ))}
        </motion.p>

        {event.tags.length > 0 && (
          <motion.ul className="event-ticket__tags" variants={v.tags}>
            {event.tags.map((tag) => (
              <motion.li key={tag} className="event-ticket__tag" variants={v.tag}>
                <Chip>{tag}</Chip>
              </motion.li>
            ))}
          </motion.ul>
        )}

        <motion.div className="event-ticket__actions" variants={v.item}>
          {isPast ? (
            <Button variant="secondary" external href={event.recapUrl}>
              {eventsCopy.recap}
            </Button>
          ) : (
            <>
              <Magnetic strength={0.2} className="event-ticket__magnet">
                <Button
                  external
                  href={event.registerUrl}
                  className="event-ticket__register"
                  iconEnd={<ExternalLink size={16} strokeWidth={1.75} aria-hidden="true" />}
                >
                  {eventsCopy.register}
                </Button>
              </Magnetic>
              <Button
                variant="ghost"
                href={icsHref(event, site.url)}
                download={`${event.slug}.ics`}
                className="event-ticket__ics"
                iconEnd={
                  <>
                    <Download size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span className="sr-only"> {stubCopy.downloadsIcs}</span>
                  </>
                }
              >
                {eventsCopy.addToCalendar}
              </Button>
            </>
          )}
        </motion.div>

        {sheen}
      </motion.div>

      <motion.aside className="ticket__stub event-ticket__stub" variants={v.stub}>
        <motion.span className="t-label event-ticket__admit" variants={v.strip}>
          {event.venue}
        </motion.span>

        <div className="event-ticket__stub-body">
          <motion.time dateTime={event.start} className="event-ticket__date" variants={v.date}>
            <span className="t-stat event-ticket__day">{formatIstDay(event.start)}</span>
            <span className="t-label event-ticket__month">{formatIstMonth(event.start)}</span>
          </motion.time>

          <motion.p className="t-meta event-ticket__tminus" variants={v.item}>
            {tMinusLine(state, tMinus, event.start)}
          </motion.p>

          <div className="event-ticket__qr-wrap">
            <QrCode
              value={isPast ? event.recapUrl : event.registerUrl}
              label={isPast ? `QR code: ${event.title} recap` : `QR code: register for ${event.title}`}
              caption={isPast ? eventsCopy.qrRecap : eventsCopy.qrRegister}
              delay={T.qrDelay}
              className="event-ticket__qr"
            />
          </div>

          <motion.p className="t-meta event-ticket__serial" variants={v.item}>
            <SerialDecode text={event.serial} active={printed} delay={T.serialDelayMs} />
          </motion.p>
        </div>

        <p className="event-ticket__stamp">
          <motion.span className="t-label event-ticket__stamp-ink" variants={v.stamp}>
            {eventsCopy.admit}
          </motion.span>
        </p>

        {sheen}
      </motion.aside>
    </motion.article>
  )
}
