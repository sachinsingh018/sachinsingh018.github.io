import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import type { GraphData } from './graphData'
import { getActiveSection } from '../lib/sectionStore'
import { sectionIds } from '../content/site'
import type { Theme } from '../hooks/useTheme'

const MAX_TILT = THREE.MathUtils.degToRad(5)
const CLUSTER_SLOTS = 7 // 6 sections plus one slot for cross-cluster edges

type Palette = {
  member: THREE.Color
  memberActive: THREE.Color
  edge: THREE.Color
  edgeActive: THREE.Color
  hubA: THREE.Color
  hubB: THREE.Color
  hubBoost: number
  pulseA: THREE.Color
  pulseB: THREE.Color
  pulseBoost: number
  additive: boolean
}

function palette(theme: Theme): Palette {
  const srgb = (hex: string) => new THREE.Color(hex)
  if (theme === 'light') {
    return {
      member: srgb('#8a90a0'),
      memberActive: srgb('#4f46e5'),
      edge: srgb('#c4c8d2'),
      edgeActive: srgb('#8b87ef'),
      hubA: srgb('#4f46e5'),
      hubB: srgb('#0891b2'),
      hubBoost: 1,
      pulseA: srgb('#4f46e5'),
      pulseB: srgb('#0891b2'),
      pulseBoost: 1,
      additive: false,
    }
  }
  return {
    member: srgb('#4a5164'),
    memberActive: srgb('#a5b4fc'),
    edge: srgb('#262c40'),
    edgeActive: srgb('#4a58a8'),
    hubA: srgb('#7c7cf8'),
    hubB: srgb('#22d3ee'),
    hubBoost: 2.6,
    pulseA: srgb('#8b8cff'),
    pulseB: srgb('#22d3ee'),
    pulseBoost: 1.6,
    additive: true,
  }
}

const pulseVertex = /* glsl */ `
  attribute vec3 aStart;
  attribute vec3 aEnd;
  attribute float aSpeed;
  attribute float aOffset;
  attribute float aCluster;
  uniform float uTime;
  uniform float uW[${CLUSTER_SLOTS}];
  uniform float uSize;
  uniform float uDpr;
  varying float vAlpha;
  varying float vT;
  varying float vAct;
  void main() {
    float t = fract(aOffset + uTime * aSpeed);
    vec3 p = mix(aStart, aEnd, t);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float act = uW[int(aCluster)];
    vAct = act;
    vT = t;
    vAlpha = sin(t * 3.14159265);
    gl_PointSize = uSize * uDpr * (1.0 + act * 0.7) / -mv.z;
  }
`

const pulseFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uBoost;
  uniform float uBase;
  varying float vAlpha;
  varying float vT;
  varying float vAct;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d) * vAlpha * mix(uBase, 1.0, vAct);
    vec3 col = mix(uColorA, uColorB, vT) * (1.0 + vAct * (uBoost - 1.0));
    gl_FragColor = vec4(col, a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

type Props = {
  graph: GraphData
  theme: Theme
  parallax: boolean
  reduced: boolean
  /** True while the hero is on screen: pulses move and frames render continuously. */
  liveRef: RefObject<boolean>
  /** World-space x offset so the graph's mass sits right of the headline. */
  offsetX: number
}

export function SystemGraph({ graph, theme, parallax, reduced, liveRef, offsetX }: Props) {
  const group = useRef<THREE.Group>(null!)
  const nodes = useRef<THREE.InstancedMesh>(null!)
  const lines = useRef<THREE.LineSegments>(null!)
  const pulses = useRef<THREE.Points>(null!)
  const invalidate = useThree((s) => s.invalidate)
  const dpr = useThree((s) => s.viewport.dpr)

  const weights = useRef(new Float32Array(CLUSTER_SLOTS))
  const time = useRef(3.2)
  const idle = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const tilt = useRef({ x: 0, y: 0 })
  const dirty = useRef(true)

  const pal = useMemo(() => palette(theme), [theme])

  // Static geometry: line positions and pulse attributes.
  const lineGeom = useMemo(() => {
    const { edges, positions } = graph
    const pos = new Float32Array(edges.length * 3)
    for (let k = 0; k < edges.length; k++) pos.set(positions.subarray(edges[k] * 3, edges[k] * 3 + 3), k * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(edges.length * 3), 3))
    return geo
  }, [graph])

  const pulseGeom = useMemo(() => {
    const { edges, positions, edgeCluster } = graph
    const rand = (() => {
      let s = 99
      return () => ((s = (s * 16807) % 2147483647) / 2147483647)
    })()
    const start: number[] = []
    const end: number[] = []
    const speed: number[] = []
    const offset: number[] = []
    const cl: number[] = []
    for (let e = 0; e < edges.length / 2; e++) {
      const cross = edgeCluster[e] === 255
      if (!cross && rand() > 0.55) continue
      let a = edges[e * 2]
      let b = edges[e * 2 + 1]
      if (rand() > 0.5) [a, b] = [b, a]
      const pa = positions.subarray(a * 3, a * 3 + 3)
      const pb = positions.subarray(b * 3, b * 3 + 3)
      const len = Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2])
      start.push(...pa)
      end.push(...pb)
      speed.push((0.18 + rand() * 0.22) / Math.max(0.4, len))
      offset.push(rand())
      cl.push(cross ? CLUSTER_SLOTS - 1 : edgeCluster[e])
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(start), 3))
    geo.setAttribute('aStart', new THREE.BufferAttribute(new Float32Array(start), 3))
    geo.setAttribute('aEnd', new THREE.BufferAttribute(new Float32Array(end), 3))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(new Float32Array(speed), 1))
    geo.setAttribute('aOffset', new THREE.BufferAttribute(new Float32Array(offset), 1))
    geo.setAttribute('aCluster', new THREE.BufferAttribute(new Float32Array(cl), 1))
    // Pulses move in the shader, so the CPU-side bounds never update. Skip culling.
    return geo
  }, [graph])

  const pulseMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pulseVertex,
        fragmentShader: pulseFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uW: { value: Array.from({ length: CLUSTER_SLOTS }, () => 0) },
          uSize: { value: 26 },
          uDpr: { value: 1 },
          uColorA: { value: new THREE.Color() },
          uColorB: { value: new THREE.Color() },
          uBoost: { value: 1.6 },
          uBase: { value: 0.55 },
        },
      }),
    [],
  )

  useLayoutEffect(() => () => pulseMat.dispose(), [pulseMat])

  // Theme-dependent material settings.
  useLayoutEffect(() => {
    pulseMat.blending = pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending
    pulseMat.uniforms.uColorA.value.copy(pal.pulseA)
    pulseMat.uniforms.uColorB.value.copy(pal.pulseB)
    pulseMat.uniforms.uBoost.value = pal.pulseBoost
    pulseMat.uniforms.uBase.value = pal.additive ? 0.75 : 0.85
    pulseMat.uniforms.uSize.value = pal.additive ? 42 : 34
    pulseMat.needsUpdate = true
    const lm = lines.current.material as THREE.LineBasicMaterial
    lm.blending = pal.additive ? THREE.AdditiveBlending : THREE.NormalBlending
    lm.opacity = pal.additive ? 1 : 0.7
    lm.needsUpdate = true
    dirty.current = true
    invalidate()
  }, [pal, pulseMat, invalidate])

  useLayoutEffect(() => {
    pulseMat.uniforms.uDpr.value = dpr
  }, [dpr, pulseMat])

  // Node transforms never change.
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const p = new THREE.Vector3()
    const s = new THREE.Vector3()
    for (let i = 0; i < graph.count; i++) {
      p.fromArray(graph.positions, i * 3)
      s.setScalar(graph.size[i])
      m.compose(p, q, s)
      nodes.current.setMatrixAt(i, m)
    }
    nodes.current.instanceMatrix.needsUpdate = true
    nodes.current.computeBoundingSphere()
    dirty.current = true
  }, [graph])

  // Pointer parallax. The canvas sits behind the page, so listen on the window.
  useLayoutEffect(() => {
    if (!parallax || reduced) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
      if (!liveRef.current) invalidate()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [parallax, reduced, liveRef, invalidate])

  const tmp = useMemo(() => new THREE.Color(), [])

  const paint = () => {
    const w = weights.current
    const anyActive = w.slice(0, CLUSTER_SLOTS - 1).some((v) => v > 0.01)
    for (let i = 0; i < graph.count; i++) {
      const c = graph.cluster[i]
      const k = w[c]
      if (graph.hub[i]) {
        tmp.copy(pal.hubA).lerp(pal.hubB, c / (CLUSTER_SLOTS - 2))
        const boost = anyActive ? 1 + (pal.hubBoost - 1) * (0.35 + 0.65 * k) : pal.hubBoost
        tmp.multiplyScalar(boost)
      } else {
        tmp.copy(pal.member).lerp(pal.memberActive, k)
      }
      nodes.current.setColorAt(i, tmp)
    }
    if (nodes.current.instanceColor) nodes.current.instanceColor.needsUpdate = true

    const colors = lineGeom.getAttribute('color') as THREE.BufferAttribute
    const arr = colors.array as Float32Array
    for (let e = 0; e < graph.edges.length / 2; e++) {
      const ec = graph.edgeCluster[e]
      const k = ec === 255 ? 0 : w[ec]
      tmp.copy(pal.edge).lerp(pal.edgeActive, k)
      arr.set([tmp.r, tmp.g, tmp.b, tmp.r, tmp.g, tmp.b], e * 6)
    }
    colors.needsUpdate = true
    pulseMat.uniforms.uW.value = Array.from(w)
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const live = liveRef.current
    const active = getActiveSection()
    const activeIdx = active === 'hero' ? -1 : sectionIds.indexOf(active)

    // Cluster emphasis
    let moving = false
    const w = weights.current
    for (let c = 0; c < CLUSTER_SLOTS - 1; c++) {
      const target = c === activeIdx ? 1 : 0
      const next = reduced ? target : THREE.MathUtils.damp(w[c], target, 3.2, dt)
      if (Math.abs(next - w[c]) > 0.0005) moving = true
      w[c] = Math.abs(next - target) < 0.002 ? target : next
    }
    if (moving || dirty.current) {
      paint()
      dirty.current = false
    }

    // Rotation: slow idle drift in the hero, bring the active cluster forward later on.
    if (live && !reduced) {
      time.current += dt
      idle.current += dt * 0.035
    }
    pulseMat.uniforms.uTime.value = time.current

    let targetY = idle.current
    if (activeIdx >= 0) {
      const [x, , z] = graph.clusterCenters[activeIdx]
      const a = Math.atan2(z, x)
      // Rotate so the cluster sits slightly right of front.
      targetY = a - Math.PI / 2 + 0.45
      // Take the short way round from the current rotation.
      const cur = group.current.rotation.y
      targetY = cur + Math.atan2(Math.sin(targetY - cur), Math.cos(targetY - cur))
    }
    // Parallax only follows the pointer while the hero is live; past it the tilt holds still.
    const follow = parallax && !reduced && live
    const px = follow ? pointer.current.x * MAX_TILT : tilt.current.y
    const py = follow ? pointer.current.y * MAX_TILT * 0.6 : tilt.current.x
    const k = reduced ? 1 : 1 - Math.exp(-2.2 * dt)
    tilt.current.x += (py - tilt.current.x) * k
    tilt.current.y += (px - tilt.current.y) * k
    const ry = group.current.rotation.y
    const nextY = reduced ? targetY : ry + (targetY - ry) * (1 - Math.exp(-2.4 * dt))
    group.current.rotation.y = nextY
    group.current.rotation.x = 0.18 + tilt.current.x
    group.current.rotation.z = -0.06
    group.current.position.x = offsetX + tilt.current.y * 0.6

    const settled =
      !moving &&
      Math.abs(targetY - nextY) < 0.0015 &&
      Math.abs(px - tilt.current.y) < 0.0015 &&
      Math.abs(py - tilt.current.x) < 0.0015
    if ((live && !reduced) || !settled) invalidate()
  })

  return (
    <group ref={group} position={[offsetX, 0.1, 0]}>
      <instancedMesh ref={nodes} args={[undefined, undefined, graph.count]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <lineSegments ref={lines} geometry={lineGeom} frustumCulled={false}>
        <lineBasicMaterial vertexColors transparent depthWrite={false} toneMapped={false} />
      </lineSegments>
      <points ref={pulses} geometry={pulseGeom} material={pulseMat} frustumCulled={false} />
    </group>
  )
}
