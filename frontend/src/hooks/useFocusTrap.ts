import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Traps Tab inside `ref` while active and restores the previous focus afterwards. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape?: () => void) {
  useEffect(() => {
    if (!active) return
    const root = ref.current
    if (!root) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement)
    const first = focusables()[0]
    // Defer so the open animation has mounted the content.
    const raf = window.requestAnimationFrame(() => first?.focus({ preventScroll: true }))

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus({ preventScroll: true })
    }
  }, [ref, active, onEscape])
}
