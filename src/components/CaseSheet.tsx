import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, X } from 'lucide-react'
import { work, type CaseStudy, type CaseStudyId } from '../content/site'
import { explainers } from '../content/explainers'
import { LazyExplainer } from '../explainers/LazyExplainer'
import { getLenis } from '../lib/lenis'
import { sentenceLines } from '../lib/text'

type Props = { openId: CaseStudyId | null; onClose: () => void; onOpen: (id: CaseStudyId) => void }

const EASE = [0.23, 1, 0.32, 1] as const

export function CaseSheet({ openId, onClose, onOpen }: Props) {
  const study = work.cases.find((c) => c.id === openId) ?? null
  return <AnimatePresence>{study ? <Sheet key={study.id} study={study} onClose={onClose} onOpen={onOpen} /> : null}</AnimatePresence>
}

function Sheet({ study, onClose, onOpen }: { study: CaseStudy; onClose: () => void; onOpen: Props['onOpen'] }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const steps = explainers[study.id].steps
  const idx = work.cases.findIndex((c) => c.id === study.id)
  const next = work.cases[(idx + 1) % work.cases.length]
  const titleId = `sheet-${study.id}-title`

  // Modal behaviour: lock page scroll, make the page inert, trap focus, Esc closes, restore focus.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const page = document.querySelectorAll<HTMLElement>('[data-page-root]')
    page.forEach((el) => el.setAttribute('inert', ''))
    const lenis = getLenis()
    lenis?.stop()
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      page.forEach((el) => el.removeAttribute('inert'))
      document.documentElement.style.overflow = prevOverflow
      lenis?.start()
      const target =
        document.querySelector<HTMLElement>(`[data-case-opener="${study.id}"]`) ?? (opener?.isConnected ? opener : null)
      target?.focus({ preventScroll: true })
    }
  }, [onClose, study.id])

  return (
    <div className="fixed inset-0 z-[70]" role="presentation">
      <motion.div
        className="absolute inset-0 bg-[color-mix(in_oklab,var(--bg)_70%,transparent)] backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-0 p-2 sm:p-4 md:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="pointer-events-auto relative mx-auto h-full max-w-[76rem]"
        >
          <motion.div
            layoutId={`surface-${study.id}`}
            className="absolute inset-0 rounded-2xl border border-line-strong bg-surface shadow-2xl"
            transition={{ duration: 0.5, ease: EASE }}
          />
          <div className="relative h-full overflow-y-auto overscroll-contain rounded-2xl" data-lenis-prevent>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-[color-mix(in_oklab,var(--surface)_85%,transparent)] px-5 py-3 backdrop-blur-md sm:px-8">
              <p className="kicker truncate">
                {study.fig} <span className="text-line-strong">/</span> {study.org} <span className="text-line-strong">/</span>{' '}
                {study.context}
              </p>
              <button ref={closeRef} type="button" onClick={onClose} className="ex-btn" aria-label="Close case study">
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="px-5 pb-12 pt-8 sm:px-8 md:px-12 md:pt-10">
              <motion.h2
                layoutId={`title-${study.id}`}
                id={titleId}
                className="max-w-[24ch] font-display text-[clamp(1.9rem,1.3rem+2vw,3rem)] font-medium leading-[1.05] tracking-[-0.035em] text-fg"
                transition={{ duration: 0.5, ease: EASE }}
              >
                {sentenceLines(study.title)}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.18 }}
              >
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <Fact label="Problem" className="md:col-span-2">
                    <p className="m-0 text-lg text-fg">{study.problem}</p>
                  </Fact>
                  <Fact label="Result">
                    {study.result.value ? (
                      <p className="m-0 flex items-baseline gap-3">
                        <span className="num text-[2rem] font-medium leading-none text-fg">{study.result.value}</span>
                        <span className="text-sm leading-snug text-muted">{study.result.label}</span>
                      </p>
                    ) : (
                      <p className="m-0 text-lg text-fg">{study.result.label}</p>
                    )}
                  </Fact>
                </div>

                <div className={`mt-10 ${study.size === 'large' ? '' : 'mx-auto max-w-[46rem]'}`}>
                  <LazyExplainer id={study.id} variant="sheet" />
                </div>

                <div className="mt-12 grid gap-8 border-t border-line pt-8 md:grid-cols-3">
                  <Fact label="How it works" className="md:col-span-2">
                    <ol className="m-0 grid list-none gap-3 p-0">
                      {steps.map((s, i) => (
                        <li key={s.id} className="flex gap-4 text-muted">
                          <span className="num mt-[3px] text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                          <span>
                            <span className="text-fg">{s.label}.</span> {s.caption}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Fact>
                  <div className="grid content-start gap-8">
                    <Fact label="Stack">
                      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                        {study.stack.map((t) => (
                          <li key={t} className="chip">
                            {t}
                          </li>
                        ))}
                      </ul>
                    </Fact>
                    {study.gotWrongFirst ? (
                      <Fact label="What I got wrong first">
                        <p className="m-0 text-muted">{study.gotWrongFirst}</p>
                      </Fact>
                    ) : null}
                  </div>
                </div>

                <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                  <p className="m-0 font-mono text-xs text-subtle">
                    Simplified illustration. No client data, screens or records are shown.
                  </p>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpen(next.id)}>
                    Next: {next.title}
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Fact({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="kicker mb-3">{label}</p>
      {children}
    </div>
  )
}
