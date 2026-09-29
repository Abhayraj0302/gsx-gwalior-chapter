import { cx } from '../../lib/cx'
import './HorizonArc.css'

type HorizonArcProps = {
  className?: string
  /** How much of the planet rises above the bottom edge, in px (desktop). */
  rise?: number
}

/** Decorative planet horizon. Place inside a `position: relative; overflow: clip` parent. */
export function HorizonArc({ className, rise = 110 }: HorizonArcProps) {
  return (
    <div className={cx('horizon', className)} style={{ ['--horizon-rise' as string]: `${rise}px` }} aria-hidden="true">
      <div className="horizon__glow" />
      <div className="horizon__planet" />
    </div>
  )
}
