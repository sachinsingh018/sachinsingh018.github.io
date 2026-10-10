import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { setConsoleFunction } from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { buildGraph } from './graphData'
import { SystemGraph } from './SystemGraph'
import { useGpuTier } from './useGpuTier'
import { useTheme } from '../hooks/useTheme'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useMediaQuery } from '../hooks/useMediaQuery'

// R3F 9 still creates a THREE.Clock internally, which three r183+ flags as deprecated on every
// mount. That warning is about the library, not this site, so filter exactly that one message.
setConsoleFunction((type, message, ...params) => {
  if (type === 'warn' && typeof message === 'string' && message.includes('Clock: This module has been deprecated')) return
  const fn = (console as unknown as Record<string, (...a: unknown[]) => void>)[type] ?? console.log
  fn(message, ...params)
})

type Props = {
  liveRef: RefObject<boolean>
  onReady: () => void
}

/** Wakes the demand-driven loop when the page state changes outside the canvas. */
function Waker({ liveRef }: { liveRef: RefObject<boolean> }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let raf = 0
    const kick = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => invalidate())
    }
    // Scroll changes the active section and whether the hero is live.
    window.addEventListener('scroll', kick, { passive: true })
    document.addEventListener('visibilitychange', kick)
    const id = window.setInterval(() => {
      if (liveRef.current && !document.hidden) invalidate()
    }, 500)
    return () => {
      window.removeEventListener('scroll', kick)
      document.removeEventListener('visibilitychange', kick)
      window.clearInterval(id)
      cancelAnimationFrame(raf)
    }
  }, [invalidate, liveRef])
  return null
}

function FirstFrame({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    // Two frames in, the scene is on screen; let the poster fade out.
    let a = 0
    let b = 0
    a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => onReady())
    })
    return () => {
      cancelAnimationFrame(a)
      cancelAnimationFrame(b)
    }
  }, [gl, onReady])
  return null
}

/**
 * Watches real frame times while the hero is live and steps quality down once if the GPU
 * cannot hold about 60fps: first drop DPR to 1, then turn bloom off.
 */
function AdaptiveQuality({ liveRef, level, onDowngrade }: { liveRef: RefObject<boolean>; level: number; onDowngrade: () => void }) {
  const samples = useRef<number[]>([])
  const skip = useRef(30)
  useEffect(() => {
    samples.current = []
    skip.current = 30
  }, [level])
  useFrame((_, delta) => {
    if (level >= 2 || !liveRef.current || document.hidden) return
    if (skip.current > 0) {
      skip.current--
      return
    }
    // Ignore gaps from demand-mode pauses; only judge consecutive frames.
    if (delta > 0.25) return
    samples.current.push(delta * 1000)
    if (samples.current.length < 90) return
    const sorted = [...samples.current].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    samples.current = []
    if (median > 17.5) onDowngrade()
  })
  return null
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function HeroScene({ liveRef, onReady }: Props) {
  const quality = useGpuTier()
  const { theme } = useTheme()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 1024px)')
  const graph = useMemo(() => (quality ? buildGraph(quality.nodes) : null), [quality])
  // 0: full quality, 1: DPR 1, 2: DPR 1 without bloom.
  const [level, setLevel] = useState(0)

  if (!quality || !graph || quality.tier === 0) return null
  const bg = theme === 'light' ? '#f6f7f9' : '#07080c'
  const bloom = quality.bloom && theme === 'dark' && level < 2

  return (
    <Boundary>
      <Canvas
        dpr={level === 0 ? [1, quality.bloom ? 1.5 : 1.75] : 1}
        frameloop="demand"
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false }}
        camera={{ position: [0, 0.3, 10], fov: 38, near: 0.1, far: 50 }}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, 8.5, 13.5]} />
        <SystemGraph
          graph={graph}
          theme={theme}
          parallax={quality.parallax}
          reduced={reduced}
          liveRef={liveRef}
          offsetX={wide ? 2.35 : quality.isMobile ? 0 : 1.4}
        />
        {bloom ? (
          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={1.1} radius={0.75} />
          </EffectComposer>
        ) : null}
        <AdaptiveQuality liveRef={liveRef} level={level} onDowngrade={() => setLevel((l) => Math.min(2, l + 1))} />
        <Waker liveRef={liveRef} />
        <FirstFrame onReady={onReady} />
      </Canvas>
    </Boundary>
  )
}
