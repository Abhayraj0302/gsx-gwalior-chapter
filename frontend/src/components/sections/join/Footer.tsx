import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type FocusEvent, type MouseEvent, type ReactNode, type RefObject } from 'react'
import { footer, sections, site } from '../../../data/content'
import { getLenis } from '../../../lib/lenis'
import { scrollToSection, scrollToTop } from '../../../lib/scrollTo'
import { Logo } from '../../brand/Logo'
import { InstagramIcon, LinkedInIcon } from '../../brand/SocialIcons'
import { Button } from '../../ui/Button'
import { HorizonArc } from '../../ui/HorizonArc'
import { Magnetic } from '../../ui/Magnetic'
import { joinCopy } from './joinCopy'
import './Footer.css'

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const ramp = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))

/** Must match --footer-rise in Footer.css. */
const HORIZON_RISE = 130
/** Percent of the wordmark's line box hidden below the horizon; mirrors the offset in Footer.css. */
const HIDDEN_PCT = 22
const RISE_PCT = 14

const TAGLINE = footer.tagline
  .split('.')
  .map((s) => s.trim())
  .filter(Boolean)

type Arrival = {
  progress: MotionValue<number>
  fill: MotionValue<number>
  /** True when the footer is taller than the viewport and has to sit in flow. */
  flow: boolean
}

/**
 * Scroll progress as the page uncovers the sticky footer. useScroll({ target })
 * can't be used here: Motion reads offsetTop, which already includes the sticky
 * shift, so it would report 1 from the first frame.
 */
function useFooterArrival(ref: RefObject<HTMLElement | null>, giantRef: RefObject<HTMLDivElement | null>): Arrival {
  const { scrollY } = useScroll()
  const start = useMotionValue(Number.POSITIVE_INFINITY)
  const length = useMotionValue(1)
  const fillFrom = useMotionValue(0.3)
  const fillTo = useMotionValue(0.97)
  const [flow, setFlow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const footerH = Math.max(1, el.offsetHeight)
      const vh = window.innerHeight
      const tooTall = footerH > vh
      setFlow(tooTall)
      const curtain = !tooTall && getComputedStyle(el).getPropertyValue('--footer-curtain').trim() === '1'

      const maxScroll = document.documentElement.scrollHeight - vh
      if (maxScroll <= 0) {
        start.set(-1)
        length.set(1)
        fillFrom.set(0)
        fillTo.set(0.5)
        return
      }
      const from = Math.max(0, maxScroll - footerH)
      start.set(from)
      length.set(Math.max(1, maxScroll - from))

      // Under the curtain the wordmark is uncovered bottom-first, so the fill trails the uncovering.
      const giant = giantRef.current
      const top = giant ? giant.offsetTop : footerH
      const bottom = giant ? giant.offsetTop + giant.offsetHeight * (1 - HIDDEN_PCT / 100) : footerH
      if (curtain) {
        const uncoverStart = (footerH - bottom) / footerH
        const uncoverEnd = (footerH - top) / footerH
        fillFrom.set(Math.min(0.7, uncoverStart + 0.35 * (uncoverEnd - uncoverStart)))
        fillTo.set(0.97)
      } else {
        fillFrom.set(Math.min(0.8, top / footerH + 0.06))
        fillTo.set(0.985)
      }
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    ro.observe(el)
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure).catch(() => undefined)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [ref, giantRef, start, length, fillFrom, fillTo])

  const progress = useTransform([scrollY, start, length], ([y, s, l]: number[]) => clamp01((y - s) / l))
  const fill = useTransform([progress, fillFrom, fillTo], ([p, a, b]: number[]) => ramp(p, a, b))
  return { progress, fill, flow }
}

function ExternalRow({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <a href={href} className="footer__link" target="_blank" rel="noopener noreferrer">
      <span className="footer__link-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="footer__link-label">{children}</span>
      <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" className="footer__link-arrow" />
      <span className="sr-only"> {joinCopy.newTab}</span>
    </a>
  )
}

/** Must be the last child of #root, after <main class="page">, so the page slides up and uncovers it. */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const giantRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion() ?? false
  const { progress, fill, flow } = useFooterArrival(ref, giantRef)

  const fillClip = useTransform(fill, (v) => `inset(${((1 - v) * (100 - HIDDEN_PCT)).toFixed(2)}% 0% 0% 0%)`)
  const riseY = useTransform(fill, (v) => `${((1 - v) * RISE_PCT).toFixed(2)}%`)

  const year = new Date().getFullYear()

  const goTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    scrollToSection(id)
  }

  /** Move focus too, so the next Tab continues from the top of the page. */
  const backToTop = () => {
    scrollToTop()
    document.getElementById('top')?.focus({ preventScroll: true })
  }

  /**
   * The browser won't scroll to a focused link inside a sticky element that <main> still
   * covers, so uncover the footer on keyboard focus. Mouse clicks are left alone.
   */
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    let keyboard = true
    try {
      keyboard = e.target.matches(':focus-visible')
    } catch {
      /* :focus-visible unsupported: treat as keyboard */
    }
    if (!keyboard || progress.get() >= 1) return
    const top = document.documentElement.scrollHeight - window.innerHeight
    const lenis = getLenis()
    if (lenis && !reduce) lenis.scrollTo(top, { duration: 0.9 })
    else window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <footer ref={ref} id="site-footer" className={flow ? 'footer footer--flow' : 'footer'} onFocus={onFocus}>
      <div className="footer__dots dots-coarse" aria-hidden="true" />

      <div ref={giantRef} className="footer__giant" aria-hidden="true">
        <motion.div className="footer__giant-rise" style={reduce ? undefined : { y: riseY }}>
          <span className="footer__giant-text footer__giant-text--outline">{footer.wordmark}</span>
          <motion.span
            className="footer__giant-text footer__giant-text--solid"
            style={reduce ? undefined : { clipPath: fillClip }}
          >
            {footer.wordmark}
          </motion.span>
        </motion.div>
      </div>

      <HorizonArc className="footer__horizon" rise={HORIZON_RISE} />

      <div className="container footer__inner">
        <div className="footer__top">
          <div className="footer__col footer__brand">
            <a href="#top" className="footer__wordmark" onClick={(e) => goTo(e, 'top')}>
              <Logo size={22} title="" className="footer__mark" />
              <span className="footer__wordmark-text">{site.wordmark}</span>
            </a>
            <p className="footer__tagline">
              {TAGLINE.map((sentence) => (
                <span key={sentence} className="footer__tagline-line">
                  {sentence}
                  <span className="footer__tagline-stop">.</span>{' '}
                </span>
              ))}
            </p>
            <p className="t-small footer__line">{footer.line}</p>
          </div>

          <nav className="footer__col" aria-label={joinCopy.footerNav}>
            <h3 className="t-label footer__col-title">{footer.sectionsLabel}</h3>
            <ul className="footer__list">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="footer__link" onClick={(e) => goTo(e, s.id)}>
                    <span className="t-meta footer__num">{s.index}</span>
                    <span className="footer__link-label">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer__col">
            <h3 className="t-label footer__col-title">{footer.followLabel}</h3>
            {/* Outside <nav>, WebKit drops list semantics for list-style:none lists. */}
            <ul className="footer__list" role="list">
              <li>
                <ExternalRow href={site.links.linkedin} icon={<LinkedInIcon size={16} />}>
                  {joinCopy.linkedin}
                </ExternalRow>
              </li>
              <li>
                <ExternalRow href={site.links.instagram} icon={<InstagramIcon size={16} />}>
                  {joinCopy.instagram}
                </ExternalRow>
              </li>
            </ul>
          </div>
        </div>

        {/* Reserves the sky the wordmark rises into. */}
        <div className="footer__gap" aria-hidden="true" />

        {/* The planet body: the bottom bar sits on it, under the rim. */}
        <div className="footer__ground">
          <div className="footer__bar">
            <p className="footer__legal">{footer.copyright(year)}</p>
            <p className="t-meta footer__stamp">{footer.stamp}</p>
            <Magnetic strength={0.2} className="footer__top-magnet">
              <Button
                variant="ghost"
                className="footer__top-btn"
                onClick={backToTop}
                iconEnd={<ArrowUp size={16} strokeWidth={1.75} aria-hidden="true" />}
              >
                {footer.backToTop}
              </Button>
            </Magnetic>
          </div>
        </div>
      </div>
    </footer>
  )
}
