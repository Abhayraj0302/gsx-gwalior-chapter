import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type AppReadyValue = {
  /** True once the preloader starts to lift or is skipped. */
  ready: boolean
  markReady: () => void
}

const AppReadyContext = createContext<AppReadyValue>({ ready: true, markReady: () => {} })

export function AppReadyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])
  const value = useMemo(() => ({ ready, markReady }), [ready, markReady])
  return <AppReadyContext.Provider value={value}>{children}</AppReadyContext.Provider>
}

export function useAppReady(): boolean {
  return useContext(AppReadyContext).ready
}

export function useMarkReady(): () => void {
  return useContext(AppReadyContext).markReady
}
