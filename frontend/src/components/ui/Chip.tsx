import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './Chip.css'

type ChipProps = {
  tone?: 'neutral' | 'live' | 'signal'
  /** Prefix a static 6px live dot (decorative; the text carries the meaning). */
  dot?: boolean
  className?: string
  children: ReactNode
}

/** 24px badge. Tones: neutral (tags), live (magenta: now/inaugural), signal (lime: technical). */
export function Chip({ tone = 'neutral', dot, className, children }: ChipProps) {
  return (
    <span className={cx('chip', `chip--${tone}`, className)}>
      {dot && <span className="live-dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
