import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useMarkReady } from '../../context/AppReady'
import { site } from '../../data/content'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { EASE_OUT } from '../../lib/motion'
import { LOGO_LOBES } from '../brand/lobes'
import { HorizonArc } from '../ui/HorizonArc'
import './Preloader.css'

// Minimum time the preloader stays up (ms).
const FIRST_VISIT_MS = 1300
const REPEAT_VISIT_MS = 600
// Past this the page shows with the metric-matched fallback fonts.
const MAX_WAIT_MS = 2600
// Matches --preloader-exit-* in the CSS, plus a frame.
const EXIT_MS = 120 + 900 + 60
const SEEN_KEY = 'gsx:seen'

type Phase = 'loading' | 'leaving' | 'done'

const prefersReduced = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)

const seenThisSession = () => {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

function assetsReady(): Promise<void> {
  const fonts: Promise<unknown> = 'fonts' in document ? document.fonts.ready : Promise.resolve()
  const loaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
  return Promise.race([Promise.all([fonts, loaded]).then(() => undefined), wait(MAX_WAIT_MS)])
}

/**
 * Decorative parts are CSS animations so they stay smooth while the main thread loads fonts and the
 * WebGL chunk; only the count runs in JS. Skipped under reduced motion, shorter on repeat visits.
 */
export function Preloader() {
  const markReady = useMarkReady()
  const [phase, setPhase] = useState<Phase>(() => (prefersReduced() ? 'done' : 'loading'))
  const [quick] = useState(() => !prefersReduced() && seenThisSession())
  const progress = useMotionValue(0)
  const runnerX = useTransform(progress, (p) => `${(p - 1) * 100}%`)
  const counterRef = useRef<HTMLSpanElement>(null)

  useBodyScrollLock(phase !== 'done')

  useMotionValueEvent(progress, 'change', (v) => {
    if (counterRef.current) counterRef.current.textContent = String(Math.round(v * 100)).padStart(3, '0')
  })

  useEffect(() => {
    if (prefersReduced()) {
      markReady()
      setPhase('done')
      return
    }
    let cancelled = false
    let exitTimer = 0
    const min = quick ? REPEAT_VISIT_MS : FIRST_VISIT_MS
    // The intro assumes the top of the page; a deep link keeps its target.
    if (!window.location.hash) window.scrollTo(0, 0)

    progress.set(0)
    const creep = animate(progress, 0.86, { duration: min / 1000, ease: EASE_OUT })

    void Promise.all([assetsReady(), wait(min)]).then(async () => {
      if (cancelled) return
      creep.stop()
      await animate(progress, 1, { duration: 0.32, ease: EASE_OUT })
      if (cancelled) return
      await wait(100)
      if (cancelled) return
      try {
        window.sessionStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* storage unavailable */
      }
      markReady()
      setPhase('leaving')
      exitTimer = window.setTimeout(() => {
        if (!cancelled) setPhase('done')
      }, EXIT_MS)
    })

    return () => {
      cancelled = true
      creep.stop()
      window.clearTimeout(exitTimer)
    }
  }, [markReady, progress, quick])

  if (phase === 'done') return null

  return (
    <div className="preloader" role="status" aria-live="polite" data-phase={phase} data-quick={quick ? '' : undefined}>
      <div className="preloader__panel">
        <span className="sr-only">Loading {site.shortName}</span>
        <div className="preloader__dots dots-fine" aria-hidden="true" />
        <HorizonArc className="preloader__horizon" rise={150} />

        <div className="preloader__stage" aria-hidden="true">
          <div className="preloader__mark">
            {LOGO_LOBES.map((lobe, i) => (
              <span
                key={lobe.key}
                className={`preloader__lobe preloader__lobe--${lobe.key}`}
                style={{ '--lobe-i': i, '--lobe-x': lobe.x, '--lobe-y': lobe.y } as CSSProperties}
              />
            ))}
          </div>
        </div>

        <div className="preloader__bar" aria-hidden="true">
          <span className="preloader__label t-label">
            {site.wordmark} — {site.institution}
          </span>
          <span className="preloader__count t-label">
            <span ref={counterRef}>000</span>
          </span>
          <span className="preloader__track rule">
            <motion.span className="preloader__fill" style={{ scaleX: progress }} />
            <motion.span className="preloader__runner" style={{ x: runnerX }}>
              <span className="preloader__tick" />
            </motion.span>
          </span>
        </div>
      </div>
      <span className="preloader__edge" aria-hidden="true" />
    </div>
  )
}
