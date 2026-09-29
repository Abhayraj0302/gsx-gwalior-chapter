import { useEffect, useRef, type CSSProperties } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import { events, stats, type Stat } from '../../../data/content'
import { EASE_OUT, SEEN_ABOVE } from '../../../lib/motion'
import { formatIstDate, istDateKey } from '../../../lib/dates'
import { cx } from '../../../lib/cx'
import './Stats.css'

// Seconds. Also passed to the CSS as custom properties so the rules and the count stay in sync.
const START = 0.3
const STEP = 0.11
const COUNT = 0.9
const UNDERLINE = 0.3

type StatsProps = { className?: string }

// The counting number is aria-hidden; screen readers get the final value.
export function Stats({ className }: StatsProps) {
  const reduce = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35, margin: SEEN_ABOVE })
  const drawn = reduce || inView

  const timing = {
    '--stats-start': `${START}s`,
    '--stats-step': `${STEP}s`,
    '--stats-count': `${COUNT}s`,
    '--stats-underline': `${UNDERLINE}s`,
  } as CSSProperties

  return (
    <div ref={ref} className={cx('stats', drawn && 'stats--drawn', className)} style={timing}>
      <dl className="stats__cells">
        {stats.map((stat, i) => (
          <StatCell key={stat.label} stat={stat} index={i} started={drawn} reduce={reduce} />
        ))}
      </dl>
    </div>
  )
}

type StatCellProps = { stat: Stat; index: number; started: boolean; reduce: boolean }

function StatCell({ stat, index, started, reduce }: StatCellProps) {
  const countRef = useRef<HTMLSpanElement>(null)
  const finalText = stat.display ?? `${stat.value}${stat.suffix ?? ''}`
  // Numeric display values like "04" count up zero-padded; dates are revealed instead.
  const counts = stat.display === undefined || /^\d+$/.test(stat.display)
  const digits = counts ? (stat.display ?? String(stat.value)).length : 0
  const pad = (n: number) => String(n).padStart(digits, '0')

  useEffect(() => {
    if (!counts || !started || reduce) return
    const el = countRef.current
    if (!el) return
    const controls = animate(0, stat.value, {
      duration: COUNT,
      delay: START + index * STEP,
      ease: EASE_OUT,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v)).padStart(digits, '0')
      },
    })
    return () => controls.stop()
  }, [counts, started, reduce, stat.value, index, digits])

  return (
    <div className="stats__cell" style={{ '--i': index } as CSSProperties}>
      <dt className="stats__label t-label">{stat.label}</dt>

      <dd className={cx('stats__figure', 't-stat', !counts && 'stats__figure--text')}>
        <span className="stats__shift">
          {counts ? (
            <>
              <span className="sr-only">{finalText}</span>
              <span aria-hidden="true">
                <span ref={countRef} className="stats__count">
                  {reduce ? pad(stat.value) : pad(0)}
                </span>
                {stat.suffix ? <span className="stats__suffix">{stat.suffix}</span> : null}
              </span>
            </>
          ) : (
            <span className="stats__print">
              <StatDate text={finalText} />
            </span>
          )}
        </span>
        <span className="stats__underline" aria-hidden="true" />
      </dd>

      {stat.note ? <dd className="stats__note t-meta">{stat.note}</dd> : null}
    </div>
  )
}

function StatDate({ text }: { text: string }) {
  const match = events.find((e) => formatIstDate(e.start) === text.replace(/^0/, ''))
  if (!match) return <>{text}</>
  return <time dateTime={istDateKey(new Date(match.start))}>{text}</time>
}
