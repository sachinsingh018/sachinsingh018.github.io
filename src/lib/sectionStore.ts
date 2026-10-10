import { useSyncExternalStore } from 'react'
import type { SectionId } from '../content/site'

/**
 * Tiny external store for which section is on screen. The hero graph reads it
 * every frame through `getActiveSection()` without causing React renders.
 */
export type ActiveSection = SectionId | 'hero'

let active: ActiveSection = 'hero'
const listeners = new Set<() => void>()

export function getActiveSection(): ActiveSection {
  return active
}

export function setActiveSection(next: ActiveSection) {
  if (next === active) return
  active = next
  listeners.forEach((l) => l())
}

export function useActiveSection(): ActiveSection {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => active,
    () => 'hero' as ActiveSection,
  )
}
