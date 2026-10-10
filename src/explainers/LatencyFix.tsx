import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { explainers } from '../content/explainers'
import { ExplainerShell, type Layout } from './ExplainerShell'

gsap.registerPlugin(DrawSVGPlugin)

const data = explainers.latency

/**
 * Relative timings, in percent of the original page load. Illustrative only:
 * the one real number is the end result, 70% less load time.
 * Before: graph calls run one after another and the dashboard query waits on them.
 * After batching: graph 12 to 20, query 20 to 56, render 56 to 60.
 * After indexing: query 20 to 26, render 26 to 30.
 */
type Row = { label: string; s: number; e: number; kind: 'plain' | 'graph' | 'slow' }
const GRAPH_CALLS = 6
const ROWS: Row[] = [
  { label: 'GET /case/view', s: 0, e: 5, kind: 'plain' },
  { label: 'app bundle', s: 5, e: 12, kind: 'plain' },
  ...Array.from({ length: GRAPH_CALLS }, (_, k): Row => ({
    label: 'graph /me/messages',
    s: 12 + k * 8,
    e: 20 + k * 8,
    kind: 'graph',
  })),
  { label: 'dashboard query', s: 60, e: 96, kind: 'slow' },
  { label: 'render', s: 96, e: 100, kind: 'plain' },
]
const Q = ROWS.length - 2 // query row index
const R = ROWS.length - 1 // render row index
const G0 = 2 // first graph row

function geometry(layout: Layout) {
  const wide = layout === 'wide'
  const X0 = wide ? 168 : 12
  const X1 = wide ? 544 : 348
  const W = X1 - X0
  const pitch = wide ? 28 : 32
  const top = wide ? 40 : 40
  // In wide rows the label sits left of the bar; in tall rows above it.
  const rowY = (i: number) => top + i * pitch
  const barY = (i: number) => (wide ? rowY(i) : rowY(i) + 5)
  const labelY = (i: number) => (wide ? rowY(i) + 12 : rowY(i))
  const barH = wide ? 15 : 12
  const gridTop = 28
  const gridBottom = wide ? top + ROWS.length * pitch - 4 : top + ROWS.length * pitch - 10
  const totalY = gridBottom + (wide ? 44 : 50)
  return {
    wide,
    X0,
    X1,
    W,
    pitch,
    rowY,
    barY,
    labelY,
    barH,
    gridTop,
    gridBottom,
    totalY,
    viewH: totalY + (wide ? 26 : 26),
    x: (pct: number) => X0 + (pct / 100) * W,
    w: (s: number, e: number) => ((e - s) / 100) * W,
  }
}

function build(root: SVGSVGElement, layout: Layout) {
  const g = geometry(layout)
  const q = gsap.utils.selector(root)
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // 1. Page load
  tl.addLabel('load', 0)
  tl.from(q('.lt-grid'), { opacity: 0, duration: 0.4 }, 'load')
  tl.from(q('.lt-label'), { opacity: 0, duration: 0.3, stagger: 0.05 }, 'load')
  ROWS.forEach((r, i) => {
    tl.from(q(`.lt-bar-${i}`), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.35, ease: 'power2.out' }, `load+=${0.2 + (r.s / 100) * 1.8}`)
  })
  tl.from(q('.lt-total'), { scaleX: 0, transformOrigin: '0% 50%', duration: 2, ease: 'none' }, 'load+=0.2')
  tl.from(q('.lt-total-label'), { opacity: 0, duration: 0.3 }, 'load+=0.2')

  // 2. Repeated Graph calls
  tl.addLabel('graph', 2.9)
  tl.fromTo(q('.lt-graph-hl'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, ease: 'power2.inOut' }, 'graph')
  tl.from(q('.lt-graph-note'), { opacity: 0, duration: 0.4 }, 'graph+=0.4')
  tl.fromTo(
    q('.lt-bar-graph'),
    { opacity: 1 },
    { opacity: 0.45, duration: 0.18, yoyo: true, repeat: 3, stagger: 0.06, ease: 'sine.inOut' },
    'graph+=0.3',
  )

  // 3. Slow query
  tl.addLabel('scan', 4.5)
  tl.fromTo(q('.lt-query-hl'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 'scan')
  tl.from(q('.lt-table'), { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.35, ease: 'back.out(1.2)' }, 'scan+=0.1')
  tl.fromTo(q('.lt-scanline'), { y: 0, opacity: 1 }, { y: 10, duration: 0.45, repeat: 2, ease: 'none' }, 'scan+=0.4')
  tl.to(q('.lt-scanline'), { opacity: 0, duration: 0.1 })
  tl.from(q('.lt-badge-scan'), { opacity: 0, duration: 0.3 }, 'scan+=0.5')

  // 4. Batch: the six calls become one. The removed calls stay as faint ghosts so the
  // before and after read in the same picture.
  tl.addLabel('batch', 6.4)
  for (let k = 1; k < GRAPH_CALLS; k++) {
    tl.to(q(`.lt-row-${G0 + k}`), { opacity: 0.16, duration: 0.5, ease: 'power2.inOut' }, `batch+=${k * 0.05}`)
  }
  tl.from(q('.lt-removed'), { opacity: 0, duration: 0.4 }, 'batch+=0.5')
  tl.to(q(`.lt-bar-${G0}`), { attr: { width: g.w(12, 20) }, duration: 0.5 }, 'batch+=0.2')
  tl.to(q('.lt-graph-label-a'), { opacity: 0, duration: 0.25 }, 'batch+=0.2')
  tl.fromTo(q('.lt-graph-label-b'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 'batch+=0.35')
  tl.to(q('.lt-graph-hl'), { opacity: 0, duration: 0.3 }, 'batch')
  tl.to(q('.lt-graph-note'), { opacity: 0, duration: 0.2 }, 'batch')
  tl.to(q('.lt-query-move'), { attr: { x: g.x(20) }, duration: 0.6, ease: 'power2.inOut' }, 'batch+=0.4')
  tl.to(q('.lt-badge-scan'), { attr: { x: g.x(20) + 8 }, duration: 0.6, ease: 'power2.inOut' }, 'batch+=0.4')
  tl.to(q(`.lt-bar-${R}`), { attr: { x: g.x(56) }, duration: 0.6, ease: 'power2.inOut' }, 'batch+=0.4')
  tl.to(q('.lt-total'), { attr: { width: g.w(0, 60) }, duration: 0.7, ease: 'power2.inOut' }, 'batch+=0.5')
  tl.from(q('.lt-ghost'), { opacity: 0, duration: 0.3 }, 'batch+=0.5')
  tl.fromTo(q('.lt-count'), { textContent: 0 }, { textContent: 40, snap: { textContent: 1 }, duration: 0.7, ease: 'power2.inOut' }, 'batch+=0.5')
  tl.from(q('.lt-count-wrap'), { opacity: 0, duration: 0.2 }, 'batch+=0.5')

  // 5. Index: the query becomes an indexed view
  tl.addLabel('index', 8.2)
  tl.to(q('.lt-query-label-a'), { opacity: 0, duration: 0.25 }, 'index')
  tl.fromTo(q('.lt-query-label-b'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 'index+=0.15')
  tl.to(q('.lt-table'), { opacity: 0, duration: 0.2 }, 'index')
  tl.to(q('.lt-badge-scan'), { opacity: 0, duration: 0.2 }, 'index')
  tl.to(q('.lt-query-hl'), { opacity: 0, duration: 0.3 }, 'index')
  tl.to(q('.lt-query-move'), { attr: { width: g.w(20, 26) }, duration: 0.6, ease: 'power3.inOut' }, 'index+=0.2')
  tl.fromTo(q('.lt-bar-fast'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 'index+=0.35')
  tl.to(q('.lt-bar-slow'), { opacity: 0, duration: 0.4 }, 'index+=0.35')
  tl.from(q('.lt-badge-index'), { opacity: 0, duration: 0.3 }, 'index+=0.7')
  tl.to(q(`.lt-bar-${R}`), { attr: { x: g.x(26) }, duration: 0.6, ease: 'power2.inOut' }, 'index+=0.4')
  tl.to(q('.lt-total'), { attr: { width: g.w(0, 30) }, duration: 0.7, ease: 'power2.inOut' }, 'index+=0.5')
  tl.to(q('.lt-count'), { textContent: 70, snap: { textContent: 1 }, duration: 0.7, ease: 'power2.inOut' }, 'index+=0.5')

  // 6. Result
  tl.addLabel('result', 9.9)
  tl.fromTo(q('.lt-count-wrap'), { scale: 1 }, { scale: 1.04, transformOrigin: '100% 50%', duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' }, 'result')
  tl.fromTo(q('.lt-result-note'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 'result+=0.2')
  tl.to({}, { duration: 0.8 })
  return tl
}

function Diagram({ layout }: { layout: Layout }) {
  const g = geometry(layout)
  const ticks = [0, 25, 50, 75, 100]
  const graphTop = g.wide ? g.barY(G0) - 6 : g.labelY(G0) - 14
  const graphBottom = g.barY(G0 + GRAPH_CALLS - 1) + g.barH + 6
  const qy = g.barY(Q)

  return (
    <g>
      <g className="lt-grid">
        <text x={g.wide ? 12 : g.X0} y={g.wide ? 20 : 20} className="ex-label">
          Request
        </text>
        <text x={g.X1} y={20} textAnchor="end" className="ex-label">
          Relative time
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={g.x(t)} x2={g.x(t)} y1={g.gridTop} y2={g.gridBottom} className="ex-wire-dash" />
            <text x={g.x(t)} y={g.gridBottom + 14} textAnchor={t === 0 ? 'start' : t === 100 ? 'end' : 'middle'} className="ex-mono" style={{ fontSize: 10 }}>
              {t}
            </text>
          </g>
        ))}
      </g>

      {/* Graph call highlight */}
      <rect
        x={4}
        y={graphTop}
        width={(g.wide ? 556 : 356) - 8}
        height={graphBottom - graphTop}
        rx={8}
        className="ex-wire-accent lt-graph-hl"
        style={{ strokeDasharray: 'none' }}
      />
      <text
        x={g.X1}
        y={g.wide ? g.barY(G0 + 2) + 11 : g.labelY(G0)}
        textAnchor="end"
        className="ex-mono ex-text-accent lt-graph-note"
      >
        same request ×{GRAPH_CALLS}
      </text>
      <text
        x={g.X1}
        y={g.wide ? g.barY(G0 + 3) + 11 : g.labelY(G0 + 2)}
        textAnchor="end"
        className="ex-mono lt-removed"
      >
        {GRAPH_CALLS - 1} round trips removed
      </text>

      {ROWS.map((r, i) => {
        const isGraph = r.kind === 'graph'
        const isQuery = i === Q
        return (
          <g key={i} className={`lt-row lt-row-${i}`}>
            {isQuery ? (
              <rect
                x={4}
                y={(g.wide ? qy : g.labelY(Q) - 14) - 6}
                width={(g.wide ? 556 : 356) - 8}
                height={(g.wide ? g.barH : g.barH + 19) + 12}
                rx={8}
                className="ex-box-warn lt-query-hl"
                style={{ fillOpacity: 0.5 }}
              />
            ) : null}
            {isGraph && i === G0 ? (
              <>
                <text x={g.wide ? 12 : g.X0} y={g.labelY(i)} className="ex-mono lt-label lt-graph-label-a">
                  {r.label}
                </text>
                <text x={g.wide ? 12 : g.X0} y={g.labelY(i)} className="ex-mono-fg lt-graph-label-b" opacity={0}>
                  graph $batch
                </text>
              </>
            ) : isQuery ? (
              <>
                <text x={g.wide ? 12 : g.X0} y={g.labelY(i)} className="ex-mono-fg lt-label lt-query-label-a">
                  {r.label}
                </text>
                <text x={g.wide ? 12 : g.X0} y={g.labelY(i)} className="ex-mono-fg lt-query-label-b" opacity={0}>
                  indexed view
                </text>
              </>
            ) : (
              <text x={g.wide ? 12 : g.X0} y={g.labelY(i)} className="ex-mono lt-label">
                {r.label}
              </text>
            )}

            {isQuery ? (
              <g className={`lt-bar-${i}`}>
                <rect x={g.x(r.s)} y={g.barY(i)} width={g.w(r.s, r.e)} height={g.barH} rx={3} className="ex-bar-slow lt-bar-slow lt-query-move" />
                <rect
                  x={g.x(r.s)}
                  y={g.barY(i)}
                  width={g.w(r.s, r.e)}
                  height={g.barH}
                  rx={3}
                  className="ex-bar-fast lt-bar-fast lt-query-move"
                  opacity={0}
                />
              </g>
            ) : (
              <rect
                x={g.x(r.s)}
                y={g.barY(i)}
                width={g.w(r.s, r.e)}
                height={g.barH}
                rx={3}
                className={`${isGraph ? 'ex-bar-graph lt-bar-graph' : 'ex-bar'} lt-bar-${i}`}
              />
            )}

            {isQuery ? (
              <>
                <text
                  x={g.x(r.s) + 8}
                  y={g.barY(i) + g.barH - (g.wide ? 3.5 : 2.5)}
                  className="lt-badge-scan"
                  style={{ fill: 'var(--bg)', fontFamily: 'var(--font-mono)', fontSize: g.wide ? 10 : 9.5, fontWeight: 600 }}
                >
                  full scan
                </text>
                <text x={g.x(26) + 6} y={g.barY(i) + g.barH - 3} className="ex-mono ex-text-ok lt-badge-index" style={{ fontSize: 10 }}>
                  index seek
                </text>
                <TableIcon x={g.wide ? 138 : 128} y={g.wide ? g.barY(i) : g.labelY(i) - 10} />
              </>
            ) : null}
          </g>
        )
      })}

      {/* Total */}
      <text x={g.wide ? 12 : g.X0} y={g.wide ? g.totalY + 11 : g.totalY - 8} className="ex-label lt-total-label">
        Page load
      </text>
      <rect x={g.X0} y={g.totalY} width={g.W} height={14} rx={4} className="ex-box-off lt-ghost" />
      <rect x={g.X0} y={g.totalY} width={g.w(0, 100)} height={14} rx={4} className="ex-bar-total lt-total" />
      <text x={g.X1} y={g.wide ? g.totalY - 8 : g.totalY - 8} textAnchor="end" className="ex-mono-fg lt-count-wrap" style={{ fontSize: 13 }}>
        <tspan className="lt-count">70</tspan>% less
      </text>
      <text x={g.X0} y={g.totalY + 32} className="ex-text-sm lt-result-note">
        Two causes, two fixes.
      </text>
    </g>
  )
}

function TableIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="lt-table">
      <rect width={14} height={14} rx={2} className="ex-box-2" style={{ stroke: 'var(--warn)' }} />
      <line x1={0} x2={14} y1={4.5} y2={4.5} stroke="var(--warn)" strokeOpacity={0.6} />
      <line x1={0} x2={14} y1={9} y2={9} stroke="var(--warn)" strokeOpacity={0.6} />
      <line x1={5} x2={5} y1={0} y2={14} stroke="var(--warn)" strokeOpacity={0.6} />
      <rect x={0.5} y={1.5} width={13} height={2.5} className="lt-scanline" fill="var(--warn)" opacity={0} />
    </g>
  )
}

export function LatencyFix({ variant = 'inline' }: { variant?: 'inline' | 'sheet' }) {
  const wide = geometry('wide')
  const tall = geometry('tall')
  return (
    <ExplainerShell
      data={data}
      title="Latency explainer"
      viewBox={{ wide: `0 0 556 ${wide.viewH + 14}`, tall: `0 0 356 ${tall.viewH + 14}` }}
      build={build}
      variant={variant}
      tallBelow={460}
    >
      {(layout) => <Diagram layout={layout} />}
    </ExplainerShell>
  )
}
