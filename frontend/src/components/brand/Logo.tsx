import type { CSSProperties, SVGProps } from 'react'
import { cx } from '../../lib/cx'
import { LOGO_LOBES } from './lobes'
import './Logo.css'

type LogoProps = SVGProps<SVGSVGElement> & {
  size?: number
  /** Accessible name. Pass an empty string for a purely decorative instance. */
  title?: string
  /** Renders each lobe as `.logo__lobe` with `--lobe-i`, `--lobe-x` and `--lobe-y` so CSS can animate them. */
  lobes?: boolean
}

export function Logo({ size = 24, title = 'GSX Gwalior', lobes = false, className, ...rest }: LogoProps) {
  const decorative = title === ''
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      focusable="false"
      className={cx('logo', lobes && 'logo--lobes', className) || undefined}
      {...rest}
    >
      {LOGO_LOBES.map((lobe, i) =>
        lobes ? (
          <path
            key={lobe.key}
            d={lobe.d}
            className={`logo__lobe logo__lobe--${lobe.key}`}
            style={{ '--lobe-i': i, '--lobe-x': lobe.x, '--lobe-y': lobe.y } as CSSProperties}
          />
        ) : (
          <path key={lobe.key} d={lobe.d} />
        ),
      )}
    </svg>
  )
}
