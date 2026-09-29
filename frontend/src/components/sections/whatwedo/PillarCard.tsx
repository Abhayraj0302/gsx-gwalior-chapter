import { Handshake, Rocket, Terminal, Users } from 'lucide-react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { Pillar } from '../../../data/content'
import { cx } from '../../../lib/cx'
import { Chip } from '../../ui/Chip'
import { ClayTile } from '../../ui/ClayTile'
import '../../ui/Card.css'
import './PillarCard.css'

const ICONS = {
  terminal: Terminal,
  rocket: Rocket,
  users: Users,
  handshake: Handshake,
} as const satisfies Record<Pillar['icon'], unknown>

// A velocity kick on a spring that rests at 0deg, so the tile swings out and settles.
const KICK = { type: 'spring', stiffness: 260, damping: 14, mass: 1, velocity: 330 } as const
// Used when the card loses focus mid-swing: settle without another kick.
const REST = { type: 'spring', stiffness: 260, damping: 28, mass: 1 } as const

export type PillarCardProps = {
  pillar: Pillar
  index: number
  /** Desktop only: the card the current verb belongs to. */
  active?: boolean
  className?: string
}

// Entrance, lift and tilt belong to the parent; the card only animates its tile when `active` changes.
export function PillarCard({ pillar, index, active = false, className }: PillarCardProps) {
  const Icon = ICONS[pillar.icon]
  const titleId = `pillar-${index + 1}-title`
  const reduced = useReducedMotion() === true
  const rotate = useMotionValue(0)
  const wasActive = useRef(active)

  useEffect(() => {
    // Skip the first run so nothing plays on mount.
    if (wasActive.current === active) return
    wasActive.current = active
    if (reduced) return
    const controls = animate(rotate, 0, active ? KICK : REST)
    return () => controls.stop()
  }, [active, reduced, rotate])

  return (
    <article
      className={cx('card', 'pillar', active && 'card--active pillar--active', className)}
      aria-labelledby={titleId}
      data-active={active ? '' : undefined}
    >
      <div className="pillar__head">
        <motion.span className="pillar__tile" style={{ rotate }}>
          <ClayTile>
            <Icon aria-hidden="true" />
          </ClayTile>
        </motion.span>
        <span className="pillar__num t-label">{pillar.index}</span>
      </div>

      <h3 id={titleId} className="pillar__title t-h3">
        {pillar.title}
      </h3>

      <p className="pillar__desc t-small">{pillar.description}</p>

      <ul className="pillar__tags" role="list">
        {pillar.tags.map((tag) => (
          <li key={tag} className="pillar__tag">
            <Chip>{tag}</Chip>
          </li>
        ))}
      </ul>
    </article>
  )
}
