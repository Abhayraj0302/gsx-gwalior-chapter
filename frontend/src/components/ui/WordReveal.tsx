import { motion, useReducedMotion } from 'motion/react'
import { useMemo, type ElementType, type ReactNode } from 'react'
import { EASE_OUT } from '../../lib/motion'
import { cx } from '../../lib/cx'
import './WordReveal.css'

type WordRevealProps = {
  /** The sentence. Words are split on spaces; use `\n` for a forced line break. */
  text: string
  as?: ElementType
  id?: string
  className?: string
  /** Seconds before the first word starts. */
  delay?: number
  /** Seconds between words. */
  stagger?: number
  /** Seconds each word takes to rise. */
  duration?: number
  /** Extra class for specific words, e.g. to colour the last word. */
  wordClassName?: (word: string, index: number) => string | undefined
  /** Node appended after a specific word (e.g. an underline). */
  wordSuffix?: (word: string, index: number) => ReactNode
  /** When set, plays when this turns true instead of on scroll into view. */
  play?: boolean
  amount?: number
}

/**
 * Animates words rather than measured lines so resizing never breaks it. Screen
 * readers get the sentence once; the animated words are aria-hidden. The observer
 * watches the unclipped wrapper because clipped elements never report as in view.
 */
export function WordReveal({
  text,
  as,
  id,
  className,
  delay = 0,
  stagger = 0.045,
  duration = 0.7,
  wordClassName,
  wordSuffix,
  play,
  amount = 0.4,
}: WordRevealProps) {
  const reduce = useReducedMotion()
  const Tag = (as ?? 'p') as unknown as 'p'
  const MotionTag = useMemo(() => motion.create(Tag), [Tag])
  const lines = useMemo(() => text.split('\n').map((line) => line.split(' ').filter(Boolean)), [text])

  if (reduce) {
    let i = -1
    return (
      <Tag id={id} className={cx('wr', className)}>
        {lines.map((words, li) => (
          <span key={li} className="wr__line">
            {words.map((word) => {
              i += 1
              return (
                <span key={`${word}-${i}`} className={cx('wr__word', wordClassName?.(word, i))}>
                  {word}
                  {wordSuffix?.(word, i)}{' '}
                </span>
              )
            })}
          </span>
        ))}
      </Tag>
    )
  }

  const controlled = play !== undefined
  let index = -1
  return (
    <MotionTag
      id={id}
      className={cx('wr', className)}
      initial="hidden"
      {...(controlled
        ? { animate: play ? 'show' : 'hidden' }
        : { whileInView: 'show', viewport: { once: true, amount, margin: '300% 0px -6% 0px' } })}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      <span className="sr-only">{text.replace(/\n/g, ' ')}</span>
      <span aria-hidden="true">
        {lines.map((words, li) => (
          <span key={li} className="wr__line">
            {words.map((word) => {
              index += 1
              const i = index
              return (
                <span key={`${word}-${i}`} className="wr__slot">
                  <motion.span
                    className={cx('wr__word', wordClassName?.(word, i))}
                    variants={{
                      hidden: { y: '108%', rotate: 4 },
                      show: { y: '0%', rotate: 0, transition: { duration, ease: EASE_OUT } },
                    }}
                  >
                    {word}
                    {wordSuffix?.(word, i)}
                  </motion.span>{' '}
                </span>
              )
            })}
          </span>
        ))}
      </span>
    </MotionTag>
  )
}
