import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'
const listeners = new Set<() => void>()

function current(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    current,
    () => 'dark' as Theme,
  )

  const toggle = useCallback(() => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Storage can be blocked; the theme still applies for this visit.
    }
    listeners.forEach((l) => l())
  }, [])

  return { theme, toggle }
}
