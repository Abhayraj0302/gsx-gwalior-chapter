import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { useCanHover } from '../../hooks/useMediaQuery'
import { cx } from '../../lib/cx'

type MagneticProps = {
  children: ReactNode
  className?: string
  /** 0–1: how far the child follows the pointer. */
  strength?: number
}

const SPRING = { stiffness: 260, damping: 18, mass: 0.5 }

/** Pulls its child toward the pointer on hover. Inert on touch devices and under reduced motion. */
export function Magnetic({ children, className, strength = 0.28 }: MagneticProps) {
  const reduce = useReducedMotion()
  const canHover = useCanHover()
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(0, SPRING)
  const y = useSpring(0, SPRING)

  if (reduce || !canHover) return <span className={cx('magnetic', className)}>{children}</span>

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={ref}
      className={cx('magnetic', className)}
      style={{ x, y, display: 'inline-flex' }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.span>
  )
}
