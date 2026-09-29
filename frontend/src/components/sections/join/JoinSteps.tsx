import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useId, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { events, join, site, whatWeDo } from '../../../data/content'
import { useEventState } from '../../../hooks/useEventState'
import { EASE_IN_OUT, EASE_OUT, staggerParent, tween, VIEWPORT } from '../../../lib/motion'
import { cx } from '../../../lib/cx'
import { Button } from '../../ui/Button'
import { joinCopy } from './joinCopy'

type StepLink = { label: string; href: string }

type Step = {
  key: string
  title: string
  description: string
  live?: boolean
  links: StepLink[]
}

/** In list-local px, along the numerals' centre line. */
type ConnectorGeom = { w: number; h: number; x: number; y1: number; y2: number }

const ROW_STAGGER = 0.07
const ROW_DUR = 0.55
const RULE_DUR = 0.7
const CONNECTOR_DELAY = 0.3
const CONNECTOR_DURATION = 0.9

/** The members' group step only appears once an invite link exists. */
function useSteps(): Step[] {
  const featured = useEventState()
  const isPast = featured?.state === 'past'
  const registerUrl = featured?.event.registerUrl ?? events[0]?.registerUrl

  const steps: Step[] = [
    {
      key: 'register',
      title: join.steps.register.title,
      description: isPast ? join.steps.register.pastDescription : join.steps.register.description,
      live: featured !== null && !isPast,
      // A register link to a finished event would be a dead end; the past copy points at Instagram instead.
      links: !isPast && registerUrl ? [{ label: join.steps.register.link, href: registerUrl }] : [],
    },
    {
      key: 'follow',
      title: join.steps.follow.title,
      description: join.steps.follow.description,
      links: [
        { label: joinCopy.linkedin, href: site.links.linkedin },
        { label: joinCopy.instagram, href: site.links.instagram },
      ],
    },
    {
      key: 'show',
      title: join.steps.show.title,
      description: join.steps.show.description,
      links: [],
    },
  ]

  const group = site.links.joinGroup
  if (group) {
    steps.push({
      key: 'group',
      title: join.steps.group.title,
      description: join.steps.group.description,
      links: [{ label: join.steps.group.link, href: group }],
    })
  }

  return steps
}

/** Walks the offsetParent chain so in-flight transforms do not affect the measurement. */
function offsetWithin(el: HTMLElement, root: HTMLElement): { x: number; y: number } {
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== root) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return { x, y }
}

function useConnectorGeom(listRef: RefObject<HTMLOListElement | null>, count: number): ConnectorGeom | null {
  const [geom, setGeom] = useState<ConnectorGeom | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const measure = () => {
      const marks = list.querySelectorAll<HTMLElement>('.join-steps__index')
      if (marks.length < 2) {
        setGeom(null)
        return
      }
      const first = marks[0]
      const last = marks[marks.length - 1]
      const a = offsetWithin(first, list)
      const b = offsetWithin(last, list)
      const next: ConnectorGeom = {
        w: list.offsetWidth,
        h: list.offsetHeight,
        x: a.x + first.offsetWidth / 2,
        y1: a.y + first.offsetHeight / 2,
        y2: b.y + last.offsetHeight / 2,
      }
      setGeom((prev) =>
        prev && prev.w === next.w && prev.h === next.h && prev.x === next.x && prev.y1 === next.y1 && prev.y2 === next.y2
          ? prev
          : next,
      )
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    document.fonts?.ready.then(measure).catch(() => undefined)
    return () => ro.disconnect()
  }, [listRef, count])

  return geom
}

/**
 * The connector is drawn through a mask so the dotted stroke keeps its pattern.
 * Variant transitions have no `delay` key: even 0 would override the parent's stagger.
 */
export function JoinSteps() {
  const reduce = useReducedMotion() ?? false
  const steps = useSteps()
  const listRef = useRef<HTMLOListElement>(null)
  const geom = useConnectorGeom(listRef, steps.length)
  const [drawn, setDrawn] = useState(false)
  const maskId = useId()
  const d = geom ? `M ${geom.x} ${geom.y1} V ${geom.y2}` : ''
  const travel = geom ? geom.y2 - geom.y1 : 0

  const still: Variants = { hidden: {}, show: {} }
  const rule: Variants = reduce
    ? still
    : { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: RULE_DUR, ease: EASE_IN_OUT } } }
  const rise: Variants = reduce
    ? still
    : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: ROW_DUR, ease: EASE_OUT } } }

  return (
    <motion.ol
      ref={listRef}
      role="list" /* WebKit drops list semantics for list-style: none lists */
      className="join-steps"
      variants={staggerParent(ROW_STAGGER)}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={VIEWPORT}
      onViewportEnter={() => setDrawn(true)}
    >
      {geom && (
        <svg
          className="join-steps__connector"
          width={geom.w}
          height={geom.h}
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={geom.w} height={geom.h}>
              <motion.path
                d={d}
                className="join-steps__connector-reveal"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: reduce || drawn ? 1 : 0 }}
                transition={tween(reduce ? 0 : CONNECTOR_DURATION, reduce ? 0 : CONNECTOR_DELAY, EASE_IN_OUT)}
              />
            </mask>
          </defs>
          <path d={d} className="join-steps__dots" mask={`url(#${maskId})`} />
          {!reduce && (
            <motion.circle
              className="join-steps__head"
              cx={geom.x}
              cy={geom.y1}
              r={3}
              initial={{ y: 0, opacity: 0 }}
              animate={drawn ? { y: travel, opacity: [0, 1, 1, 0] } : { y: 0, opacity: 0 }}
              transition={{
                y: tween(CONNECTOR_DURATION, CONNECTOR_DELAY, EASE_IN_OUT),
                opacity: { duration: CONNECTOR_DURATION, delay: CONNECTOR_DELAY, times: [0, 0.1, 0.82, 1] },
              }}
            />
          )}
        </svg>
      )}

      {steps.map((step, i) => {
        const last = i === steps.length - 1
        return (
          <motion.li key={step.key} className="join-steps__row" variants={still}>
            <motion.span
              className={cx('join-steps__rule', i === 0 && 'join-steps__rule--tick')}
              aria-hidden="true"
              variants={rule}
            />
            {last && (
              <motion.span
                className="join-steps__rule join-steps__rule--end join-steps__rule--tick"
                aria-hidden="true"
                variants={rule}
              />
            )}

            <motion.div className="join-steps__rise" variants={rise}>
              {/* Read as "Step 1"; the visible numeral is decorative. */}
              <span className="sr-only">
                {whatWeDo.stepLabel} {i + 1}
              </span>
              <span className="join-steps__num" aria-hidden="true">
                <span className="join-steps__index t-label">{String(i + 1).padStart(2, '0')}</span>
                {step.live && <span className="live-dot join-steps__dot" />}
              </span>

              <div className="join-steps__body">
                <h3 className="t-h3 join-steps__title">{step.title}</h3>
                <p className="t-small join-steps__desc">{step.description}</p>
                {step.links.length > 0 && (
                  <div className="join-steps__links">
                    {step.links.map((link) => (
                      <Button key={link.href} variant="ghost" external href={link.href} className="join-steps__link">
                        {link.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.li>
        )
      })}
    </motion.ol>
  )
}
