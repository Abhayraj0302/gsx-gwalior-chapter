import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './Section.css'

type SectionProps = {
  id: string
  /** id of the heading element that labels this section. */
  labelledBy: string
  children: ReactNode
  className?: string
  /** Remove the standard vertical padding (hero, footer manage their own). */
  flush?: boolean
} & Omit<ComponentPropsWithoutRef<'section'>, 'id' | 'className' | 'children'>

/** tabindex -1 lets in-page navigation move focus here. */
export function Section({ id, labelledBy, children, className, flush, ...rest }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} tabIndex={-1} className={cx('section', flush && 'section--flush', className)} {...rest}>
      {children}
    </section>
  )
}
