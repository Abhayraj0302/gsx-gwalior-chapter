import { motion, useReducedMotion } from 'motion/react'
import { sectionTotal } from '../../data/content'
import { EASE_OUT, SEEN_ABOVE } from '../../lib/motion'
import { cx } from '../../lib/cx'
import './SectionLabel.css'

type SectionLabelProps = {
  /** "01" */
  index: string
  /** "Who we are" — rendered uppercase. */
  label: string
  /** Defaults to the total number of indexed sections. */
  total?: string
  className?: string
  /** Hide the right-hand counter (hero index line). */
  noCounter?: boolean
  /** The lime tick that rides the head of the rule while it draws. On by default. */
  tick?: boolean
}

const DRAW = 0.8
const DRAW_TRANSITION = { duration: DRAW, ease: EASE_OUT }

/**
 * The observer watches the unscaled wrapper, since a scaled-to-zero element never
 * reports as in view. The stroke and tick share variants so they stay in step.
 */
export function SectionLabel({ index, label, total = sectionTotal, className, noCounter, tick = true }: SectionLabelProps) {
  const reduce = useReducedMotion()
  return (
    <div className={cx('index-rule', className)}>
      <span className="index-rule__label t-label">
        <span className="index-rule__bracket" aria-hidden="true">
          [{' '}
        </span>
        <span className="index-rule__num num">{index}</span>
        <span className="index-rule__dash" aria-hidden="true">
          {' '}
          —{' '}
        </span>
        <span className="index-rule__text">{label}</span>
        <span className="index-rule__bracket" aria-hidden="true">
          {' '}
          ]
        </span>
      </span>
      <motion.span
        className="index-rule__line"
        aria-hidden="true"
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.6, margin: SEEN_ABOVE }}
      >
        <motion.span
          className="index-rule__stroke rule"
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1 } }}
          transition={reduce ? { duration: 0 } : DRAW_TRANSITION}
        />
        {tick && !reduce && (
          <motion.span
            className="index-rule__runner"
            variants={{ hidden: { x: '-100%' }, show: { x: '0%' } }}
            transition={DRAW_TRANSITION}
          >
            <motion.span
              className="index-rule__tick"
              variants={{
                hidden: { opacity: 0, scaleY: 0.4 },
                show: {
                  opacity: [0, 1, 1, 0],
                  scaleY: [0.4, 1, 1, 0.4],
                  transition: { duration: DRAW + 0.25, times: [0, 0.12, 0.8, 1], ease: 'linear' },
                },
              }}
            />
          </motion.span>
        )}
      </motion.span>
      {!noCounter && (
        <span className="index-rule__counter t-meta">
          <span className="index-rule__now">{index}</span> / {total}
        </span>
      )}
    </div>
  )
}
