import { useRef, useState } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { Pause, Play } from 'lucide-react'
import { marqueeTerms } from '../../../data/content'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { Logo } from '../../brand/Logo'
import { Marquee } from '../../ui/Marquee'
import './MarqueeBand.css'

const DURATION_DESKTOP = 40
const DURATION_MOBILE = 36
const TERMS_LABEL = 'What we run'
const PAUSE_LABEL = 'Pause the ticker'

// Playback rate goes from 1x at rest to MAX_RATE at FAST_PX_PER_S of scroll.
const MAX_RATE = 2.5
const FAST_PX_PER_S = 2600
const RATE_SPRING = { stiffness: 120, damping: 30, mass: 0.6 }
// Skip tiny rate changes to avoid touching the animations every frame.
const RATE_STEP = 0.02

// The moving marquee is aria-hidden; screen readers get the sr-only list.
// The pause button covers WCAG 2.2.2 for touch and keyboard users.
export function MarqueeBand() {
  const reduce = useReducedMotion() === true
  const mobile = useMediaQuery('(max-width: 767px)')
  const [paused, setPaused] = useState(false)
  const bandRef = useRef<HTMLDivElement>(null)
  const lastRate = useRef(1)

  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const speed = useTransform(velocity, (v) => Math.min(1, Math.abs(v) / FAST_PX_PER_S))
  const eased = useSpring(speed, RATE_SPRING)

  useMotionValueEvent(eased, 'change', (k) => {
    if (reduce) return
    // The spring can undershoot zero, so clamp to keep the tape from slowing or reversing.
    const rate = 1 + Math.min(1, Math.max(0, k)) * (MAX_RATE - 1)
    if (Math.abs(rate - lastRate.current) < RATE_STEP && rate !== 1) return
    const track = bandRef.current?.querySelector<HTMLElement>('.marquee__track')
    if (!track || typeof track.getAnimations !== 'function') return
    for (const animation of track.getAnimations()) animation.playbackRate = rate
    lastRate.current = rate
  })

  return (
    <div ref={bandRef} className="band" data-paused={paused || undefined}>
      <ul className="sr-only" role="list" aria-label={TERMS_LABEL}>
        {marqueeTerms.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
      <Marquee
        items={marqueeTerms}
        duration={mobile ? DURATION_MOBILE : DURATION_DESKTOP}
        separator={<Logo size={10} title="" className="band__sep" />}
        itemClassName="band__item"
        className="band__marquee"
      />
      <button
        type="button"
        className="band__pause"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
      >
        {paused ? (
          <Play size={14} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Pause size={14} strokeWidth={2} aria-hidden="true" />
        )}
        <span className="sr-only">{PAUSE_LABEL}</span>
      </button>
    </div>
  )
}
