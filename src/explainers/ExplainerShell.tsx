import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { ExplainerData } from '../content/explainers'
import { useReducedMotion } from '../hooks/useReducedMotion'

export type Layout = 'wide' | 'tall'

export type ShellApi = {
  /** Pause the main timeline and jump to its final state. */
  settle: () => void
  reduced: boolean
  layout: Layout
  /** Lets an explainer show a temporary caption, e.g. for an interactive moment. */
  setNote: (note: string | null) => void
  getSvg: () => SVGSVGElement | null
}

type Props = {
  data: ExplainerData
  title: string
  viewBox: Record<Layout, string>
  /** Build a paused timeline with one label per step id, in order. */
  build: (root: SVGSVGElement, layout: Layout) => gsap.core.Timeline
  children: (layout: Layout) => ReactNode
  variant?: 'inline' | 'sheet'
  /** Container width below which the tall layout is used. */
  tallBelow?: number
  autoplay?: boolean
  actions?: (api: ShellApi) => ReactNode
  /** Called before any play, replay or step action by the visitor. */
  onUserAction?: () => void
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function ExplainerShell({
  data,
  title,
  viewBox,
  build,
  children,
  variant = 'inline',
  tallBelow = 560,
  autoplay = true,
  actions,
  onUserAction,
}: Props) {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const labelTimes = useRef<number[]>([])
  const hasAutoplayed = useRef(false)
  const resumeOnView = useRef(false)

  const [layout, setLayout] = useState<Layout>('wide')
  const [step, setStep] = useState(data.steps.length - 1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<1 | 2>(1)
  const [note, setNote] = useState<string | null>(null)
  const [interacted, setInteracted] = useState(false)
  const uid = useId()

  const steps = data.steps
  const last = steps.length - 1

  // Pick a layout from the container width, not the viewport, so cards and sheets each fit.
  useIsoLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const pick = (w: number) => setLayout(w < tallBelow ? 'tall' : 'wide')
    pick(el.getBoundingClientRect().width)
    const ro = new ResizeObserver(([entry]) => pick(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [tallBelow])

  const stepAt = useCallback(
    (time: number) => {
      const times = labelTimes.current
      let i = 0
      for (let k = 0; k < times.length; k++) if (time >= times[k] - 0.001) i = k
      return Math.min(i, last)
    },
    [last],
  )

  // Build (and rebuild on layout change) the timeline.
  useIsoLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const ctx = gsap.context(() => {
      const tl = build(svg, layout)
      tl.pause()
      labelTimes.current = steps.map((s) => tl.labels[s.id] ?? 0)
      tl.eventCallback('onUpdate', () => {
        if (fillRef.current) fillRef.current.style.transform = `scaleX(${tl.progress()})`
        const i = stepAt(tl.time())
        setStep((prev) => (prev === i ? prev : i))
      })
      tl.eventCallback('onComplete', () => setPlaying(false))
      tlRef.current = tl
      // Start from the final state until autoplay or the visitor starts it.
      const startAtEnd = reduced || hasAutoplayed.current
      tl.progress(startAtEnd ? 1 : 0)
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${tl.progress()})`
      setStep(startAtEnd ? last : 0)
      setPlaying(false)
    }, svg)
    return () => {
      tweenRef.current?.kill()
      ctx.revert()
      tlRef.current = null
    }
    // build is stable per explainer; only layout and reduced motion trigger a rebuild.
  }, [layout, reduced])

  useEffect(() => {
    tlRef.current?.timeScale(speed)
    tweenRef.current?.timeScale(speed)
  }, [speed])

  const killTween = () => {
    tweenRef.current?.kill()
    tweenRef.current = null
  }

  const play = useCallback(() => {
    const tl = tlRef.current
    if (!tl) return
    killTween()
    setNote(null)
    if (reduced) {
      tl.progress(1)
      return
    }
    if (tl.progress() >= 0.999) tl.restart()
    else tl.play()
    setPlaying(true)
  }, [reduced])

  const pause = useCallback(() => {
    killTween()
    tlRef.current?.pause()
    setPlaying(false)
  }, [])

  const replay = useCallback(() => {
    const tl = tlRef.current
    if (!tl) return
    setInteracted(true)
    onUserAction?.()
    killTween()
    setNote(null)
    if (reduced) {
      tl.progress(1)
      return
    }
    tl.restart()
    setPlaying(true)
  }, [reduced, onUserAction])

  const goTo = useCallback(
    (i: number) => {
      const tl = tlRef.current
      if (!tl) return
      setInteracted(true)
      onUserAction?.()
      setNote(null)
      const idx = Math.max(0, Math.min(last, i))
      const start = labelTimes.current[idx]
      const end = idx < last ? labelTimes.current[idx + 1] : tl.duration()
      killTween()
      tl.pause()
      if (reduced) {
        tl.seek(Math.max(start, end - 0.001))
        setStep(idx)
        return
      }
      tl.seek(start)
      setStep(idx)
      setPlaying(true)
      tweenRef.current = tl.tweenTo(end, {
        onComplete: () => setPlaying(false),
      })
      tweenRef.current.timeScale(speed)
    },
    [last, reduced, speed, onUserAction],
  )

  const toggle = useCallback(() => {
    setInteracted(true)
    if (playing) pause()
    else {
      onUserAction?.()
      play()
    }
  }, [playing, pause, play, onUserAction])

  // Autoplay once when 40% visible; pause while off screen and resume on return.
  useEffect(() => {
    const el = rootRef.current
    if (!el || !autoplay || reduced) return
    const io = new IntersectionObserver(
      ([entry]) => {
        const tl = tlRef.current
        if (!tl) return
        if (entry.isIntersecting) {
          if (!hasAutoplayed.current) {
            hasAutoplayed.current = true
            tl.restart()
            setPlaying(true)
          } else if (resumeOnView.current) {
            resumeOnView.current = false
            if (tweenRef.current) tweenRef.current.resume()
            else tl.resume()
            setPlaying(true)
          }
        } else if (tl.isActive() || tweenRef.current?.isActive()) {
          resumeOnView.current = true
          tweenRef.current?.pause()
          tl.pause()
          setPlaying(false)
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [autoplay, reduced])

  const settle = useCallback(() => {
    killTween()
    const tl = tlRef.current
    if (tl) {
      tl.pause()
      tl.progress(1)
    }
    setStep(last)
    setPlaying(false)
  }, [last])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement
    const onButton = target.tagName === 'BUTTON'
    if (e.key === ' ' && !onButton) {
      e.preventDefault()
      toggle()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      goTo(step + 1 > last ? 0 : step + 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      goTo(step - 1 < 0 ? last : step - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      goTo(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      settle()
    }
  }

  const current = steps[step]
  const isSheet = variant === 'sheet'
  const captionId = `${uid}-caption`

  return (
    <figure
      ref={rootRef}
      className="explainer group/ex relative m-0 outline-none"
      role="group"
      aria-roledescription="explainer"
      aria-label={`${title}. Space plays or pauses, arrow keys move between steps.`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-layout={layout}
    >
      <div className="ex-frame relative overflow-hidden rounded-xl border border-line bg-raised">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 py-2.5">
          <span className="kicker !text-[0.65rem] !tracking-[0.08em]">Simplified illustration</span>
          <span className="num text-[0.7rem] text-subtle" aria-hidden="true">
            {String(step + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </span>
        </div>
        <svg
          ref={svgRef}
          viewBox={viewBox[layout]}
          className="ex-svg block h-auto w-full"
          role="img"
          aria-label={data.summary}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="ex-accent" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="var(--accent-a)" />
              <stop offset="1" stopColor="var(--accent-b)" />
            </linearGradient>
            <pattern id="ex-dots" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.9" className="ex-dot" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ex-dots)" />
          {children(layout)}
        </svg>
      </div>

      <div className={`mt-3 flex min-h-[3.25rem] gap-3 ${isSheet ? 'sm:min-h-[2.5rem]' : ''}`}>
        <span className="num mt-[3px] shrink-0 text-xs text-accent" aria-hidden="true">
          {String(step + 1).padStart(2, '0')}
        </span>
        <p
          id={captionId}
          className="ex-caption m-0 font-mono text-[0.8125rem] leading-relaxed text-muted"
          aria-live={interacted ? 'polite' : 'off'}
        >
          <span className="text-fg">{note ? 'Try it' : current.label}.</span>{' '}
          <span key={note ?? current.id} className="ex-caption-text">
            {note ?? current.caption}
          </span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="ex-btn"
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          aria-pressed={playing}
          disabled={reduced}
          title={reduced ? 'Animation is off because reduced motion is on' : undefined}
        >
          {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
        </button>
        <button type="button" className="ex-btn" onClick={replay} aria-label="Replay from the start">
          <RotateCcw size={14} aria-hidden="true" />
        </button>

        <div className="relative min-w-0 flex-1">
          <div className="ex-track" aria-hidden="true">
            <div ref={fillRef} className="ex-track-fill" />
          </div>
          <div className="relative flex" role="tablist" aria-label="Steps">
            {steps.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === step}
                aria-controls={captionId}
                tabIndex={i === step ? 0 : -1}
                className="ex-step"
                data-done={i < step || undefined}
                data-active={i === step || undefined}
                onClick={() => goTo(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    goTo(i)
                  }
                }}
              >
                <span className="ex-tick" aria-hidden="true" />
                <span className={isSheet && layout === 'wide' ? 'ex-step-label' : 'sr-only'}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="ex-btn num !w-auto px-2.5 text-[0.7rem]"
          onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
          aria-label={`Playback speed ${speed}x. Switch to ${speed === 1 ? 2 : 1}x`}
          disabled={reduced}
        >
          {speed}x
        </button>
      </div>

      {actions ? (
        <div className="mt-3">{actions({ settle, reduced, layout, setNote, getSvg: () => svgRef.current })}</div>
      ) : null}

      <ol className={reduced ? 'ex-steplist mt-4' : 'sr-only'}>
        {steps.map((s, i) => (
          <li key={s.id}>
            <span className="num text-accent">{String(i + 1).padStart(2, '0')}</span>{' '}
            <span className="text-fg">{s.label}.</span> {s.caption}
          </li>
        ))}
      </ol>
    </figure>
  )
}
