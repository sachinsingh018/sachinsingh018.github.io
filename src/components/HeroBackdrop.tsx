import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useActiveSection } from '../lib/sectionStore'

const HeroScene = lazy(() => import('../three/HeroScene'))

function whenIdle(fn: () => void) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 1500 })
  else setTimeout(fn, 300)
}

/**
 * The 3D system graph behind the hero. A static poster paints first; the
 * three.js chunk loads on first interaction, so the headline stays the LCP.
 * On desktop the canvas is fixed and dims once you scroll past the hero.
 */
export function HeroBackdrop() {
  const liveRef = useRef(true)
  const [dim, setDim] = useState(false)
  const [mount, setMount] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // The scene mounts on the first sign of a person: a mouse move, touch, scroll or key.
    // Until then the poster (a still render of the same graph) is on screen, and the
    // initial load stays light on every device.
    const events = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel'] as const
    const go = () => {
      events.forEach((ev) => window.removeEventListener(ev, go))
      whenIdle(() => setMount(true))
    }
    events.forEach((ev) => window.addEventListener(ev, go, { passive: true, once: true }))
    return () => events.forEach((ev) => window.removeEventListener(ev, go))
  }, [])

  useEffect(() => {
    const on = () => {
      const past = window.scrollY > window.innerHeight * 0.7
      liveRef.current = !past && !document.hidden
      setDim(past)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    document.addEventListener('visibilitychange', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      document.removeEventListener('visibilitychange', on)
    }
  }, [])

  const onReady = useCallback(() => setReady(true), [])
  // The map stays visible beside sparse sections and steps back behind dense reading ones.
  const active = useActiveSection()
  const hideForReading = active === 'experience' || active === 'toolkit' || active === 'projects'

  return (
    <div
      aria-hidden="true"
      className={`hero-backdrop pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-700 md:fixed ${
        dim ? `hero-backdrop-dim opacity-0 ${hideForReading ? 'md:opacity-0' : 'md:opacity-[0.16]'}` : 'opacity-100'
      }`}
    >
      <div className={`hero-poster absolute inset-0 transition-opacity duration-1000 ${ready ? 'opacity-0' : 'opacity-100'}`} />
      {mount ? (
        <Suspense fallback={null}>
          <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <HeroScene liveRef={liveRef} onReady={onReady} />
          </div>
        </Suspense>
      ) : null}
    </div>
  )
}
