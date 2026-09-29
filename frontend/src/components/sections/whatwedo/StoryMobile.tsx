import type { CSSProperties } from 'react'
import { pillars, whatWeDo } from '../../../data/content'
import { Reveal } from '../../ui/Reveal'
import { PillarCard } from './PillarCard'
import './StoryMobile.css'

const COUNT = pillars.length
const TOTAL = String(COUNT).padStart(2, '0')

// Each block's sticky heading is pushed out by the next one, so the verb swap needs no JS.
export function StoryMobile() {
  return (
    <div className="story-m">
      {pillars.map((pillar, i) => (
        <div key={pillar.id} className="story-m__block">
          <div className="story-m__head" style={{ '--story-m-progress': (i + 1) / COUNT } as CSSProperties}>
            <p className="story-m__you t-label">{whatWeDo.storyPrefix}</p>
            <p className="story-m__verbs t-h2">
              {pillar.verbs.map((verb, v) => (
                <span key={verb} className="story-m__verb">
                  {verb.endsWith('.') ? (
                    <>
                      {verb.slice(0, -1)}
                      <span className="story-m__stop">.</span>
                    </>
                  ) : (
                    verb
                  )}
                  {v < pillar.verbs.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
            <span className="story-m__count t-meta">
              <span className="story-m__now">{pillar.index}</span> / {TOTAL}
            </span>
          </div>

          <Reveal className="story-m__card" kind="fade-up" duration={0.6} amount={0.2}>
            <PillarCard pillar={pillar} index={i} />
          </Reveal>
        </div>
      ))}
    </div>
  )
}
