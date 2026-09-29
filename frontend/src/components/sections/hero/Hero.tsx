import { useRef, type MouseEvent } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { hero, type SectionId } from '../../../data/content'
import { useAppReady } from '../../../context/AppReady'
import { EASE_OUT } from '../../../lib/motion'
import { scrollToSection } from '../../../lib/scrollTo'
import { Section } from '../../ui/Section'
import { Button } from '../../ui/Button'
import { HorizonArc } from '../../ui/HorizonArc'
import { Magnetic } from '../../ui/Magnetic'
import { WordReveal } from '../../ui/WordReveal'
import { HeroSceneLazy } from '../../three/HeroSceneLazy'
import { DecodeText } from './DecodeText'
import { NextUpStub } from './NextUpStub'
import { SectionMap } from './SectionMap'
import './Hero.css'

// Load timings in seconds from when the preloader lifts, unless marked ms.
const T = {
  rule: { at: 0, d: 0.3 },
  top: { at: 0.1, d: 0.5 },
  bottom: { at: 0.18, d: 0.5 },
  decodeAt: 160, // ms
  decode: 700, // ms
  meta: { at: 0.42, d: 0.35 },
  lead: { at: 0.5, d: 0.5, stagger: 0.02 },
  cta: { at: 0.66, d: 0.45, stagger: 0.07 },
  row: { at: 0.8, d: 0.45 },
} as const

// Keep in sync with --hero-arc in Hero.css.
const ARC_RISE = 156

const still: Variants = { hidden: {}, show: {} }
const at = (delay: number, duration: number) => ({ delay, duration, ease: EASE_OUT })

function buildVariants(reduce: boolean) {
  if (reduce) {
    return { label: still, rule: still, top: still, bottom: still, meta: still, cta: still, row: still }
  }
  const rise = (delay: number, duration: number): Variants => ({
    hidden: { y: '104%' },
    show: { y: '0%', transition: at(delay, duration) },
  })
  return {
    label: { hidden: { opacity: 0 }, show: { opacity: 1, transition: at(T.rule.at, T.rule.d) } },
    rule: { hidden: { scaleX: 0 }, show: { scaleX: 1, transition: at(T.rule.at, T.rule.d) } },
    top: rise(T.top.at, T.top.d),
    bottom: rise(T.bottom.at, T.bottom.d),
    meta: {
      hidden: { clipPath: 'inset(0% 100% 0% 0%)' },
      show: { clipPath: 'inset(0% 0% 0% 0%)', transition: at(T.meta.at, T.meta.d) },
    },
    cta: {
      hidden: { opacity: 0, y: 14 },
      show: (i: number) => ({ opacity: 1, y: 0, transition: at(T.cta.at + i * T.cta.stagger, T.cta.d) }),
    },
    row: {
      hidden: { clipPath: 'inset(0% 100% 0% 0%)' },
      show: { clipPath: 'inset(0% 0% 0% 0%)', transition: at(T.row.at, T.row.d) },
    },
  } satisfies Record<string, Variants>
}

export function Hero() {
  const reduce = useReducedMotion() === true
  const ready = useAppReady()
  const state = ready ? 'show' : 'hidden'
  const v = buildVariants(reduce)

  const boxRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: boxRef, offset: ['start start', 'end start'] })
  const exitY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const exitOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35])

  const jump = (id: SectionId) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection(id)
  }

  return (
    <Section id="top" labelledBy="hero-title" flush className="hero">
      <div ref={boxRef} className="hero__layers" aria-hidden="true">
        <div className="hero__dots hero__dots--fine dots-fine" />
        <div className="hero__dots hero__dots--coarse dots-coarse" />
        <HorizonArc className="hero__arc" rise={ARC_RISE} />
      </div>
      <HeroSceneLazy className="hero__scene" />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__inner container grid-12">
        <div className="hero__content">
          <motion.div className="hero__plate" style={reduce ? undefined : { y: exitY, opacity: exitOpacity }}>
            {/* Not SectionLabel: this one is timed to the preloader, not to scroll. */}
            <div className="hero-index">
              <motion.span className="hero-index__label t-label" variants={v.label} initial="hidden" animate={state}>
                <span aria-hidden="true">[ </span>
                <span className="num">{hero.indexLine.index}</span>
                <span aria-hidden="true"> — </span>
                <span className="hero-index__text">{hero.indexLine.label}</span>
                <span aria-hidden="true"> ]</span>
              </motion.span>
              <motion.span
                className="hero-index__line rule"
                aria-hidden="true"
                variants={v.rule}
                initial="hidden"
                animate={state}
              />
            </div>

            <h1 id="hero-title" className="hero__title">
              <span className="sr-only">{hero.srTitle}</span>
              <span className="hero__nameplate" aria-hidden="true">
                <span className="hero__slot">
                  <motion.span
                    className="hero__rise hero__title-top t-display-sm"
                    variants={v.top}
                    initial="hidden"
                    animate={state}
                  >
                    {hero.titleTop}
                  </motion.span>
                </span>
                <span className="hero__slot">
                  <motion.span className="hero__rise" variants={v.bottom} initial="hidden" animate={state}>
                    <DecodeText
                      text={hero.titleBottom}
                      play={ready}
                      delay={T.decodeAt}
                      duration={T.decode}
                      className="hero__title-bottom t-display"
                    />
                  </motion.span>
                </span>
              </span>
            </h1>
          </motion.div>

          <div className="hero__body">
            <motion.p className="hero__meta t-meta" variants={v.meta} initial="hidden" animate={state}>
              {hero.metaLine}
            </motion.p>
            {reduce ? (
              /* WordReveal's static output collapses the spaces between its
                 inline-block words. */
              <p className="hero__lead t-lead">{hero.lead}</p>
            ) : (
              <WordReveal
                as="p"
                className="hero__lead t-lead"
                text={hero.lead}
                play={ready}
                delay={T.lead.at}
                stagger={T.lead.stagger}
                duration={T.lead.d}
              />
            )}
            <div className="hero__ctas">
              <motion.div className="hero__cta-cell" variants={v.cta} custom={0} initial="hidden" animate={state}>
                <Magnetic className="hero__cta-wrap" strength={0.24}>
                  <Button
                    href={`#${hero.primaryCta.target}`}
                    className="hero__cta hero__cta--primary"
                    iconEnd={<ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />}
                    onClick={jump(hero.primaryCta.target)}
                  >
                    {hero.primaryCta.label}
                  </Button>
                </Magnetic>
              </motion.div>
              <motion.div className="hero__cta-cell" variants={v.cta} custom={1} initial="hidden" animate={state}>
                <Button
                  variant="secondary"
                  href={`#${hero.secondaryCta.target}`}
                  className="hero__cta hero__cta--secondary"
                  onClick={jump(hero.secondaryCta.target)}
                >
                  {hero.secondaryCta.label}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="hero__horizon">
          <motion.div className="hero__horizon-row" variants={v.row} initial="hidden" animate={state}>
            <NextUpStub className="hero__nextup" />
            <SectionMap className="hero__map" />
          </motion.div>
        </div>
      </div>
    </Section>
  )
}
