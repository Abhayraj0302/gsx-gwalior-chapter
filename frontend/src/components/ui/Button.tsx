import { ArrowUpRight } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './Button.css'

/** `lime` is the rare high-emphasis fill (signal colour, dark ink). Use it once per view at most. */
type Variant = 'primary' | 'secondary' | 'ghost' | 'icon' | 'lime'
type Size = 'md' | 'sm'

type Common = {
  variant?: Variant
  size?: Size
  /** Stretch to the container width. */
  full?: boolean
  /** External link: opens in a new tab, adds the arrow icon and an sr-only note. */
  external?: boolean
  iconStart?: ReactNode
  iconEnd?: ReactNode
  className?: string
  children?: ReactNode
}

type AnchorProps = Common & { href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>
type NativeButtonProps = Common & { href?: undefined } & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>

export type ButtonProps = AnchorProps | NativeButtonProps

/** Renders <a> when `href` is given, otherwise <button>. The icon variant needs an aria-label. */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', full, external, iconStart, iconEnd, className, children } = props
  const classes = cx('btn', `btn--${variant}`, size === 'sm' && 'btn--sm', full && 'btn--full', className)
  const trailing =
    iconEnd ?? (external ? <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" className="btn__icon" /> : null)
  const content = (
    <>
      {iconStart && <span className="btn__icon btn__icon--start">{iconStart}</span>}
      {children && <span className="btn__label">{children}</span>}
      {trailing && <span className="btn__icon btn__icon--end">{trailing}</span>}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  )

  if (props.href !== undefined) {
    const { variant: _v, size: _s, full: _f, external: _e, iconStart: _is, iconEnd: _ie, className: _c, children: _ch, href, ...rest } = props
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    )
  }

  const { variant: _v, size: _s, full: _f, external: _e, iconStart: _is, iconEnd: _ie, className: _c, children: _ch, href: _h, type, ...rest } = props
  return (
    <button type={type ?? 'button'} className={classes} {...rest}>
      {content}
    </button>
  )
}
