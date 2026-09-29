import { getLenis } from './lenis'

const prefersReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Current nav height in px (reads the --nav-h token so CSS stays the source of truth). */
function navOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : 64
}

/** Also moves focus to the section so keyboard and screen-reader users land there. */
export function scrollToSection(id: string, options: { updateHash?: boolean } = {}) {
  const { updateHash = true } = options
  const el = document.getElementById(id)
  if (!el) return
  const reduce = prefersReduced()
  const lenis = getLenis()
  if (lenis && !reduce) {
    lenis.scrollTo(el, { offset: id === 'top' ? 0 : -navOffset() + 1, duration: 1.2 })
  } else {
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }
  if (updateHash) history.replaceState(null, '', `#${id}`)
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

export function scrollToTop() {
  const reduce = prefersReduced()
  const lenis = getLenis()
  if (lenis && !reduce) lenis.scrollTo(0, { duration: 1.4 })
  else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  history.replaceState(null, '', window.location.pathname)
}
