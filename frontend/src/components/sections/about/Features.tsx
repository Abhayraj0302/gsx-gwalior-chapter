import { motion, useReducedMotion, type Variants } from 'motion/react'
import { features } from '../../../data/content'
import { EASE_OUT } from '../../../lib/motion'
import { cx } from '../../../lib/cx'
import './Features.css'

// Seconds.
const STAGGER = 0.09
const RULE_DUR = 0.6
const RISE_DUR = 0.7
const RISE_DELAY = 0.12
const RISE = 28

type FeaturesProps = { className?: string }

export function Features({ className }: FeaturesProps) {
  const reduce = useReducedMotion() ?? false

  const still: Variants = { hidden: { opacity: 1 }, show: { opacity: 1 } }
  const row: Variants = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : STAGGER } } }
  const column: Variants = { hidden: {}, show: {} }
  const rule: Variants = reduce
    ? still
    : { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: RULE_DUR, ease: EASE_OUT } } }
  const entry: Variants = reduce
    ? still
    : {
        hidden: { opacity: 0, y: RISE },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            y: { duration: RISE_DUR, delay: RISE_DELAY, ease: EASE_OUT },
            opacity: { duration: RISE_DUR * 0.7, delay: RISE_DELAY, ease: EASE_OUT },
          },
        },
      }

  return (
    <motion.ul
      className={cx('features', className)}
      variants={row}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3, margin: '300% 0px -6% 0px' }}
    >
      {features.map((feature) => (
        <motion.li key={feature.id} className="features__col" variants={column}>
          <motion.span className="features__rule" aria-hidden="true" variants={rule} />
          <motion.div className="features__entry" variants={entry}>
            <div className="features__head">
              <span className="features__num t-label num">
                <span aria-hidden="true">#</span>
                {feature.index}
              </span>
              <h3 className="features__title t-h3">{feature.title}</h3>
            </div>
            <p className="features__desc t-small">{feature.description}</p>
          </motion.div>
        </motion.li>
      ))}
    </motion.ul>
  )
}
