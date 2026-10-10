import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { GitCompareArrows } from 'lucide-react'
import { explainers } from '../content/explainers'
import { ExplainerShell, type Layout, type ShellApi } from './ExplainerShell'
import { CheckMark, LockIcon, curve } from './svg'

gsap.registerPlugin(MotionPathPlugin, DrawSVGPlugin)

const data = explainers['renewal-agent']

// Sample data only. Invented IDs and generic professions, nothing resembling a real record.
const CARDS = [
  { id: 'RN-0412', prof: 'Nursing' },
  { id: 'PH-1187', prof: 'Pharmacy' },
  { id: 'DN-0093', prof: 'Dentistry' },
]
const FIELDS = ['CE hours', 'Licence status', 'Discipline', 'Payment']
const RESULT_ROWS = [
  { id: 'RN-0412', status: 'approved' },
  { id: 'PH-1187', status: 'approved' },
  { id: 'DN-0093', status: 'in review' },
  { id: 'MD-2210', status: 'locked' },
]
// Streamed renewals in the route step: 0 = approve, 1 = review. Roughly three in four approve.
const STREAM = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]

type Box = { x: number; y: number; w: number; h: number }

function geometry(layout: Layout) {
  if (layout === 'wide') {
    const cards: Box[] = CARDS.map((_, i) => ({ x: 24, y: 40 + i * 56, w: 160, h: 46 }))
    const fields: Box[] = FIELDS.map((_, i) => ({ x: 220, y: 52 + i * 42, w: 144, h: 30 }))
    const agent: Box = { x: 404, y: 34, w: 260, h: 176 }
    const rules: Box = { x: 404, y: 226, w: 260, h: 176 }
    const merge = { x: 696, y: 218 }
    const exits = {
      approve: { x: 728, y: 46, w: 208, h: 58 },
      review: { x: 728, y: 120, w: 208, h: 58 },
      deny: { x: 728, y: 194, w: 208, h: 58 },
    }
    const counter = { x: 728, y: 300 }
    const result = { x: 24, y: 300, w: 340, rowH: 20, gap: 6 }
    return {
      exitText: {
        approve: ['Approve', 'auto-processed'],
        review: ['Human review', 'a person decides'],
        deny: ['Deny', 'not in the contract'],
      },
      labels: [
        { t: 'Renewals', x: 24, y: 22 },
        { t: 'Fields', x: 220, y: 22 },
        { t: 'Two checks', x: 404, y: 22 },
        { t: 'Exits', x: 728, y: 22 },
      ],
      cards,
      fields,
      agent,
      rules,
      merge,
      exits,
      counter,
      result,
      connectors: fields.map((f) => curve(cards[0].x + cards[0].w, cards[0].y + cards[0].h / 2, f.x, f.y + f.h / 2, 'h')),
      toAgent: fields.map((f) => curve(f.x + f.w, f.y + f.h / 2, agent.x, agent.y + agent.h / 2, 'h')),
      toRules: fields.map((f) => curve(f.x + f.w, f.y + f.h / 2, rules.x, rules.y + rules.h / 2, 'h')),
      agentOut: curve(agent.x + agent.w, agent.y + agent.h / 2, merge.x, merge.y, 'h'),
      rulesOut: curve(rules.x + rules.w, rules.y + rules.h / 2, merge.x, merge.y, 'h'),
      toApprove: curve(merge.x, merge.y, exits.approve.x, exits.approve.y + exits.approve.h / 2, 'h'),
      toReview: curve(merge.x, merge.y, exits.review.x, exits.review.y + exits.review.h / 2, 'h'),
      toDeny: curve(merge.x, merge.y, exits.deny.x, exits.deny.y + exits.deny.h / 2, 'h'),
      contract: ['{', '  "decision":', '  "approve" | "review"', '}'],
      agentSub: 'Claude Sonnet 4.5 via Bedrock',
    }
  }
  const cards: Box[] = CARDS.map((_, i) => ({ x: 10 + i * 117, y: 30, w: 106, h: 46 }))
  const fields: Box[] = FIELDS.map((_, i) => ({ x: 10 + (i % 2) * 175, y: 104 + Math.floor(i / 2) * 36, w: 165, h: 28 }))
  const agent: Box = { x: 10, y: 200, w: 165, h: 176 }
  const rules: Box = { x: 185, y: 200, w: 165, h: 176 }
  const merge = { x: 180, y: 400 }
  const exits = {
    approve: { x: 10, y: 424, w: 110, h: 56 },
    review: { x: 125, y: 424, w: 110, h: 56 },
    deny: { x: 240, y: 424, w: 110, h: 56 },
  }
  return {
    exitText: {
      approve: ['Approve', 'auto-processed'],
      review: ['Review', 'a person'],
      deny: ['Deny', 'not offered'],
    },
    labels: [
      { t: 'Renewals', x: 10, y: 18 },
      { t: 'Fields', x: 10, y: 96 },
      { t: 'Two checks', x: 10, y: 192 },
      { t: 'Exits', x: 10, y: 416 },
    ],
    cards,
    fields,
    agent,
    rules,
    merge,
    exits,
    counter: { x: 10, y: 518 },
    result: { x: 10, y: 620, w: 340, rowH: 20, gap: 6 },
    connectors: fields.map((f) => curve(cards[0].x + cards[0].w / 2, cards[0].y + cards[0].h, f.x + f.w / 2, f.y, 'v')),
    toAgent: fields.map((f) => curve(f.x + f.w / 2, f.y + f.h, agent.x + agent.w / 2, agent.y, 'v')),
    toRules: fields.map((f) => curve(f.x + f.w / 2, f.y + f.h, rules.x + rules.w / 2, rules.y, 'v')),
    agentOut: curve(agent.x + agent.w / 2, agent.y + agent.h, merge.x, merge.y, 'v'),
    rulesOut: curve(rules.x + rules.w / 2, rules.y + rules.h, merge.x, merge.y, 'v'),
    toApprove: curve(merge.x, merge.y, exits.approve.x + exits.approve.w / 2, exits.approve.y, 'v'),
    toReview: curve(merge.x, merge.y, exits.review.x + exits.review.w / 2, exits.review.y, 'v'),
    toDeny: curve(merge.x, merge.y, exits.deny.x + exits.deny.w / 2, exits.deny.y, 'v'),
    contract: ['{ "decision":', '  "approve" |', '  "review" }'],
    agentSub: 'Claude via Bedrock',
  }
}

type G = ReturnType<typeof geometry>

function build(root: SVGSVGElement, layout: Layout) {
  const g = geometry(layout)
  const q = gsap.utils.selector(root)
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // 1. Intake
  tl.addLabel('intake', 0)
  tl.from(q('.rn-card'), { opacity: 0, x: layout === 'wide' ? -24 : 0, y: layout === 'wide' ? 0 : -12, duration: 0.5, stagger: 0.12 }, 'intake')
  tl.from(q('.rn-label'), { opacity: 0, duration: 0.4, stagger: 0.08 }, 'intake')

  // 2. Split
  tl.addLabel('split', 1.4)
  tl.fromTo(q('.rn-card-hl'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 'split')
  tl.fromTo(q('.rn-conn'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, stagger: 0.08, ease: 'power2.inOut' }, 'split+=0.1')
  tl.from(q('.rn-field'), { opacity: 0, x: layout === 'wide' ? -8 : 0, y: layout === 'wide' ? 0 : -6, duration: 0.45, stagger: 0.1 }, 'split+=0.35')

  // 3. Check twice
  tl.addLabel('check', 2.9)
  tl.fromTo(q('.rn-agent-hl, .rn-rules-hl'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 'check')
  g.fields.forEach((_, i) => {
    const at = `check+=${0.1 + i * 0.14}`
    tl.fromTo(q(`.rn-tok-a-${i}`), { opacity: 0 }, { opacity: 1, duration: 0.1 }, at)
      .to(q(`.rn-tok-a-${i}`), { motionPath: { path: g.toAgent[i] }, duration: 0.75, ease: 'power1.inOut' }, at)
      .to(q(`.rn-tok-a-${i}`), { opacity: 0, duration: 0.15 }, `${at}+=0.7`)
    tl.fromTo(q(`.rn-tok-r-${i}`), { opacity: 0 }, { opacity: 1, duration: 0.1 }, at)
      .to(q(`.rn-tok-r-${i}`), { motionPath: { path: g.toRules[i] }, duration: 0.75, ease: 'power1.inOut' }, at)
      .to(q(`.rn-tok-r-${i}`), { opacity: 0, duration: 0.15 }, `${at}+=0.7`)
  })
  tl.from(q('.rn-check'), { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.35, stagger: 0.14, ease: 'back.out(1.2)' }, 'check+=0.8')
  tl.from(q('.rn-agent-think'), { opacity: 0, duration: 0.2 }, 'check+=0.8')
  tl.to(q('.rn-agent-think'), { opacity: 0, duration: 0.2 }, 'check+=1.9')

  // 4. Contract
  tl.addLabel('contract', 5.1)
  tl.fromTo(q('.rn-contract-hl'), { opacity: 0, scaleX: 0, transformOrigin: '0% 50%' }, { opacity: 1, scaleX: 1, duration: 0.5 }, 'contract')
  tl.fromTo(q('.rn-deny'), { opacity: 1 }, { opacity: 0.5, duration: 0.5 }, 'contract+=0.4')
  tl.fromTo(q('.rn-deny-strike'), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }, 'contract+=0.5')
  tl.from(q('.rn-deny-note'), { opacity: 0, duration: 0.4 }, 'contract+=0.8')
  tl.fromTo(q('.rn-deny-wire'), { opacity: 1 }, { opacity: 0.15, duration: 0.4 }, 'contract+=0.5')

  // 5. Route
  tl.addLabel('route', 7.0)
  tl.from(q('.rn-pill'), { opacity: 0, scale: 0.8, transformOrigin: '0% 50%', duration: 0.35, stagger: 0.1, ease: 'back.out(1.2)' }, 'route')
  ;(['.rn-tok-out-a', '.rn-tok-out-r'] as const).forEach((sel, k) => {
    tl.fromTo(q(sel), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 'route+=0.35')
      .to(q(sel), { motionPath: { path: k === 0 ? g.agentOut : g.rulesOut }, duration: 0.55, ease: 'power1.inOut' }, 'route+=0.35')
      .to(q(sel), { opacity: 0, duration: 0.1 }, 'route+=0.85')
  })
  tl.from(q('.rn-merge'), { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(1.2)' }, 'route+=0.8')
  tl.fromTo(q('.rn-tok-main'), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 'route+=0.95')
    .to(q('.rn-tok-main'), { motionPath: { path: g.toApprove }, duration: 0.55, ease: 'power1.inOut' }, 'route+=0.95')
    .to(q('.rn-tok-main'), { opacity: 0, duration: 0.1 }, 'route+=1.45')
  tl.fromTo(q('.rn-approve-hl'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 'route+=1.4')
  STREAM.forEach((lane, i) => {
    const at = `route+=${1.6 + i * 0.09}`
    const sel = q(`.rn-stream-${i}`)
    tl.fromTo(sel, { opacity: 0 }, { opacity: 0.9, duration: 0.05 }, at)
      .to(sel, { motionPath: { path: lane === 0 ? g.toApprove : g.toReview }, duration: 0.45, ease: 'none' }, at)
      .to(sel, { opacity: 0, duration: 0.08 }, `${at}+=0.42`)
  })
  tl.fromTo(q('.rn-count'), { textContent: 0 }, { textContent: 77, snap: { textContent: 1 }, duration: 1.4, ease: 'power1.out' }, 'route+=1.6')
  tl.from(q('.rn-counter'), { opacity: 0, duration: 0.3 }, 'route+=1.5')

  // 6. Scope
  tl.addLabel('scope', 10.0)
  tl.from(q('.rn-row'), { opacity: 0, y: 6, duration: 0.4, stagger: 0.08 }, 'scope')
  tl.from(q('.rn-result-label'), { opacity: 0, duration: 0.3 }, 'scope')
  tl.fromTo(q('.rn-row-locked'), { opacity: 1 }, { opacity: 0.4, duration: 0.4 }, 'scope+=0.6')
  tl.from(q('.rn-lock'), { scale: 0, transformOrigin: '50% 50%', duration: 0.35, ease: 'back.out(1.2)' }, 'scope+=0.6')
  tl.from(q('.rn-lock-note'), { opacity: 0, duration: 0.4 }, 'scope+=0.9')
  tl.to({}, { duration: 0.6 })
  return tl
}

function Diagram({ layout }: { layout: Layout }) {
  const g: G = geometry(layout)
  const wide = layout === 'wide'
  const { agent, rules, exits, merge } = g
  return (
    <g>
      {g.labels.map((l) => (
        <text key={l.t} className="ex-label rn-label" x={l.x} y={l.y}>
          {l.t}
        </text>
      ))}

      {/* Wires sit under everything else */}
      {g.connectors.map((d, i) => (
        <path key={`c${i}`} d={d} className="ex-wire rn-conn" />
      ))}
      {g.toAgent.map((d, i) => (
        <path key={`a${i}`} d={d} className="ex-wire-dash" />
      ))}
      {g.toRules.map((d, i) => (
        <path key={`r${i}`} d={d} className="ex-wire-dash" />
      ))}
      <path d={g.agentOut} className="ex-wire" />
      <path d={g.rulesOut} className="ex-wire" />
      <path d={g.toApprove} className="ex-wire" />
      <path d={g.toReview} className="ex-wire" />
      <path d={g.toDeny} className="ex-wire-dash rn-deny-wire" />

      {/* Intake */}
      {g.cards.map((c, i) => (
        <g key={CARDS[i].id} className="rn-card">
          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={8} className="ex-box" />
          {i === 0 ? <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={8} className="ex-glow rn-card-hl" /> : null}
          <text x={c.x + 12} y={c.y + 19} className="ex-mono-fg">
            {CARDS[i].id}
          </text>
          <text x={c.x + 12} y={c.y + 35} className="ex-text-sm">
            {wide ? `${CARDS[i].prof} renewal` : CARDS[i].prof}
          </text>
        </g>
      ))}

      {/* Fields */}
      {g.fields.map((f, i) => (
        <g key={FIELDS[i]} className="rn-field">
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={6} className="ex-box-2" />
          <circle cx={f.x + 12} cy={f.y + f.h / 2} r={2.5} className="ex-fill-accent-b" />
          <text x={f.x + 22} y={f.y + f.h / 2 + 4} className="ex-mono">
            {FIELDS[i]}
          </text>
        </g>
      ))}

      {/* Agent */}
      <g>
        <rect x={agent.x} y={agent.y} width={agent.w} height={agent.h} rx={10} className="ex-box" />
        <rect x={agent.x} y={agent.y} width={agent.w} height={agent.h} rx={10} className="ex-glow rn-agent-hl" />
        <text x={agent.x + 14} y={agent.y + 22} className="ex-label">
          LLM agent
        </text>
        <text x={agent.x + 14} y={agent.y + 40} className="ex-text-sm">
          {g.agentSub}
        </text>
        <rect x={agent.x + 12} y={agent.y + 52} width={agent.w - 24} height={wide ? 76 : 62} rx={6} className="ex-box-2" />
        {g.contract.map((line, i) => {
          const isEnum = wide ? i === 2 : i === 1 || i === 2
          const y = agent.y + 70 + i * 16
          return (
            <g key={i}>
              {isEnum ? (
                <rect x={agent.x + 18} y={y - 11} width={agent.w - 36} height={15} rx={3} className="ex-box-accent rn-contract-hl" />
              ) : null}
              <text x={agent.x + 22} y={y} className={isEnum ? 'ex-mono-fg' : 'ex-mono'} style={{ whiteSpace: 'pre' }}>
                {line}
              </text>
            </g>
          )
        })}
        <g className="rn-agent-think">
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={agent.x + agent.w - 40 + k * 9} cy={agent.y + 22} r={2} className="ex-fill-muted" />
          ))}
        </g>
        <Pill x={agent.x + 14} y={agent.y + agent.h - 34} tone="ok" text="approve" className="rn-pill" />
      </g>

      {/* Rules */}
      <g>
        <rect x={rules.x} y={rules.y} width={rules.w} height={rules.h} rx={10} className="ex-box" />
        <rect x={rules.x} y={rules.y} width={rules.w} height={rules.h} rx={10} className="ex-glow rn-rules-hl" />
        <text x={rules.x + 14} y={rules.y + 22} className="ex-label">
          Business rules
        </text>
        <text x={rules.x + 14} y={rules.y + 40} className="ex-text-sm">
          Deterministic checks
        </text>
        {FIELDS.map((f, i) => (
          <g key={f}>
            <CheckMark x={rules.x + 22} y={rules.y + 62 + i * 19} className="rn-check" />
            <text x={rules.x + 36} y={rules.y + 66 + i * 19} className="ex-mono">
              {f}
            </text>
          </g>
        ))}
        <g className="rn-rules-approve">
          <Pill x={rules.x + 14} y={rules.y + rules.h - 34} tone="ok" text="approve" className="rn-pill" />
        </g>
        <Pill x={rules.x + 14} y={rules.y + rules.h - 34} tone="warn" text="review" className="rn-rules-review" hidden />
      </g>

      {/* Merge point */}
      <g className="rn-merge">
        <circle cx={merge.x} cy={merge.y} r={7} className="ex-box" />
        <circle cx={merge.x} cy={merge.y} r={3} className="ex-fill-accent-b" />
      </g>
      <g className="rn-neq" opacity={0}>
        <circle cx={merge.x} cy={merge.y} r={10} className="ex-box-warn" />
        <text x={merge.x} y={merge.y + 4} textAnchor="middle" className="ex-mono-fg" style={{ fontSize: 12 }}>
          ≠
        </text>
      </g>

      {/* Exits */}
      <Exit box={exits.approve} tone="ok" text={g.exitText.approve} hlClass="rn-approve-hl" />
      <Exit box={exits.review} tone="warn" text={g.exitText.review} hlClass="rn-review-hl" hlHidden />
      <g className="rn-deny">
        <rect x={exits.deny.x} y={exits.deny.y} width={exits.deny.w} height={exits.deny.h} rx={8} className="ex-box-off" />
        <text x={exits.deny.x + 14} y={exits.deny.y + 25} className="ex-text">
          {g.exitText.deny[0]}
        </text>
        <line
          x1={exits.deny.x + 10}
          x2={exits.deny.x + 50}
          y1={exits.deny.y + 21}
          y2={exits.deny.y + 21}
          className="ex-strike rn-deny-strike"
        />
      </g>
      <text x={exits.deny.x + 14} y={exits.deny.y + 43} className="ex-mono rn-deny-note">
        {g.exitText.deny[1]}
      </text>

      {/* Counter */}
      <g className="rn-counter">
        <text x={g.counter.x} y={g.counter.y} className="ex-label">
          Auto-processed
        </text>
        <text x={g.counter.x} y={g.counter.y + 30} className="ex-num">
          <tspan className="rn-count">77</tspan>
          <tspan className="ex-text-accent">%</tspan>
        </text>
        <text x={g.counter.x} y={g.counter.y + 50} className="ex-text-sm">
          of renewals, no queue
        </text>
      </g>

      {/* Result set and record-level security */}
      <text x={g.result.x} y={g.result.y - 12} className="ex-label rn-result-label">
        Result set, caseworker view
      </text>
      {RESULT_ROWS.map((r, i) => {
        const y = g.result.y + i * (g.result.rowH + g.result.gap)
        const locked = r.status === 'locked'
        return (
          <g key={r.id} className={locked ? 'rn-row rn-row-wrap' : 'rn-row'}>
            <g className={locked ? 'rn-row-locked' : undefined}>
              <rect
                x={g.result.x}
                y={y}
                width={g.result.w}
                height={g.result.rowH}
                rx={4}
                className={locked ? 'ex-box-off' : 'ex-box-2'}
              />
              <text x={g.result.x + 10} y={y + 14} className="ex-mono-fg">
                {locked ? 'MD-••••' : r.id}
              </text>
              <text x={g.result.x + 96} y={y + 14} className={locked ? 'ex-mono' : r.status === 'approved' ? 'ex-mono ex-text-ok' : 'ex-mono ex-text-warn'}>
                {locked ? 'outside your assignment' : r.status}
              </text>
            </g>
            {locked ? <LockIcon x={g.result.x + g.result.w - 22} y={y + 3} className="rn-lock" /> : null}
          </g>
        )
      })}
      <text
        x={g.result.x}
        y={g.result.y + RESULT_ROWS.length * (g.result.rowH + g.result.gap) + 12}
        className="ex-text-sm rn-lock-note"
      >
        Scoped by role and case assignment. Never returned.
      </text>

      {/* Moving tokens, hidden until the timeline uses them */}
      {g.fields.map((_, i) => (
        <g key={`t${i}`}>
          <circle r={3.5} className={`ex-token rn-tok-a-${i}`} opacity={0} />
          <circle r={3.5} className={`ex-token rn-tok-r-${i}`} opacity={0} />
        </g>
      ))}
      <circle r={4} className="ex-token rn-tok-out-a" opacity={0} />
      <circle r={4} className="ex-token rn-tok-out-r" opacity={0} />
      <circle r={4.5} className="ex-token rn-tok-main" opacity={0} />
      <circle r={4.5} className="ex-fill-warn rn-tok-review" opacity={0} />
      {STREAM.map((_, i) => (
        <circle key={`s${i}`} r={2.5} className={`ex-token rn-stream-${i}`} opacity={0} />
      ))}
    </g>
  )
}

function Pill({
  x,
  y,
  tone,
  text,
  className,
  hidden,
}: {
  x: number
  y: number
  tone: 'ok' | 'warn'
  text: string
  className?: string
  hidden?: boolean
}) {
  const w = text.length * 7 + 26
  return (
    <g className={className} opacity={hidden ? 0 : undefined}>
      <rect x={x} y={y} width={w} height={22} rx={11} className={tone === 'ok' ? 'ex-box-ok' : 'ex-box-warn'} />
      <circle cx={x + 11} cy={y + 11} r={3} className={tone === 'ok' ? 'ex-fill-ok' : 'ex-fill-warn'} />
      <text x={x + 19} y={y + 15} className={tone === 'ok' ? 'ex-mono ex-text-ok' : 'ex-mono ex-text-warn'}>
        {text}
      </text>
    </g>
  )
}

function Exit({
  box,
  tone,
  text,
  hlClass,
  hlHidden,
}: {
  box: Box
  tone: 'ok' | 'warn'
  text: string[]
  hlClass: string
  hlHidden?: boolean
}) {
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} className="ex-box" />
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={8}
        className={`${tone === 'ok' ? 'ex-box-ok' : 'ex-box-warn'} ${hlClass}`}
        opacity={hlHidden ? 0 : undefined}
      />
      <circle cx={box.x + 16} cy={box.y + 21} r={3.5} className={tone === 'ok' ? 'ex-fill-ok' : 'ex-fill-warn'} />
      <text x={box.x + 27} y={box.y + 25} className="ex-text">
        {text[0]}
      </text>
      <text x={box.x + 14} y={box.y + 43} className="ex-mono">
        {text[1]}
      </text>
    </g>
  )
}

export function RenewalAgent({ variant = 'inline' }: { variant?: 'inline' | 'sheet' }) {
  const [disagree, setDisagree] = useState(false)
  const dtl = useRef<gsap.core.Timeline | null>(null)
  const apiRef = useRef<ShellApi | null>(null)

  const resetDisagreement = useCallback(() => {
    if (!dtl.current) return
    dtl.current.progress(0).kill()
    dtl.current = null
    setDisagree(false)
    apiRef.current?.setNote(null)
  }, [])

  useEffect(() => () => resetDisagreement(), [resetDisagreement])

  const force = useCallback(
    (api: ShellApi) => {
      const svg = api.getSvg()
      if (!svg) return
      if (disagree) {
        resetDisagreement()
        return
      }
      api.settle()
      const g = geometry(api.layout)
      const q = gsap.utils.selector(svg)
      const t = gsap.timeline({ defaults: { ease: 'power2.out' } })
      t.to(q('.rn-rules-approve'), { opacity: 0, duration: 0.25 })
        .to(q('.rn-rules-review'), { opacity: 1, duration: 0.3 }, '<0.1')
        .to(q('.rn-approve-hl'), { opacity: 0, duration: 0.3 }, '<')
        .to(q('.rn-neq'), { opacity: 1, duration: 0.3 }, '+=0.2')
        .set(q('.rn-tok-review'), { opacity: 1, x: g.merge.x, y: g.merge.y })
        .to(q('.rn-tok-review'), { motionPath: { path: g.toReview }, duration: 0.7, ease: 'power1.inOut' })
        .to(q('.rn-review-hl'), { opacity: 1, duration: 0.3 }, '-=0.1')
        .to(q('.rn-tok-review'), { opacity: 0, duration: 0.2 }, '<')
      if (api.reduced) t.progress(1)
      dtl.current = t
      setDisagree(true)
      api.setNote('The agent says approve, the rules say review. Any disagreement goes to a person.')
    },
    [disagree, resetDisagreement],
  )

  return (
    <ExplainerShell
      data={data}
      title="Renewal agent explainer"
      viewBox={{ wide: '0 0 960 432', tall: '0 0 360 752' }}
      build={build}
      variant={variant}
      tallBelow={720}
      onUserAction={resetDisagreement}
      actions={(api) => {
        apiRef.current = api
        return (
          <button type="button" className="ex-btn ex-btn-text" onClick={() => force(api)} aria-pressed={disagree}>
            <GitCompareArrows size={14} aria-hidden="true" />
            {disagree ? 'Reset' : 'Force a disagreement'}
          </button>
        )
      }}
    >
      {(layout) => <Diagram layout={layout} />}
    </ExplainerShell>
  )
}
