import { useEffect } from 'react'
import { getLenis } from '../lib/lenis'

/** Locks page scroll while `locked` (also pauses the smooth scroller), compensating for the scrollbar so nothing shifts. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const html = document.documentElement
    const scrollbar = window.innerWidth - html.clientWidth
    const prevOverflow = html.style.overflow
    const prevPadding = html.style.paddingRight
    html.style.overflow = 'hidden'
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`
    getLenis()?.stop()
    return () => {
      html.style.overflow = prevOverflow
      html.style.paddingRight = prevPadding
      getLenis()?.start()
    }
  }, [locked])
}
