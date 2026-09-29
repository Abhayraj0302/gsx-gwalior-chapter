import type { MouseEvent } from 'react'
import { sections, type SectionId } from '../../../data/content'
import { scrollToSection } from '../../../lib/scrollTo'
import { cx } from '../../../lib/cx'
import './SectionMap.css'

const MAP_LABEL = 'Section map'

type SectionMapProps = {
  className?: string
}

export function SectionMap({ className }: SectionMapProps) {
  const jump = (id: SectionId) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection(id)
  }

  return (
    <nav className={cx('section-map', className)} aria-label={MAP_LABEL}>
      <ul className="section-map__list">
        {sections.map((s) => (
          <li key={s.id} className="section-map__item">
            <a className="section-map__link t-label" href={`#${s.id}`} onClick={jump(s.id)}>
              <span className="section-map__num">{s.index}</span>
              <span className="section-map__label">{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
