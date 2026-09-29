import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cx } from '../../../lib/cx'
import './DecodeText.css'

const GLYPHS = '0123456789#/<>_'
// Throttle glyph swaps so the cycle reads as a flicker rather than noise.
const CYCLE_MS = 48
// Used when the probe cannot be measured, e.g. under a display:none ancestor.
const FALLBACK_WIDTH = '1ch'

type DecodeTextProps = {
  text: string
  /** The plain word is rendered until this turns true. */
  play?: boolean
  delay?: number
  stagger?: number
  /** ms from `delay` until the last letter has resolved. */
  duration?: number
  className?: string
}

type Phase = 'measure' | 'run' | 'done'

const isSpace = (c: string) => /\s/.test(c)
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

// Measure each letter's advance from a real text node so the fixed-width cells
// match the kerned final text and nothing shifts when it hands over.
function measureAdvances(probe: HTMLElement, chars: string[]): string[] {
  const fallback = chars.map(() => FALLBACK_WIDTH)
  const node = probe.firstChild
  if (!node || node.nodeType !== Node.TEXT_NODE) return fallback
  const range = document.createRange()
  const lefts: number[] = []
  let offset = 0
  let lastRight = 0
  for (const c of chars) {
    range.setStart(node, offset)
    range.setEnd(node, offset + c.length)
    const rect = range.getBoundingClientRect()
    lefts.push(rect.left)
    lastRight = rect.right
    offset += c.length
  }
  if (lefts.length === 0 || lastRight - lefts[0] <= 0) return fallback
  return chars.map((_, i) => {
    const w = i + 1 < lefts.length ? lefts[i + 1] - lefts[i] : lastRight - lefts[i]
    return w > 0 ? `${w}px` : FALLBACK_WIDTH
  })
}

// Screen readers get the sr-only text; the cycling letters are aria-hidden.
// Cells are re-measured when webfonts finish loading, since a late swap
// changes the advances.
export function DecodeText({ text, play = true, delay = 0, stagger = 60, duration = 700, className }: DecodeTextProps) {
  const reduce = useReducedMotion()
  const chars = useMemo(() => Array.from(text), [text])
  const probeRef = useRef<HTMLSpanElement>(null)
  const doneRef = useRef(false)
  const [runPhase, setPhase] = useState<Phase>('measure')
  const [widths, setWidths] = useState<string[] | null>(null)
  const [shown, setShown] = useState<string[]>(chars)
  const phase: Phase = reduce ? 'done' : runPhase

  useLayoutEffect(() => {
    if (doneRef.current) return
    if (reduce) {
      doneRef.current = true
      return
    }
    if (!play) return

    let cancelled = false
    let frame = 0
    const fonts = typeof document !== 'undefined' && 'fonts' in document ? document.fonts : null

    const measure = () => {
      if (cancelled || doneRef.current) return
      const probe = probeRef.current
      setWidths(probe ? measureAdvances(probe, chars) : chars.map(() => FALLBACK_WIDTH))
    }
    const onFonts = () => measure()
    const stopFonts = () => fonts?.removeEventListener('loadingdone', onFonts)

    measure()
    if (fonts) {
      void fonts.ready.then(onFonts)
      fonts.addEventListener('loadingdone', onFonts)
    }

    const n = chars.length
    const lead = Math.max(0, duration - Math.max(0, n - 1) * stagger)
    const startAt = performance.now() + delay
    const current = chars.map((c) => (isSpace(c) ? c : randomGlyph()))
    let lastCycle = 0
    setShown([...current])
    setPhase('run')

    const tick = (now: number) => {
      if (cancelled) return
      const t = now - startAt
      const cycle = now - lastCycle >= CYCLE_MS
      let changed = false
      let allDone = true
      for (let i = 0; i < n; i++) {
        const c = chars[i]
        if (isSpace(c) || t >= lead + i * stagger) {
          if (current[i] !== c) {
            current[i] = c
            changed = true
          }
        } else {
          allDone = false
          if (cycle) {
            current[i] = randomGlyph()
            changed = true
          }
        }
      }
      if (cycle) lastCycle = now
      if (changed) setShown([...current])
      if (allDone) {
        doneRef.current = true
        stopFonts()
        setPhase('done')
        return
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)

    return () => {
      cancelled = true
      stopFonts()
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [reduce, play, chars, delay, stagger, duration])

  if (phase === 'done') {
    return (
      <span className={cx('decode', className)}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">{text}</span>
      </span>
    )
  }

  return (
    <span className={cx('decode', className)}>
      <span className="sr-only">{text}</span>
      {phase === 'measure' ? (
        <span className="decode__probe" aria-hidden="true" ref={probeRef}>
          {text}
        </span>
      ) : (
        <>
          {/* Hidden copy kept so a late font swap can be re-measured. */}
          <span className="decode__probe decode__probe--ghost" aria-hidden="true" ref={probeRef}>
            {text}
          </span>
          <span className="decode__glyphs" aria-hidden="true">
            {chars.map((c, i) => (
              <span key={i} className="decode__ch" style={{ width: widths?.[i] }}>
                {shown[i] ?? c}
              </span>
            ))}
          </span>
        </>
      )}
    </span>
  )
}
