/**
 * Deterministic "system graph" for the hero: one cluster of nodes per page
 * section, each with a hub, plus a few long edges between clusters.
 * Seeded so the layout is identical on every visit (and in the poster render).
 */

export type GraphData = {
  /** xyz per node */
  positions: Float32Array
  /** per node: cluster index */
  cluster: Uint8Array
  /** per node: 1 for hubs */
  hub: Uint8Array
  /** per node: base radius */
  size: Float32Array
  /** node index pairs */
  edges: Uint16Array
  /** per edge: cluster index, or 255 for cross-cluster edges */
  edgeCluster: Uint8Array
  clusterCenters: [number, number, number][]
  count: number
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildGraph(totalNodes: number, clusters = 6, seed = 7): GraphData {
  const rand = mulberry32(seed)
  const gauss = () => {
    // Box-Muller
    const u = Math.max(1e-6, rand())
    const v = rand()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  // Cluster centres on a tilted ring, so rotating the group brings each one forward.
  const centers: [number, number, number][] = []
  for (let c = 0; c < clusters; c++) {
    const a = (c / clusters) * Math.PI * 2 + 0.35
    const r = 1.8
    centers.push([Math.cos(a) * r, Math.sin(c * 1.7) * 0.6 + (c % 2 ? 0.3 : -0.3), Math.sin(a) * r])
  }

  const perCluster = Math.floor(totalNodes / clusters)
  const count = perCluster * clusters
  const positions = new Float32Array(count * 3)
  const cluster = new Uint8Array(count)
  const hub = new Uint8Array(count)
  const size = new Float32Array(count)

  let n = 0
  for (let c = 0; c < clusters; c++) {
    const [cx, cy, cz] = centers[c]
    for (let k = 0; k < perCluster; k++) {
      const isHub = k === 0
      const spread = 0.46 + rand() * 0.2
      const x = isHub ? cx : cx + gauss() * spread
      const y = isHub ? cy : cy + gauss() * spread * 0.7
      const z = isHub ? cz : cz + gauss() * spread
      positions.set([x, y, z], n * 3)
      cluster[n] = c
      hub[n] = isHub ? 1 : 0
      size[n] = isHub ? 0.075 : 0.016 + rand() * 0.02
      n++
    }
  }

  const edges: number[] = []
  const edgeCluster: number[] = []
  const dist2 = (i: number, j: number) => {
    const dx = positions[i * 3] - positions[j * 3]
    const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
    const dz = positions[i * 3 + 2] - positions[j * 3 + 2]
    return dx * dx + dy * dy + dz * dz
  }
  const seen = new Set<string>()
  const add = (i: number, j: number, c: number) => {
    const key = i < j ? `${i}-${j}` : `${j}-${i}`
    if (i === j || seen.has(key)) return
    seen.add(key)
    edges.push(i, j)
    edgeCluster.push(c)
  }

  // Within each cluster: link every node to its 2 nearest neighbours, some to the hub.
  for (let c = 0; c < clusters; c++) {
    const start = c * perCluster
    const end = start + perCluster
    for (let i = start; i < end; i++) {
      const near: [number, number][] = []
      for (let j = start; j < end; j++) if (j !== i) near.push([dist2(i, j), j])
      near.sort((a, b) => a[0] - b[0])
      add(i, near[0][1], c)
      if (rand() < 0.6) add(i, near[1][1], c)
      if (i !== start && rand() < 0.28) add(i, start, c)
    }
  }
  // Between clusters: hubs in a ring, plus a few long member links.
  for (let c = 0; c < clusters; c++) {
    const a = c * perCluster
    const b = ((c + 1) % clusters) * perCluster
    add(a, b, 255)
    if (c % 2 === 0) add(a, ((c + 3) % clusters) * perCluster, 255)
    for (let k = 0; k < 2; k++) {
      const i = a + 1 + Math.floor(rand() * (perCluster - 1))
      const j = b + 1 + Math.floor(rand() * (perCluster - 1))
      add(i, j, 255)
    }
  }

  return {
    positions,
    cluster,
    hub,
    size,
    edges: new Uint16Array(edges),
    edgeCluster: new Uint8Array(edgeCluster),
    clusterCenters: centers,
    count,
  }
}
