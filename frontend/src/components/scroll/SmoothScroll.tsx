import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'
import { useCanHover, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { setLenis } from '../../lib/lenis'

// Touch devices and reduced-motion users keep native scrolling.
export function SmoothScroll() {
  const reduce = usePrefersReducedMotion()
  const finePointer = useCanHover()

  useEffect(() => {
    if (reduce || !finePointer) return
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
    })
    setLenis(lenis)
    return () => {
      setLenis(null)
      lenis.destroy()
    }
  }, [reduce, finePointer])

  return null
}
