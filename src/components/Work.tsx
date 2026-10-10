import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { work, type CaseStudy } from '../content/site'
import { explainerFor } from '../explainers/registry'
import { useSpotlight } from '../hooks/useSpotlight'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'

type Props = { onOpen: (id: CaseStudy['id']) => void; openId: CaseStudy['id'] | null }

export function Work({ onOpen, openId }: Props) {
  return (
    <section id="work" aria-labelledby="work-h" className="relative z-[1] scroll-mt-16 py-24 md:py-36">
      <div className="container-page">
        <SectionHeader id="work-h" kicker={work.kicker} heading={work.heading} sub={work.sub} />
        <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-12">
          {work.cases.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.06} className={c.size === 'large' ? 'lg:col-span-12' : 'lg:col-span-6'}>
              <CaseCard study={c} onOpen={onOpen} hidden={openId === c.id} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function CaseCard({ study, onOpen, hidden }: { study: CaseStudy; onOpen: Props['onOpen']; hidden: boolean }) {
  const spot = useSpotlight<HTMLElement>()
  const Explainer = explainerFor[study.id]
  const large = study.size === 'large'
  const titleId = `case-${study.id}-title`

  return (
    <article
      aria-labelledby={titleId}
      onPointerMove={spot}
      className="spot-card group/card relative flex h-full flex-col !bg-transparent p-4 sm:p-6 md:p-8"
    >
      {/* The surface is the shared element that expands into the sheet. */}
      <motion.div
        layoutId={`surface-${study.id}`}
        className="absolute inset-0 -z-[2] rounded-[inherit] bg-surface"
        style={{ opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      />

      <div className={large ? 'grid gap-6 lg:grid-cols-12 lg:gap-10' : ''}>
        <div className={large ? 'lg:col-span-7' : ''}>
          <p className="kicker">
            {study.fig} <span className="text-line-strong">/</span> {study.org}
          </p>
          <motion.h3
            layoutId={`title-${study.id}`}
            id={titleId}
            className={`mt-3 font-display font-medium tracking-[-0.03em] text-fg ${
              large ? 'text-[clamp(1.6rem,1.2rem+1.4vw,2.35rem)] leading-[1.08]' : 'text-[1.45rem] leading-tight'
            }`}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {study.title}
          </motion.h3>
          <p className="mt-3 max-w-[38rem] text-pretty text-muted">{study.problem}</p>
        </div>
        {large ? (
          <div className="flex flex-col justify-end gap-5 lg:col-span-5 lg:items-end lg:text-right">
            <Result study={study} end />
            <OpenButton study={study} onOpen={onOpen} />
          </div>
        ) : null}
      </div>

      <div className={large ? 'mt-8' : 'mt-6 flex-1'}>
        <Explainer />
      </div>

      {!large ? (
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
          <Result study={study} />
          <OpenButton study={study} onOpen={onOpen} />
        </div>
      ) : null}
    </article>
  )
}

function Result({ study, end }: { study: CaseStudy; end?: boolean }) {
  return (
    <p className={`m-0 flex items-baseline gap-3 ${end ? 'lg:justify-end' : ''}`}>
      <span className="num text-[2rem] font-medium leading-none text-fg">{study.result.value}</span>
      <span className="max-w-[14rem] text-sm leading-snug text-muted">{study.result.label}</span>
    </p>
  )
}

function OpenButton({ study, onOpen }: { study: CaseStudy; onOpen: Props['onOpen'] }) {
  return (
    <a
      href={`#work/${study.id}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        onOpen(study.id)
      }}
      className="btn btn-ghost btn-sm"
      data-case-opener={study.id}
    >
      Open case study
      <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  )
}
