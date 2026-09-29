import type { Transition, Variants } from 'motion/react'

/** Easing curves (mirror --ease-out / --ease-in-out in tokens.css). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/** Durations in seconds (mirror --dur-* in tokens.css). */
export const DUR = { fast: 0.14, med: 0.24, slow: 0.45, hero: 0.8 } as const

/** The nav pill spring — the only spring in the system. */
export const NAV_SPRING: Transition = { type: 'spring', stiffness: 380, damping: 32, mass: 0.8 }

// The top margin reaches far above the viewport so anything already scrolled
// past counts as seen. Without it a fast scroll or a dropped frame can jump
// over an element and leave its entrance unplayed until you scroll back.
export const SEEN_ABOVE = '300% 0px 0px 0px'
export const VIEWPORT = { once: true, amount: 0.3, margin: '300% 0px -8% 0px' } as const

export type EntranceKind = 'fade-up' | 'fade' | 'scale-x' | 'clip-right'

/** With `reduced`, every entrance becomes an instant opacity: 1. */
export function makeVariants(reduced: boolean, kind: EntranceKind = 'fade-up', distance = 16): Variants {
  if (reduced) return { hidden: { opacity: 1 }, show: { opacity: 1 } }
  switch (kind) {
    case 'fade':
      return { hidden: { opacity: 0 }, show: { opacity: 1 } }
    case 'scale-x':
      return { hidden: { scaleX: 0 }, show: { scaleX: 1 } }
    case 'clip-right':
      return { hidden: { clipPath: 'inset(0 100% 0 0)' }, show: { clipPath: 'inset(0 0% 0 0)' } }
    default:
      return { hidden: { opacity: 0, y: distance }, show: { opacity: 1, y: 0 } }
  }
}

export const tween = (duration: number = DUR.slow, delay = 0, ease: readonly number[] = EASE_OUT): Transition => ({
  duration,
  delay,
  ease: ease as unknown as Transition['ease'],
})

/** Parent variants that stagger children using the `hidden`/`show` names. */
export const staggerParent = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})
