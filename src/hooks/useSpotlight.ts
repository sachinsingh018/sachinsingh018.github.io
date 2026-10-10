import { useCallback } from 'react'

/** Feeds the cursor position into --mx / --my for the .spot-card radial highlight. */
export function useSpotlight<T extends HTMLElement>() {
  return useCallback((e: React.PointerEvent<T>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])
}
