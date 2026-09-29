import { sections, whatWeDo } from '../../../data/content'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { Reveal } from '../../ui/Reveal'
import { Section } from '../../ui/Section'
import { SectionLabel } from '../../ui/SectionLabel'
import { WordReveal } from '../../ui/WordReveal'
import { StoryDesktop } from './StoryDesktop'
import { StoryMobile } from './StoryMobile'
import './WhatWeDo.css'

const meta = sections.find((s) => s.id === 'whatwedo')

const TITLE = `${whatWeDo.heading}\n${whatWeDo.headingAccent}`
const accentWord = (word: string) => (word === whatWeDo.headingAccent ? 'wwd__accent' : undefined)

export function WhatWeDo() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <Section id="whatwedo" labelledBy="wwd-title" className="wwd">
      <div className="container">
        <SectionLabel index={meta?.index ?? '02'} label={meta?.ruleLabel ?? 'What we do'} />

        <div className="wwd__header grid-12">
          <WordReveal
            as="h2"
            id="wwd-title"
            className="wwd__title t-h1"
            text={TITLE}
            wordClassName={accentWord}
            stagger={0.07}
            duration={0.75}
          />
          <Reveal as="p" className="wwd__subtitle t-lead" kind="fade" duration={0.6} delay={0.4}>
            {whatWeDo.subtitle}
          </Reveal>
        </div>

        {isDesktop ? <StoryDesktop /> : <StoryMobile />}
      </div>
    </Section>
  )
}
