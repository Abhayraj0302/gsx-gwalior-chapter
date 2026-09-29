import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from 'motion/react'
import { useRef, useState, type CSSProperties, type Ref } from 'react'
import { pillars, whatWeDo } from '../../../data/content'
import { cx } from '../../../lib/cx'
import { DUR, makeVariants, SEEN_ABOVE, tween } from '../../../lib/motion'
import { Tilt } from '../../ui/Tilt'
import { PillarCard } from './PillarCard'
import { VerbRail } from './VerbRail'
import './StoryDesktop.css'

const VERBS = whatWeDo.verbs
const TOTAL = VERBS.length
const LAST = TOTAL - 1
const CARDS = pillars.length
const VERB_TO_PILLAR: readonly number[] = whatWeDo.verbToPillar

// Scroll progress where each card becomes active, and how far the thread is drawn at that point.
const CARD_STARTS = pillars.map((_, k) => Math.max(0, VERB_TO_PILLAR.indexOf(k)) / TOTAL)
const THREAD_STOPS = pillars.map((_, k) => (CARDS > 1 ? k / (CARDS - 1) : 1))

const HAZE_FROM = 0.18
const HAZE_TO = 1

// Direction flips when scrolling back up.
const VERB_SWAP: Variants = {
  enter: (dir: number) => ({ y: dir >= 0 ? '100%' : '-100%' }),
  rest: { y: '0%' },
  exit: (dir: number) => ({ y: dir >= 0 ? '-100%' : '100%' }),
}
const VERB_TRANSITION = tween(0.32)

const STACK_STYLE = { '--story-cards': CARDS } as CSSProperties

// With reduced motion we render a static list so nothing subscribes to scroll.
export function StoryDesktop() {
  const reduced = useReducedMotion() === true
  return reduced ? <StoryStatic /> : <StoryLive />
}

function StoryLive() {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [{ index, dir }, setStep] = useState({ index: 0, dir: 1 })

  // The track spans exactly the stretch where the stage is pinned (see StoryDesktop.css).
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 0.5', 'end 0.5'] })
  const railFill = useTransform(scrollYProgress, (p) => Math.min(1, Math.max(0, (p * TOTAL) / LAST)))
  const threadDrawn = useTransform(scrollYProgress, CARD_STARTS, THREAD_STOPS)
  const hazeOpacity = useTransform(scrollYProgress, [0, 1], [HAZE_FROM, HAZE_TO])

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(LAST, Math.max(0, Math.floor(p * TOTAL)))
    setStep((s) => (s.index === next ? s : { index: next, dir: next > s.index ? 1 : -1 }))
  })

  // No card is active until the stack scrolls into view, so the first one animates on arrival.
  const armed = useInView(cardsRef, { once: true, amount: 0.12, margin: SEEN_ABOVE })

  const verb = VERBS[index]
  const activeCard = armed ? VERB_TO_PILLAR[index] : -1
  const pillar = pillars[VERB_TO_PILLAR[index]]

  return (
    <div className="story grid-12">
      <div ref={trackRef} className="story__track" aria-hidden="true" />

      <div className="story__stage">
        {/* Screen readers get the whole sentence once; the animated verbs are hidden. */}
        <p className="sr-only">{`${whatWeDo.storyPrefix} ${VERBS.join(' ')}`}</p>

        <div className="story__lit">
          <div className="story__copy" aria-hidden="true">
            <span className="story__you t-h2">{whatWeDo.storyPrefix}</span>
            <span className="story__slot t-verb">
              <AnimatePresence initial={false} custom={dir}>
                <motion.span
                  key={verb}
                  className="story__verb"
                  custom={dir}
                  variants={VERB_SWAP}
                  initial="enter"
                  animate="rest"
                  exit="exit"
                  transition={VERB_TRANSITION}
                >
                  <VerbText verb={verb} />
                </motion.span>
              </AnimatePresence>
            </span>
          </div>

          <motion.div className="story__haze" style={{ opacity: hazeOpacity }} aria-hidden="true" />
        </div>

        <VerbRail
          className="story__rail"
          step={index + 1}
          total={TOTAL}
          label={whatWeDo.stepLabel}
          progress={railFill}
          aside={
            pillar ? (
              <motion.span
                key={pillar.id}
                className="story__into"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={tween(DUR.med)}
              >
                <span className="story__into-num">{pillar.index}</span>
                {pillar.title}
              </motion.span>
            ) : null
          }
        />
      </div>

      <PillarStack ref={cardsRef} activeCard={activeCard} drawn={threadDrawn} />
    </div>
  )
}

function VerbText({ verb }: { verb: string }) {
  if (!verb.endsWith('.')) return <>{verb}</>
  return (
    <>
      {verb.slice(0, -1)}
      <span className="story__stop">.</span>
    </>
  )
}

function StoryStatic() {
  const lastCard = VERB_TO_PILLAR[LAST]
  const pillar = pillars[lastCard]

  return (
    <div className="story story--static grid-12">
      <div className="story__stage story__stage--static">
        <div className="story__lit">
          <p className="story__static">
            <span className="story__you t-h2">{whatWeDo.storyPrefix}</span>{' '}
            <span className="story__list t-verb">
              {VERBS.map((v, i) => (
                <span key={v} className="story__word">
                  <VerbText verb={v} />
                  {i < LAST ? ' ' : ''}
                </span>
              ))}
            </span>
          </p>

          <div className="story__haze" style={{ opacity: HAZE_TO }} aria-hidden="true" />
        </div>

        <VerbRail
          className="story__rail"
          step={TOTAL}
          total={TOTAL}
          label={whatWeDo.stepLabel}
          progress={1}
          aside={
            pillar ? (
              <span className="story__into">
                <span className="story__into-num">{pillar.index}</span>
                {pillar.title}
              </span>
            ) : null
          }
        />
      </div>

      <PillarStack activeCard={lastCard} drawn={1} reduced />
    </div>
  )
}

type PillarStackProps = {
  ref?: Ref<HTMLDivElement>
  activeCard: number
  /** 0–1, how much of the gutter thread is drawn. */
  drawn: MotionValue<number> | number
  reduced?: boolean
}

function PillarStack({ ref, activeCard, drawn, reduced = false }: PillarStackProps) {
  const item = makeVariants(reduced, 'fade-up', 28)

  return (
    <div ref={ref} className="story__cards" style={STACK_STYLE}>
      <span className="story__thread" aria-hidden="true">
        <motion.span className="story__thread-fill" style={{ scaleY: drawn }} />
      </span>

      {pillars.map((pillar, i) => {
        const active = i === activeCard
        const state = active ? 'active' : i < activeCard ? 'passed' : 'ahead'
        return (
          <motion.div
            key={pillar.id}
            className="story__item"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2, margin: '300% 0px -6% 0px' }}
            variants={item}
            transition={tween(reduced ? 0 : 0.6)}
          >
            <span className="story__mark" data-state={state} aria-hidden="true">
              ×
            </span>
            <div className={cx('story__lift', active && 'story__lift--active')}>
              <Tilt className="story__tilt" max={4} spotlight>
                <PillarCard pillar={pillar} index={i} active={active} />
              </Tilt>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
