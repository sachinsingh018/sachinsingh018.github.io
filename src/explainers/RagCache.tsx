import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { explainers } from '../content/explainers'
import { ExplainerShell, type Layout } from './ExplainerShell'
import { curve } from './svg'

gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin)

const data = explainers['rag-cache']

/** Relevance of the 5 retrieved chunks, in retrieval order. The rerank sorts them. */
const SCORES = [0.62, 0.95, 0.4, 0.78, 0.5]
const RANK = SCORES.map((s) => SCORES.filter((o) => o > s).length)
const CHUNKS = 6

type Box = { x: number; y: number; w: number; h: number }
const cx = (b: Box) => b.x + b.w / 2
const cy = (b: Box) => b.y + b.h / 2

function geometry(layout: Layout) {
  if (layout === 'wide') {
    const qa = { x: 12, y: 64, w: 140, h: 52 }
    const cacheA = { x: 180, y: 64, w: 104, h: 266 }
    const embed = { x: 312, y: 72, w: 64, h: 36 }
    const pine = { x: 402, y: 60, w: 66, h: 60 }
    const rerank = { x: 494, y: 46, w: 54, h: 90 }
    const api = { x: 470, y: 176, w: 78, h: 48 }
    const ansA = { x: 312, y: 176, w: 134, h: 48 }
    const qb = { x: 12, y: 278, w: 140, h: 52 }
    const mistral = { x: 312, y: 278, w: 134, h: 52 }
    const ansB = { x: 470, y: 278, w: 78, h: 52 }
    const chunk = (i: number) => ({ x: 380 + i * 15, y: 22, w: 12, h: 10 })
    return {
      labels: [
        { t: 'Ask', x: 12, y: 56 },
        { t: 'Ask again', x: 12, y: 270 },
      ],
      qa,
      qb,
      cacheA,
      cacheB: cacheA,
      missPillY: cy(qa) - 11,
      hitPillY: cy(qb) - 11,
      cacheTitle: ['Semantic', 'cache'],
      embed,
      pine,
      rerank,
      api,
      ansA,
      mistral,
      ansB,
      chunk,
      chunkLabel: { x: 352, y: 14, anchor: 'start' as const },
      chunkTarget: { x: cx(pine), y: pine.y + 8 },
      hops: {
        a: [
          `M${qa.x + qa.w} ${cy(qa)} L${cacheA.x} ${cy(qa)}`,
          `M${cacheA.x + cacheA.w} ${cy(qa)} L${embed.x} ${cy(qa)}`,
          `M${embed.x + embed.w} ${cy(qa)} L${pine.x} ${cy(qa)}`,
          `M${pine.x + pine.w} ${cy(qa)} L${rerank.x} ${cy(qa)}`,
          curve(cx(rerank), rerank.y + rerank.h, cx(api), api.y, 'v'),
          `M${api.x} ${cy(api)} L${ansA.x + ansA.w} ${cy(api)}`,
        ],
        history: `M${ansA.x} ${cy(ansA)} L${cacheA.x + cacheA.w} ${cy(ansA)}`,
        b: [
          `M${qb.x + qb.w} ${cy(qb)} L${cacheA.x} ${cy(qb)}`,
          `M${cacheA.x + cacheA.w} ${cy(qb)} L${mistral.x} ${cy(qb)}`,
          `M${mistral.x + mistral.w} ${cy(qb)} L${ansB.x} ${cy(qb)}`,
        ],
      },
      counter: { x: 12, y: 384 },
      apiTwoLine: true,
    }
  }
  const qa = { x: 10, y: 28, w: 160, h: 52 }
  const cacheA = { x: 190, y: 28, w: 160, h: 52 }
  const embed = { x: 190, y: 104, w: 160, h: 32 }
  const pine = { x: 190, y: 160, w: 160, h: 56 }
  const rerank = { x: 190, y: 240, w: 160, h: 72 }
  const api = { x: 190, y: 336, w: 160, h: 40 }
  const ansA = { x: 10, y: 336, w: 160, h: 40 }
  const qb = { x: 10, y: 428, w: 160, h: 52 }
  const cacheB = { x: 190, y: 428, w: 160, h: 52 }
  const mistral = { x: 190, y: 504, w: 160, h: 48 }
  const ansB = { x: 10, y: 504, w: 160, h: 48 }
  const chunk = (i: number) => ({ x: 14 + i * 16, y: 192, w: 12, h: 10 })
  return {
    labels: [
      { t: 'First ask', x: 10, y: 18 },
      { t: 'Ask again', x: 10, y: 418 },
    ],
    qa,
    qb,
    cacheA,
    cacheB,
    missPillY: cacheA.y + 24,
    hitPillY: cacheB.y + 24,
    cacheTitle: ['Semantic cache'],
    embed,
    pine,
    rerank,
    api,
    ansA,
    mistral,
    ansB,
    chunk,
    chunkLabel: { x: 10, y: 182, anchor: 'start' as const },
    chunkTarget: { x: pine.x + 4, y: cy(pine) },
    hops: {
      a: [
        `M${qa.x + qa.w} ${cy(qa)} L${cacheA.x} ${cy(qa)}`,
        `M${cx(cacheA)} ${cacheA.y + cacheA.h} L${cx(embed)} ${embed.y}`,
        `M${cx(embed)} ${embed.y + embed.h} L${cx(pine)} ${pine.y}`,
        `M${cx(pine)} ${pine.y + pine.h} L${cx(rerank)} ${rerank.y}`,
        `M${cx(rerank)} ${rerank.y + rerank.h} L${cx(api)} ${api.y}`,
        `M${api.x} ${cy(api)} L${ansA.x + ansA.w} ${cy(api)}`,
      ],
      history: null as string | null,
      b: [
        `M${qb.x + qb.w} ${cy(qb)} L${cacheB.x} ${cy(qb)}`,
        `M${cx(cacheB)} ${cacheB.y + cacheB.h} L${cx(mistral)} ${mistral.y}`,
        `M${mistral.x} ${cy(mistral)} L${ansB.x + ansB.w} ${cy(mistral)}`,
      ],
    },
    counter: { x: 10, y: 594 },
    apiTwoLine: false,
  }
}

type G = ReturnType<typeof geometry>

function barGeom(g: G, i: number, slot: number) {
  const r = g.rerank
  const top = r.y + 22
  const pitch = (r.h - 30) / 5
  const maxW = r.w - 16
  return { x: r.x + 8, y: top + slot * pitch, w: Math.max(6, SCORES[i] * maxW), h: Math.max(4, pitch - 4) }
}

function hop(tl: gsap.core.Timeline, q: (s: string) => Element[], cls: string, path: string, at: string, dur = 0.45) {
  tl.fromTo(q(cls), { opacity: 0 }, { opacity: 1, duration: 0.06 }, at)
    .to(q(cls), { motionPath: { path }, duration: dur, ease: 'power1.inOut' }, at)
    .to(q(cls), { opacity: 0, duration: 0.08 }, `${at}+=${dur - 0.04}`)
}

function build(root: SVGSVGElement, layout: Layout) {
  const g = geometry(layout)
  const q = gsap.utils.selector(root)
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // 1. Ingest, ahead of time
  tl.addLabel('ingest', 0)
  tl.from(q('.rg-node'), { opacity: 0, duration: 0.4, stagger: 0.04 }, 'ingest')
  tl.from(q('.rg-chunk'), { opacity: 0, y: -6, duration: 0.3, stagger: 0.06 }, 'ingest+=0.2')
  tl.from(q('.rg-chunk-label'), { opacity: 0, duration: 0.3 }, 'ingest+=0.2')
  for (let i = 0; i < CHUNKS; i++) {
    const c = g.chunk(i)
    const path = `M${c.x + c.w / 2} ${c.y + c.h / 2} L${g.chunkTarget.x} ${g.chunkTarget.y}`
    hop(tl, q, `.rg-ingest-${i}`, path, `ingest+=${0.75 + i * 0.07}`, 0.5)
  }
  tl.fromTo(q('.rg-pine-hl'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 'ingest+=1.1')
  tl.to(q('.rg-pine-hl'), { opacity: 0, duration: 0.35 }, 'ingest+=1.6')

  // 2. Ask
  tl.addLabel('ask', 2.2)
  tl.from(q('.rg-qa'), { opacity: 0, x: -10, duration: 0.5 }, 'ask')

  // 3. Cache miss
  tl.addLabel('miss', 3.0)
  hop(tl, q, '.rg-ta-0', g.hops.a[0], 'miss')
  tl.fromTo(q('.rg-cache-hl'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 'miss+=0.4')
  tl.from(q('.rg-pill-miss'), { opacity: 0, scale: 0.8, transformOrigin: '0% 50%', duration: 0.3, ease: 'back.out(1.2)' }, 'miss+=0.5')
  tl.to(q('.rg-cache-hl'), { opacity: 0, duration: 0.3 }, 'miss+=1.0')

  // 4. Retrieve
  tl.addLabel('retrieve', 4.2)
  hop(tl, q, '.rg-ta-1', g.hops.a[1], 'retrieve', 0.4)
  tl.fromTo(q('.rg-embed-hl'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 'retrieve+=0.35')
  tl.to(q('.rg-embed-hl'), { opacity: 0, duration: 0.3 }, 'retrieve+=0.8')
  hop(tl, q, '.rg-ta-2', g.hops.a[2], 'retrieve+=0.45', 0.4)
  tl.to(q('.rg-pine-hl'), { opacity: 1, duration: 0.2 }, 'retrieve+=0.8')
  tl.to(q('.rg-pine-hl'), { opacity: 0, duration: 0.3 }, 'retrieve+=1.3')
  hop(tl, q, '.rg-ta-3', g.hops.a[3], 'retrieve+=0.9', 0.4)
  tl.from(q('.rg-bar'), { scaleX: 0, transformOrigin: '0% 50%', duration: 0.35, stagger: 0.07 }, 'retrieve+=1.2')
  tl.from(q('.rg-top5'), { opacity: 0, duration: 0.3 }, 'retrieve+=1.2')

  // 5. Rerank
  tl.addLabel('rerank', 6.0)
  tl.fromTo(q('.rg-rerank-hl'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 'rerank')
  SCORES.forEach((_, i) => {
    const from = barGeom(g, i, i)
    const to = barGeom(g, i, RANK[i])
    tl.to(q(`.rg-bar-${i}`), { y: to.y - from.y, duration: 0.6, ease: 'power2.inOut' }, 'rerank+=0.2')
  })
  tl.to(q('.rg-bar-best'), { opacity: 1, duration: 0.3 }, 'rerank+=0.75')
  tl.to(q('.rg-rerank-hl'), { opacity: 0, duration: 0.3 }, 'rerank+=1.1')

  // 6. Answer with the paid API
  tl.addLabel('answer', 7.4)
  hop(tl, q, '.rg-ta-4', g.hops.a[4], 'answer', 0.4)
  tl.fromTo(q('.rg-api-hl'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 'answer+=0.35')
  tl.fromTo(q('.rg-calls'), { textContent: 0 }, { textContent: 1, snap: { textContent: 1 }, duration: 0.1 }, 'answer+=0.4')
  tl.from(q('.rg-counter'), { opacity: 0, duration: 0.3 }, 'answer+=0.35')
  tl.to(q('.rg-api-hl'), { opacity: 0, duration: 0.3 }, 'answer+=1.0')
  hop(tl, q, '.rg-ta-5', g.hops.a[5], 'answer+=0.6', 0.4)
  tl.from(q('.rg-ans-a'), { opacity: 0, x: 8, duration: 0.4 }, 'answer+=0.95')
  if (g.hops.history) {
    tl.fromTo(q('.rg-history'), { drawSVG: '100% 100%' }, { drawSVG: '0% 100%', duration: 0.5, ease: 'power2.inOut' }, 'answer+=1.3')
    hop(tl, q, '.rg-th', g.hops.history, 'answer+=1.3', 0.5)
  }

  // 7. Ask again
  tl.addLabel('again', 9.6)
  tl.from(q('.rg-qb'), { opacity: 0, x: -10, duration: 0.5 }, 'again')

  // 8. Cache hit, served locally
  tl.addLabel('hit', 10.4)
  hop(tl, q, '.rg-tb-0', g.hops.b[0], 'hit')
  tl.fromTo(q('.rg-cache-hl'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 'hit+=0.4')
  tl.from(q('.rg-pill-hit'), { opacity: 0, scale: 0.8, transformOrigin: '0% 50%', duration: 0.3, ease: 'back.out(1.2)' }, 'hit+=0.5')
  tl.fromTo(q('.rg-api'), { opacity: 1 }, { opacity: 0.4, duration: 0.4 }, 'hit+=0.55')
  tl.fromTo(q('.rg-api-strike'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.35 }, 'hit+=0.6')
  tl.from(q('.rg-skipped'), { opacity: 0, duration: 0.3 }, 'hit+=0.75')
  hop(tl, q, '.rg-tb-1', g.hops.b[1], 'hit+=0.8', 0.4)
  tl.fromTo(q('.rg-mistral-hl'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, 'hit+=1.15')
  hop(tl, q, '.rg-tb-2', g.hops.b[2], 'hit+=1.4', 0.4)
  tl.from(q('.rg-ans-b'), { opacity: 0, x: layout === 'wide' ? -8 : 8, duration: 0.4 }, 'hit+=1.75')
  tl.from(q('.rg-counter-note'), { opacity: 0, duration: 0.4 }, 'hit+=1.9')
  tl.to({}, { duration: 0.7 })
  return tl
}

function NodeBox({ b, hl, className, children }: { b: Box; hl?: string; className?: string; children?: React.ReactNode }) {
  return (
    <g className={className}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} className="ex-box" />
      {hl ? <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} className={`ex-glow ${hl}`} opacity={0} /> : null}
      {children}
    </g>
  )
}

function Pill({ x, y, tone, text, className }: { x: number; y: number; tone: 'ok' | 'warn'; text: string; className: string }) {
  const w = text.length * 7 + 26
  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={22} rx={11} className={tone === 'ok' ? 'ex-box-ok' : 'ex-box-warn'} />
      <circle cx={x + 11} cy={y + 11} r={3} className={tone === 'ok' ? 'ex-fill-ok' : 'ex-fill-warn'} />
      <text x={x + 19} y={y + 15} className={tone === 'ok' ? 'ex-mono ex-text-ok' : 'ex-mono ex-text-warn'}>
        {text}
      </text>
    </g>
  )
}

function Diagram({ layout }: { layout: Layout }) {
  const g = geometry(layout)
  const wide = layout === 'wide'
  const best = SCORES.indexOf(Math.max(...SCORES))
  const sameCache = g.cacheA === g.cacheB

  return (
    <g>
      {g.labels.map((l) => (
        <text key={l.t} x={l.x} y={l.y} className="ex-label">
          {l.t}
        </text>
      ))}

      {/* Wires */}
      {g.hops.a.map((d, i) => (
        <path key={`wa${i}`} d={d} className="ex-wire" />
      ))}
      {g.hops.b.map((d, i) => (
        <path key={`wb${i}`} d={d} className="ex-wire" />
      ))}
      {g.hops.history ? <path d={g.hops.history} className="ex-wire-dash" /> : null}
      {g.hops.history ? <path d={g.hops.history} className="ex-wire-accent rg-history" style={{ strokeWidth: 1 }} /> : null}

      {/* Ingest */}
      <text x={g.chunkLabel.x} y={g.chunkLabel.y} textAnchor={g.chunkLabel.anchor} className="ex-mono rg-chunk-label" style={{ fontSize: 10 }}>
        256-token chunks, ada-002
      </text>
      {Array.from({ length: CHUNKS }, (_, i) => {
        const c = g.chunk(i)
        return <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx={2} className="ex-box-accent rg-chunk" />
      })}

      {/* Question A */}
      <g className="rg-qa">
        <rect x={g.qa.x} y={g.qa.y} width={g.qa.w} height={g.qa.h} rx={10} className="ex-box-2" />
        <text x={g.qa.x + 12} y={g.qa.y + 22} className="ex-text">
          Which alumni work
        </text>
        <text x={g.qa.x + 12} y={g.qa.y + 38} className="ex-text">
          in fintech?
        </text>
      </g>

      {/* Cache */}
      {[g.cacheA, ...(sameCache ? [] : [g.cacheB])].map((b, k) => (
        <NodeBox key={k} b={b} hl="rg-cache-hl" className="rg-node">
          {g.cacheTitle.map((t, i) =>
            sameCache ? (
              // Tall shared cache: title sits in the middle, between the two asks.
              <text key={t} x={cx(b)} y={cy(b) - 4 + i * 13} textAnchor="middle" className="ex-label">
                {t}
              </text>
            ) : (
              <text key={t} x={b.x + 12} y={b.y + 18 + i * 13} className="ex-label">
                {t}
              </text>
            ),
          )}
        </NodeBox>
      ))}
      <Pill x={g.cacheA.x + (wide ? 12 : g.cacheA.w - 66)} y={g.missPillY} tone="warn" text="miss" className="rg-pill-miss" />
      <Pill x={g.cacheB.x + (wide ? 12 : g.cacheB.w - 59)} y={g.hitPillY} tone="ok" text="hit" className="rg-pill-hit" />

      {/* Embed */}
      <NodeBox b={g.embed} hl="rg-embed-hl" className="rg-node">
        <text x={cx(g.embed)} y={cy(g.embed) + 4} textAnchor="middle" className="ex-mono-fg">
          embed
        </text>
      </NodeBox>

      {/* Pinecone */}
      <g className="rg-node">
        <Cylinder b={g.pine} />
        <Cylinder b={g.pine} glow className="rg-pine-hl" />
        <text x={cx(g.pine)} y={g.pine.y + g.pine.h / 2 + 8} textAnchor="middle" className="ex-mono-fg" style={{ fontSize: wide ? 10.5 : 11 }}>
          Pinecone
        </text>
      </g>

      {/* Rerank */}
      <NodeBox b={g.rerank} hl="rg-rerank-hl" className="rg-node">
        <text x={g.rerank.x + 8} y={g.rerank.y + 14} className="ex-label" style={{ fontSize: 9 }}>
          rerank
        </text>
        <text x={g.rerank.x + g.rerank.w - 8} y={g.rerank.y + 14} textAnchor="end" className="ex-mono rg-top5" style={{ fontSize: 9 }}>
          {wide ? '' : 'top 5'}
        </text>
        {SCORES.map((_, i) => {
          const b = barGeom(g, i, i)
          return (
            <g key={i} className={`rg-bar rg-bar-${i}`}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={2} className="ex-bar" />
              {i === best ? <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={2} className="ex-fill-accent rg-bar-best" opacity={0} /> : null}
            </g>
          )
        })}
      </NodeBox>

      {/* Paid API */}
      <g className="rg-api">
        <NodeBox b={g.api} hl="rg-api-hl" className="rg-node">
          <text x={g.api.x + 10} y={g.api.y + (g.apiTwoLine ? 21 : 25)} className="ex-text">
            Paid API
          </text>
          <text
            x={g.apiTwoLine ? g.api.x + 10 : g.api.x + g.api.w - 10}
            y={g.api.y + (g.apiTwoLine ? 37 : 25)}
            textAnchor={g.apiTwoLine ? 'start' : 'end'}
            className="ex-mono"
          >
            OpenAI
          </text>
        </NodeBox>
        <line
          x1={g.api.x + 8}
          x2={g.api.x + 66}
          y1={g.api.y + (g.apiTwoLine ? 17 : 21)}
          y2={g.api.y + (g.apiTwoLine ? 17 : 21)}
          className="ex-strike rg-api-strike"
        />
      </g>
      <text
        x={wide ? g.api.x + g.api.w : g.api.x + g.api.w}
        y={g.api.y + g.api.h + 14}
        textAnchor="end"
        className="ex-mono rg-skipped"
        style={{ fill: 'var(--danger)' }}
      >
        skipped on repeat
      </text>

      {/* Answer A */}
      <AnswerBox b={g.ansA} className="rg-ans-a" />

      {/* Question B */}
      <g className="rg-qb">
        <rect x={g.qb.x} y={g.qb.y} width={g.qb.w} height={g.qb.h} rx={10} className="ex-box-2" />
        <text x={g.qb.x + 12} y={g.qb.y + 22} className="ex-text">
          Any alumni in
        </text>
        <text x={g.qb.x + 12} y={g.qb.y + 38} className="ex-text">
          fintech roles?
        </text>
      </g>

      {/* Mistral */}
      <NodeBox b={g.mistral} hl="rg-mistral-hl" className="rg-node">
        <text x={g.mistral.x + 12} y={g.mistral.y + 22} className="ex-text">
          Mistral 7B
        </text>
        <text x={g.mistral.x + 12} y={g.mistral.y + 38} className="ex-mono">
          LoRA on vLLM
        </text>
      </NodeBox>

      {/* Answer B */}
      <AnswerBox b={g.ansB} className="rg-ans-b" local />

      {/* Paid call counter */}
      <g className="rg-counter">
        <text x={g.counter.x} y={g.counter.y} className="ex-label">
          Paid API calls
        </text>
        <text x={g.counter.x} y={g.counter.y + 30} className="ex-num">
          <tspan className="rg-calls">1</tspan>
        </text>
      </g>
      <text x={g.counter.x + 28} y={g.counter.y + 26} className="ex-text-sm rg-counter-note">
        The reworded repeat was served locally.
      </text>

      {/* Tokens */}
      {Array.from({ length: CHUNKS }, (_, i) => (
        <circle key={`i${i}`} r={2.5} className={`ex-token rg-ingest-${i}`} opacity={0} />
      ))}
      {g.hops.a.map((_, i) => (
        <circle key={`ta${i}`} r={4} className={`ex-token rg-ta-${i}`} opacity={0} />
      ))}
      {g.hops.b.map((_, i) => (
        <circle key={`tb${i}`} r={4} className={`ex-token rg-tb-${i}`} opacity={0} />
      ))}
      <circle r={3} className="ex-token rg-th" opacity={0} />
    </g>
  )
}

function AnswerBox({ b, className, local }: { b: Box; className: string; local?: boolean }) {
  const lineW = b.w - 24
  return (
    <g className={className}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} className={local ? 'ex-box-ok' : 'ex-box-accent'} />
      <text x={b.x + 12} y={b.y + 19} className="ex-text">
        Answer
      </text>
      <rect x={b.x + 12} y={b.y + 26} width={lineW} height={3.5} rx={1.75} className="ex-fill-muted" opacity={0.6} />
      {b.h > 44 ? <rect x={b.x + 12} y={b.y + 34} width={lineW * 0.6} height={3.5} rx={1.75} className="ex-fill-muted" opacity={0.6} /> : null}
    </g>
  )
}

function Cylinder({ b, glow, className }: { b: Box; glow?: boolean; className?: string }) {
  const rx = b.w / 2
  const ry = Math.min(8, b.h / 6)
  const x = b.x
  const top = b.y + ry
  const bottom = b.y + b.h - ry
  const d = `M${x} ${top} L${x} ${bottom} A${rx} ${ry} 0 0 0 ${x + b.w} ${bottom} L${x + b.w} ${top}`
  return (
    <g className={className} opacity={glow ? 0 : undefined}>
      <path d={d} className={glow ? 'ex-glow' : 'ex-box'} />
      <ellipse cx={x + rx} cy={top} rx={rx} ry={ry} className={glow ? 'ex-glow' : 'ex-box-2'} />
    </g>
  )
}

export function RagCache({ variant = 'inline' }: { variant?: 'inline' | 'sheet' }) {
  return (
    <ExplainerShell
      data={data}
      title="Semantic cache explainer"
      viewBox={{ wide: '0 0 560 430', tall: '0 0 360 640' }}
      build={build}
      variant={variant}
      tallBelow={460}
    >
      {(layout) => <Diagram layout={layout} />}
    </ExplainerShell>
  )
}
