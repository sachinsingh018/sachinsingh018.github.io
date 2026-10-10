import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { CaseStudyId } from '../content/site'
import { explainers } from '../content/explainers'

// The explainers and their GSAP plugins load as a separate chunk, only when one is about to be seen.
const ExplainerLoader = lazy(() => import('./ExplainerLoader'))

/** Wide-layout proportions, so the placeholder reserves the right space and nothing jumps. */
const SHAPE: Record<CaseStudyId, { ratio: string; below: number }> = {
  'renewal-agent': { ratio: '960 / 432', below: 156 },
  latency: { ratio: '556 / 400', below: 112 },
  'rag-cache': { ratio: '560 / 430', below: 112 },
}

export function LazyExplainer({ id, variant = 'inline' }: { id: CaseStudyId; variant?: 'inline' | 'sheet' }) {
  const ref = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(variant === 'sheet')

  useEffect(() => {
    if (load) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true)
          io.disconnect()
        }
      },
      { rootMargin: '900px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [load])

  const placeholder = <Placeholder id={id} />
  return (
    <div ref={ref}>
      {load ? (
        <Suspense fallback={placeholder}>
          <ExplainerLoader id={id} variant={variant} />
        </Suspense>
      ) : (
        placeholder
      )}
    </div>
  )
}

function Placeholder({ id }: { id: CaseStudyId }) {
  const shape = SHAPE[id]
  return (
    <div aria-busy="true">
      <div className="ex-frame relative overflow-hidden rounded-xl border border-line bg-raised pt-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 px-3 py-2.5">
          <span className="kicker !text-[0.65rem] !tracking-[0.08em]">Simplified illustration</span>
        </div>
        <div style={{ aspectRatio: shape.ratio }} />
      </div>
      <p className="sr-only">{explainers[id].summary}</p>
      <div style={{ height: shape.below }} aria-hidden="true" />
    </div>
  )
}
