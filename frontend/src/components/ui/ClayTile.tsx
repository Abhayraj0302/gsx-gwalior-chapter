import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'
import './ClayTile.css'

type ClayTileProps = {
  children: ReactNode
  className?: string
  /** `md` 44px (default), `lg` 56px. Both step down one notch on small screens. */
  size?: 'md' | 'lg'
}

/** Decorative glossy block holding a lucide icon. */
export function ClayTile({ children, className, size = 'md' }: ClayTileProps) {
  return (
    <span className={cx('clay-tile', size === 'lg' && 'clay-tile--lg', className)} aria-hidden="true">
      <span className="clay-tile__face">{children}</span>
    </span>
  )
}
