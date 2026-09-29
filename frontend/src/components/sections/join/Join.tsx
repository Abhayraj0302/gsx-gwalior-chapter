import { motion, useReducedMotion, type Variants } from 'motion/react'
import { join, sections } from '../../../data/content'
import { EASE_OUT, SEEN_ABOVE } from '../../../lib/motion'
import { Section } from '../../ui/Section'
import { SectionLabel } from '../../ui/SectionLabel'
import { WordReveal } from '../../ui/WordReveal'
import { JoinSteps } from './JoinSteps'
import { MembershipStub } from './MembershipStub'
import '../../ui/Card.css'
import './Join.css'

const meta = sections.find((s) => s.id === 'join')

/** Puts the last word of the heading on its own line. */
const HEADING = join.heading.replace(' the ', ' the\n')
const LAST_WORD = HEADING.split(/\s+/).filter(Boolean).length - 1

const WORD_STAGGER = 0.07
const WORD_DUR = 0.8
const WIPE_DUR = 0.6

export function Join() {
  const reduce = useReducedMotion() ?? false

  const wipe: Variants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { clipPath: 'inset(0 100% 0 0)' },
        show: { clipPath: 'inset(0 0% 0 0)', transition: { duration: WIPE_DUR, ease: EASE_OUT } },
      }

  return (
    <Section id="join" labelledBy="join-title" className="join">
      <div className="container">
        <SectionLabel index={meta?.index ?? '04'} label={meta?.ruleLabel ?? join.heading} />

        <div className="grid-12 join__grid">
          <div className="join__lead">
            <WordReveal
              as="h2"
              id="join-title"
              className="t-h1 join__title"
              text={HEADING}
              stagger={WORD_STAGGER}
              duration={WORD_DUR}
              wordSuffix={(_word, i) =>
                i === LAST_WORD ? (
                  <span className="join__stop" aria-hidden="true">
                    .
                  </span>
                ) : null
              }
            />

            <JoinSteps />

            {/* whileInView never fires on a fully clipped element, so the wipe runs on the child. */}
            <motion.p
              className="join__closing"
              initial={reduce ? false : 'hidden'}
              whileInView="show"
              viewport={{ once: true, amount: 0.8, margin: SEEN_ABOVE }}
            >
              <motion.span className="t-label join__closing-text" variants={wipe}>
                {join.closingLine}
              </motion.span>
            </motion.p>
          </div>

          <div className="join__stub">
            <MembershipStub />
          </div>
        </div>
      </div>
    </Section>
  )
}
