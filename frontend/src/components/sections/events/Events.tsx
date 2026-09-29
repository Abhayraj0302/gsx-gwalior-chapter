import { motion, useReducedMotion, type Variants } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { eventsCopy, sections, site } from '../../../data/content'
import { useEventState } from '../../../hooks/useEventState'
import { EASE_OUT, makeVariants, staggerParent, tween, VIEWPORT } from '../../../lib/motion'
import { Section } from '../../ui/Section'
import { SectionLabel } from '../../ui/SectionLabel'
import { Tilt } from '../../ui/Tilt'
import { WordReveal } from '../../ui/WordReveal'
import { EventTicket } from './EventTicket'
import './Events.css'

const meta = sections.find((s) => s.id === 'events')

/** "@handle" from an Instagram profile URL, or null if there is no path. */
function instagramHandle(url: string): string | null {
  try {
    const first = new URL(url).pathname.split('/').find(Boolean)
    return first ? `@${first}` : null
  } catch {
    return null
  }
}

const handle = instagramHandle(site.links.instagram)

function markVariants(reduce: boolean): { crop: Variants; swatch: Variants } {
  if (reduce) {
    const still: Variants = { hidden: { opacity: 1 }, show: { opacity: 1 } }
    return { crop: still, swatch: still }
  }
  return {
    crop: {
      hidden: { opacity: 0, scale: 0.4 },
      show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } },
    },
    swatch: {
      hidden: { opacity: 0, y: 4 },
      show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
    },
  }
}

const CORNERS = ['tl', 'tr', 'bl', 'br'] as const
const SWATCHES = ['deep', 'violet', 'lavender', 'live', 'signal'] as const

export function Events() {
  const featured = useEventState()
  const reduce = useReducedMotion() ?? false
  const heading = featured?.state === 'past' ? eventsCopy.headingPast : eventsCopy.headingUpcoming
  const marks = markVariants(reduce)
  const draw = makeVariants(reduce, 'scale-x')
  const rise = makeVariants(reduce, 'fade-up', 8)

  return (
    <Section id="events" labelledBy="events-title" className="events">
      <div className="container">
        <SectionLabel index={meta?.index ?? '03'} label={meta?.ruleLabel ?? meta?.label ?? 'Events'} />

        <WordReveal
          as="h2"
          id="events-title"
          className="t-h1 events__title"
          text={heading}
          stagger={0.09}
          duration={0.8}
          amount={0.6}
        />

        {featured && (
          <div className="events__ticket">
            <motion.span
              className="events__marks"
              aria-hidden="true"
              initial={reduce ? false : 'hidden'}
              whileInView="show"
              viewport={VIEWPORT}
              variants={staggerParent(0.05, 0.05)}
            >
              {CORNERS.map((corner) => (
                <motion.span key={corner} className={`events__crop events__crop--${corner}`} variants={marks.crop} />
              ))}
              <motion.span className="events__perf events__perf--top" variants={marks.crop} />
              <motion.span className="events__perf events__perf--bottom" variants={marks.crop} />
              <motion.span className="events__swatches" variants={marks.swatch}>
                {SWATCHES.map((swatch) => (
                  <span key={swatch} className={`events__swatch events__swatch--${swatch}`} />
                ))}
              </motion.span>
            </motion.span>

            <Tilt className="events__tilt" max={3} foil spotlight={false}>
              <EventTicket featured={featured} />
            </Tilt>
          </div>
        )}

        <motion.div
          className="events__more"
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={VIEWPORT}
          variants={staggerParent(0.08)}
        >
          <a className="events__more-link" href={site.links.instagram} target="_blank" rel="noopener noreferrer">
            <motion.span className="events__more-text" variants={rise} transition={tween(reduce ? 0 : 0.45)}>
              {eventsCopy.moreEvents}
            </motion.span>
            {handle && (
              <motion.span className="t-meta events__more-handle" variants={rise} transition={tween(reduce ? 0 : 0.45)}>
                {handle}
              </motion.span>
            )}
            <motion.span
              className="events__more-arrow"
              aria-hidden="true"
              variants={rise}
              transition={tween(reduce ? 0 : 0.45)}
            >
              <ArrowUpRight size={18} strokeWidth={1.75} />
            </motion.span>
            <span className="sr-only"> (opens in a new tab)</span>
            <motion.span
              className="rule events__more-rule"
              aria-hidden="true"
              variants={draw}
              transition={tween(reduce ? 0 : 0.6)}
            />
            <span className="events__more-ink" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </Section>
  )
}
