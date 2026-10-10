import { Component, useEffect, useMemo, type ReactNode, type RefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { buildGraph } from './graphData'
import { SystemGraph } from './SystemGraph'
import { useGpuTier } from './useGpuTier'
import { useTheme } from '../hooks/useTheme'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useMediaQuery } from '../hooks/useMediaQuery'

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

  if (!quality || !graph || quality.tier === 0) return null
  const bg = theme === 'light' ? '#f6f7f9' : '#07080c'
  const bloom = quality.bloom && theme === 'dark'

  return (
    <Boundary>
      <Canvas
        dpr={[1, 1.75]}
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
        <Waker liveRef={liveRef} />
        <FirstFrame onReady={onReady} />
      </Canvas>
    </Boundary>
  )
}
