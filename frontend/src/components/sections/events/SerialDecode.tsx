import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cx } from '../../../lib/cx'
import './SerialDecode.css'

const GLYPHS = '0123456789ABCDEF'
const CYCLE_MS = 40
// Separators stay put so the serial keeps its shape while scrambling.
const isFixed = (c: string) => /[\s\-·]/.test(c)
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

type SerialDecodeProps = {
  text: string
  active: boolean
  /** ms */
  delay?: number
  /** ms */
  duration?: number
  className?: string
}

// Uses a per-run cancelled flag instead of a "ran" ref, so a StrictMode double
// mount restarts cleanly and cleanup always restores the real text.
export function SerialDecode({ text, active, delay = 0, duration = 650, className }: SerialDecodeProps) {
  const reduce = useReducedMotion()
  const chars = useMemo(() => Array.from(text), [text])
  // null means render the real text.
  const [shown, setShown] = useState<string[] | null>(null)

  useEffect(() => {
    if (!active || reduce) return

    let cancelled = false
    let frame = 0
    let startAt = 0
    let lastCycle = 0
    const n = chars.length
    const current = chars.map((c) => (isFixed(c) ? c : randomGlyph()))
    setShown([...current])

    const tick = (now: number) => {
      if (cancelled) return
      if (!startAt) startAt = now
      const t = Math.min(1, (now - startAt) / duration)
      const resolved = Math.floor(t * (n + 1))
      const cycle = now - lastCycle >= CYCLE_MS
      let changed = false
      for (let i = 0; i < n; i++) {
        const c = chars[i]
        if (isFixed(c) || i < resolved) {
          if (current[i] !== c) {
            current[i] = c
            changed = true
          }
        } else if (cycle) {
          current[i] = randomGlyph()
          changed = true
        }
      }
      if (cycle) lastCycle = now
      if (changed) setShown([...current])
      if (t < 1) frame = window.requestAnimationFrame(tick)
      else setShown(null)
    }

    const timer = window.setTimeout(() => {
      frame = window.requestAnimationFrame(tick)
    }, delay)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      if (frame) window.cancelAnimationFrame(frame)
      setShown(null)
    }
  }, [active, reduce, chars, delay, duration])

  return (
    <span className={cx('serial', className)}>
      <span className="sr-only">{text}</span>
      <span className="serial__glyphs" aria-hidden="true">
        {chars.map((c, i) => (
          <span key={i} className={cx('serial__ch', shown && shown[i] !== c && 'serial__ch--cycling')}>
            {shown ? shown[i] : c}
          </span>
        ))}
      </span>
    </span>
  )
}
