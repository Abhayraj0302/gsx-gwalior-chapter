import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { useCanHover } from '../../hooks/useMediaQuery'
import { cx } from '../../lib/cx'
import './Tilt.css'

type TiltProps = {
  children: ReactNode
  className?: string
  /** Max rotation in degrees. */
  max?: number
  /** Show the pointer-following spotlight. */
  spotlight?: boolean
  /** Show the holographic foil sweep (tickets). */
  foil?: boolean
}

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 }

/** Renders a plain wrapper on touch devices and under reduced motion. */
export function Tilt({ children, className, max = 5, spotlight = true, foil = false }: TiltProps) {
  const reduce = useReducedMotion()
  const canHover = useCanHover()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useSpring(0, SPRING)
  const ry = useSpring(0, SPRING)
  const mx = useMotionValue(50)
  const my = useMotionValue(50)
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, var(--spot), transparent 65%)`
  const foilPos = useMotionTemplate`${mx}% ${my}%`

  if (reduce || !canHover) return <div className={cx('tilt tilt--static', className)}>{children}</div>

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * 2 * max)
    rx.set(-(py - 0.5) * 2 * max)
    mx.set(px * 100)
    my.set(py * 100)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={cx('tilt', className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
      {spotlight && <motion.span className="tilt__spot" style={{ background: spot }} aria-hidden="true" />}
      {foil && <motion.span className="tilt__foil" style={{ backgroundPosition: foilPos }} aria-hidden="true" />}
    </motion.div>
  )
}
