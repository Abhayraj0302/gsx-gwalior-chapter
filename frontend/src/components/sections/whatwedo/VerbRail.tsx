import { motion, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { cx } from '../../../lib/cx'
import './VerbRail.css'

export type VerbRailProps = {
  /** One-based. */
  step: number
  total: number
  label: string
  /** 0–1. A MotionValue keeps it scroll-linked without re-rendering. */
  progress?: MotionValue<number> | number
  /** Hidden from screen readers. */
  aside?: ReactNode
  className?: string
}

const pad2 = (n: number) => String(n).padStart(2, '0')

// Everything except the sr-only "Step 3 of 7" text is decorative.
export function VerbRail({ step, total, label, progress, aside, className }: VerbRailProps) {
  const fill = progress ?? (total > 1 ? (step - 1) / (total - 1) : 1)

  return (
    <div className={cx('verb-rail', className)}>
      <span className="sr-only">{`${label} ${step} of ${total}`}</span>

      <span className="verb-rail__line" aria-hidden="true">
        <motion.span className="verb-rail__fill" style={{ scaleX: fill }} />
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1
          return (
            <span
              key={n}
              className={cx(
                'verb-rail__tick',
                n < step && 'verb-rail__tick--passed',
                n === step && 'verb-rail__tick--active',
              )}
            />
          )
        })}
      </span>

      <span className="verb-rail__readout" aria-hidden="true">
        <span className="verb-rail__step t-label">
          {label} <span className="verb-rail__now">{pad2(step)}</span> / {pad2(total)}
        </span>
        {aside != null && <span className="verb-rail__aside t-label">{aside}</span>}
      </span>
    </div>
  )
}
