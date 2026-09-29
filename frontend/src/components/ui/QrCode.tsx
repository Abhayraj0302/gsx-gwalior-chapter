import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { encode } from 'uqr'
import { EASE_IN_OUT, SEEN_ABOVE } from '../../lib/motion'
import { cx } from '../../lib/cx'
import './QrCode.css'

type QrCodeProps = {
  /** What the code opens. */
  value: string
  /** Accessible name, e.g. "QR code: register for GSX Commit 1.0". */
  label: string
  caption?: string
  /** Seconds before the print starts once the code is on screen. */
  delay?: number
  className?: string
}

// White margin around the code, in modules. Scanners want a light border.
const QUIET = 3

// Rounded rectangle as a path, so the three finder squares can be softened
// without touching the data modules.
function roundRect(x: number, y: number, w: number, h: number, r: number) {
  return (
    `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
    `a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}` +
    `v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`
  )
}

function buildPaths(value: string) {
  const { size, data } = encode(value, { ecc: 'M', border: 0 })
  const finders: Array<[number, number]> = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]
  const inFinder = (x: number, y: number) => finders.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7)

  // One horizontal run per path segment keeps the path short.
  let modules = ''
  for (let y = 0; y < size; y++) {
    let x = 0
    while (x < size) {
      if (!data[y][x] || inFinder(x, y)) {
        x++
        continue
      }
      let run = 1
      while (x + run < size && data[y][x + run] && !inFinder(x + run, y)) run++
      modules += `M${x + QUIET} ${y + QUIET}h${run}v1h${-run}z`
      x += run
    }
  }

  let eyes = ''
  for (const [fx, fy] of finders) {
    const x = fx + QUIET
    const y = fy + QUIET
    eyes += roundRect(x, y, 7, 7, 2) + roundRect(x + 1, y + 1, 5, 5, 1.4) + roundRect(x + 2, y + 2, 3, 3, 0.9)
  }

  return { dim: size + QUIET * 2, modules, eyes }
}

/**
 * A scannable QR code that prints top to bottom behind a scan line the first
 * time it comes on screen. The observer sits on the unclipped figure; only the
 * inner SVG is clipped. Under reduced motion it renders complete.
 */
export function QrCode({ value, label, caption, delay = 0.2, className }: QrCodeProps) {
  const reduce = useReducedMotion() ?? false
  const { dim, modules, eyes } = useMemo(() => buildPaths(value), [value])
  const print = { duration: reduce ? 0 : 0.9, delay: reduce ? 0 : delay, ease: EASE_IN_OUT }

  return (
    <motion.figure
      className={cx('qr', className)}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.4, margin: SEEN_ABOVE }}
    >
      <span className="qr__tile" role="img" aria-label={label}>
        <motion.svg
          className="qr__code"
          viewBox={`0 0 ${dim} ${dim}`}
          shapeRendering="crispEdges"
          aria-hidden="true"
          focusable="false"
          variants={{ hidden: { clipPath: 'inset(0% 0% 100% 0%)' }, show: { clipPath: 'inset(0% 0% 0% 0%)' } }}
          transition={print}
        >
          <path className="qr__modules" d={modules} />
          <path className="qr__eyes" d={eyes} fillRule="evenodd" shapeRendering="geometricPrecision" />
        </motion.svg>
        {!reduce && (
          <motion.span
            className="qr__scan"
            aria-hidden="true"
            variants={{
              hidden: { y: '0%', opacity: 0 },
              show: { y: '100%', opacity: [0, 1, 1, 0], transition: { ...print, opacity: { ...print, times: [0, 0.08, 0.85, 1] } } },
            }}
          />
        )}
      </span>
      {caption && <figcaption className="qr__caption t-meta">{caption}</figcaption>}
    </motion.figure>
  )
}
