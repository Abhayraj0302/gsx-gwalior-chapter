import { motion, useReducedMotion, type Variants } from 'motion/react'
import { useMemo, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react'
import { DUR, EASE_OUT } from '../../lib/motion'

export type RevealKind = 'fade-up' | 'fade' | 'clip-up' | 'scale-in' | 'slide-left' | 'slide-right'

type RevealProps<T extends ElementType> = {
  as?: T
  kind?: RevealKind
  /** Seconds. Defaults per kind. */
  duration?: number
  delay?: number
  /** Fraction of the element that must be visible before it plays. */
  amount?: number
  /** Root margin so elements start slightly before entering. */
  margin?: string
  once?: boolean
  children: ReactNode
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'children' | 'className'>

const VARIANTS: Record<RevealKind, Variants> = {
  'fade-up': { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  'clip-up': {
    hidden: { clipPath: 'inset(100% 0 0 0)', y: 12 },
    show: { clipPath: 'inset(0% 0 0 0)', y: 0 },
  },
  'scale-in': { hidden: { opacity: 0, scale: 0.96 }, show: { opacity: 1, scale: 1 } },
  'slide-left': { hidden: { opacity: 0, x: 32 }, show: { opacity: 1, x: 0 } },
  'slide-right': { hidden: { opacity: 0, x: -32 }, show: { opacity: 1, x: 0 } },
}

const DEFAULT_DURATION: Record<RevealKind, number> = {
  'fade-up': DUR.slow,
  fade: DUR.slow,
  'clip-up': DUR.slow,
  'scale-in': DUR.slow,
  'slide-left': DUR.slow,
  'slide-right': DUR.slow,
}

/** Plays once on scroll into view. Under reduced motion it renders in its final state. */
export function Reveal<T extends ElementType = 'div'>({
  as,
  kind = 'fade-up',
  duration,
  delay = 0,
  amount = 0.25,
  margin = '300% 0px -8% 0px',
  once = true,
  children,
  className,
  ...rest
}: RevealProps<T>) {
  const reduce = useReducedMotion()
  const Tag = (as ?? 'div') as unknown as 'div'
  const MotionTag = useMemo(() => motion.create(Tag), [Tag])
  if (reduce) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    )
  }
  return (
    <MotionTag
      className={className}
      variants={VARIANTS[kind]}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin }}
      transition={{ duration: duration ?? DEFAULT_DURATION[kind], delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Staggers children that use the `hidden`/`show` variant names. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  amount = 0.2,
  as,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  amount?: number
  as?: ElementType
}) {
  const reduce = useReducedMotion()
  const Tag = (as ?? 'div') as unknown as 'div'
  const MotionTag = useMemo(() => motion.create(Tag), [Tag])
  if (reduce) return <Tag className={className}>{children}</Tag>
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: '300% 0px -8% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {children}
    </MotionTag>
  )
}

export const itemVariants = {
  'fade-up': VARIANTS['fade-up'],
  'scale-in': VARIANTS['scale-in'],
  fade: VARIANTS.fade,
} as const

export const revealTransition = (duration: number = DUR.slow, delay = 0) => ({ duration, delay, ease: EASE_OUT })
