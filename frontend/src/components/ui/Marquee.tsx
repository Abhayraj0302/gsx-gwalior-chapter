import type { CSSProperties, ReactNode } from 'react'
import './Marquee.css'

type MarqueeProps = {
  items: readonly ReactNode[]
  /** Seconds for one full loop of the track. */
  duration?: number
  direction?: 'left' | 'right'
  /** Separator rendered between items. */
  separator?: ReactNode
  /** Pause when hovered (pointer devices only). */
  pauseOnHover?: boolean
  className?: string
  /** Extra class applied to every item. */
  itemClassName?: string
  /** Screen-reader summary. When omitted the marquee is treated as decorative. */
  label?: string
}

/**
 * Items are rendered twice so the CSS loop is seamless. Under reduced motion
 * the track stops and wraps instead.
 */
export function Marquee({
  items,
  duration = 40,
  direction = 'left',
  separator,
  pauseOnHover = true,
  className = '',
  itemClassName = '',
  label,
}: MarqueeProps) {
  const style = { '--marquee-duration': `${duration}s` } as CSSProperties
  const renderTrack = (hidden: boolean) => (
    <ul className="marquee__list" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={i} className={`marquee__item ${itemClassName}`.trim()}>
          {item}
          {separator !== undefined && (
            <span className="marquee__sep" aria-hidden="true">
              {separator}
            </span>
          )}
        </li>
      ))}
    </ul>
  )
  return (
    <div
      className={`marquee marquee--${direction} ${pauseOnHover ? 'marquee--pausable' : ''} ${className}`.trim()}
      style={style}
      role={label ? 'region' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <div className="marquee__track">
        {renderTrack(false)}
        {renderTrack(true)}
      </div>
    </div>
  )
}
