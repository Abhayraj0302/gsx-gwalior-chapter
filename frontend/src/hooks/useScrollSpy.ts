import { useEffect, useState } from 'react'

/** Height of the activation band as a percentage of the viewport. */
const BAND_PCT = 5

/**
 * Uses a thin IntersectionObserver band instead of a scroll listener, so it
 * never forces layout. When nothing overlaps the band the previous id is kept.
 */
export function useScrollSpy(ids: readonly string[], activationRatio = 0.4): string {
  const [active, setActive] = useState<string>(ids[0] ?? '')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const top = Math.round(activationRatio * 100)
    const bottom = Math.max(0, 100 - top - BAND_PCT)
    const inBand = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id)
          else inBand.delete(entry.target.id)
        }
        let next: string | undefined
        for (const id of ids) if (inBand.has(id)) next = id
        if (next !== undefined) setActive(next)
      },
      { rootMargin: `-${top}% 0px -${bottom}% 0px`, threshold: 0 },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids, activationRatio])

  return active
}
