import type Lenis from 'lenis'

/** Module-level handle so non-React helpers (scrollTo, scroll lock) can reach the smooth scroller. */
let instance: Lenis | null = null

export function setLenis(lenis: Lenis | null) {
  instance = lenis
}

export function getLenis(): Lenis | null {
  return instance
}
