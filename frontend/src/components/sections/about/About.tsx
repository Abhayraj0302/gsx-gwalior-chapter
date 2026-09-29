import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react'
import { about, sections, site } from '../../../data/content'
import { EASE_IN_OUT, EASE_OUT } from '../../../lib/motion'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { cx } from '../../../lib/cx'
import { Section } from '../../ui/Section'
import { SectionLabel } from '../../ui/SectionLabel'
import { WordReveal } from '../../ui/WordReveal'
import { Stats } from './Stats'
import { Features } from './Features'
import './About.css'

const meta = sections.find((s) => s.id === 'about') ?? sections[0]

// Force the line break after "the".
const HEADING = `${about.headingLead} ${about.headingWord}`.replace(' the ', ' the\n')

// Seconds.
const WORD_STAGGER = 0.07
const WORD_DUR = 0.8
const UNDERLINE_DELAY = 0.58
const UNDERLINE_DUR = 0.35

const WIPE_DUR = 1.1
const WIPE_DELAY = 0.2

const DRIFT = 40 // px

export function About() {
  const reduce = useReducedMotion() ?? false
  const wide = useMediaQuery('(min-width: 1280px)')

  const wipe: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0.2 },
        show: {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          transition: {
            clipPath: { duration: WIPE_DUR, delay: WIPE_DELAY, ease: EASE_IN_OUT },
            opacity: { duration: WIPE_DUR * 0.6, delay: WIPE_DELAY, ease: EASE_OUT },
          },
        },
      }

  const isLastWord = (word: string) => word === about.headingWord

  return (
    <Section id="about" labelledBy="about-title" className="about">
      {wide && (reduce ? <HalftoneStill /> : <HalftoneDrift />)}

      <div className="container about__inner">
        <SectionLabel index={meta.index} label={meta.ruleLabel} />

        <div className="grid-12 about__grid">
          <WordReveal
            as="h2"
            id="about-title"
            className="t-h1 about__title"
            text={HEADING}
            stagger={WORD_STAGGER}
            duration={WORD_DUR}
            wordClassName={(word) => (isLastWord(word) ? 'about__word' : undefined)}
            wordSuffix={(word) => (isLastWord(word) ? <Underline reduce={reduce} /> : null)}
          />

          {/* whileInView never fires on a fully clipped element, so the clip goes on the child. */}
          <motion.div
            className="about__copy"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25, margin: '300% 0px -6% 0px' }}
          >
            <motion.div className="about__columns" variants={wipe}>
              {about.paragraphs.map((text, i) => (
                <p
                  key={text.slice(0, 24)}
                  className={cx('about__para', i === 0 ? 't-lead about__para--lead' : 't-body about__para--col')}
                >
                  {i === 0 ? <RunIn text={text} /> : text}
                </p>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <Stats className="about__ledger" />
        <Features className="about__features" />
      </div>
    </Section>
  )
}

function RunIn({ text }: { text: string }) {
  if (!text.startsWith(site.shortName)) return <>{text}</>
  return (
    <>
      <strong className="about__runin">{site.shortName}</strong>
      {text.slice(site.shortName.length)}
    </>
  )
}

// Inherits hidden/show from the word it sits under.
function Underline({ reduce }: { reduce: boolean }) {
  if (reduce) return <span className="about__underline" aria-hidden="true" />
  return (
    <motion.span
      className="about__underline"
      aria-hidden="true"
      variants={{
        hidden: { scaleX: 0 },
        show: { scaleX: 1, transition: { duration: UNDERLINE_DUR, delay: UNDERLINE_DELAY, ease: EASE_OUT } },
      }}
    />
  )
}

function HalftoneStill() {
  return (
    <div className="about__gutter" aria-hidden="true">
      <div className="about__dots dots-coarse" />
    </div>
  )
}

function HalftoneDrift() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [DRIFT, -DRIFT])

  return (
    <div ref={ref} className="about__gutter" aria-hidden="true">
      <motion.div className="about__dots dots-coarse" style={{ y }} />
    </div>
  )
}
