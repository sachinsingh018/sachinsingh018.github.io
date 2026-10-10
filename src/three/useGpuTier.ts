import { useEffect, useState } from 'react'
import { getGPUTier } from '@pmndrs/detect-gpu'

export type Quality = {
  /** 0 = no WebGL or blocklisted, 1 = low, 2 = mid, 3 = high */
  tier: number
  isMobile: boolean
  nodes: number
  bloom: boolean
  parallax: boolean
}

let cached: Promise<Quality> | null = null

function decide(tier: number, isMobile: boolean): Quality {
  const narrow = window.matchMedia('(max-width: 767px)').matches
  const mobile = isMobile || narrow
  const low = tier <= 1
  return {
    tier,
    isMobile: mobile,
    nodes: mobile ? 96 : low ? 132 : 228,
    // Bloom is the costliest pass; only top-tier GPUs start with it. AdaptiveQuality still steps down if needed.
    bloom: !mobile && tier >= 3,
    parallax: !mobile && window.matchMedia('(pointer: fine)').matches,
  }
}

/** Detects the GPU tier once per visit. Benchmarks are self-hosted in /detect-gpu. */
export function loadQuality(): Promise<Quality> {
  // ?gpu=0..3 forces a tier. Used to render the poster and social image at full quality.
  const forced = new URLSearchParams(window.location.search).get('gpu')
  if (forced !== null && /^[0-3]$/.test(forced)) return Promise.resolve(decide(Number(forced), false))
  if (!cached) {
    cached = getGPUTier({ benchmarksURL: '/detect-gpu' })
      .then((r) => decide(r.tier, Boolean(r.isMobile)))
      .catch(() => decide(1, false))
  }
  return cached
}

export function useGpuTier(): Quality | null {
  const [q, setQ] = useState<Quality | null>(null)
  useEffect(() => {
    let alive = true
    loadQuality().then((v) => alive && setQ(v))
    return () => {
      alive = false
    }
  }, [])
  return q
}
