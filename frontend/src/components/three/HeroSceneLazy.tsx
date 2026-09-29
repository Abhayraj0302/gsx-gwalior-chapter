import { useInView, useReducedMotion } from 'motion/react'
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAppReady } from '../../context/AppReady'
import { cx } from '../../lib/cx'

const HeroScene = lazy(() => import('./HeroScene'))

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// If three.js fails at runtime the hero just shows without the 3D layer.
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// three.js is a separate chunk, requested once the browser is idle and only if WebGL works.
export function HeroSceneLazy({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.05 })
  const ready = useAppReady()
  const reduced = useReducedMotion() === true
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!supportsWebGL()) return
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout
    const id = idle(() => setEnabled(true))
    return () => cancel(id as number)
  }, [])

  return (
    <div ref={ref} className={cx('hero-scene-wrap', className)} aria-hidden="true">
      {enabled && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <HeroScene ready={ready} active={inView} reduced={reduced} />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  )
}
