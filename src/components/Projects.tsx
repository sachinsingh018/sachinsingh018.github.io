import { ArrowUpRight } from 'lucide-react'
import { projects, type Project } from '../content/site'
import { useSpotlight } from '../hooks/useSpotlight'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'

export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-h" className="relative z-[1] scroll-mt-16 cv-section py-16 md:py-24">
      <div className="container-page">
        <SectionHeader id="projects-h" kicker={projects.kicker} heading={projects.heading} />
        <ul className="m-0 mt-12 grid list-none auto-rows-fr gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {projects.items.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.05}>
              <ProjectCard p={p} />
            </Reveal>
          ))}
        </ul>
        <Reveal className="mt-8">
          <a href={projects.all.href} target="_blank" rel="noreferrer" className="link-underline inline-flex items-center gap-1.5 text-sm text-fg">
            {projects.all.label}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}

function ProjectCard({ p }: { p: Project }) {
  const spot = useSpotlight<HTMLElement>()
  return (
    <article onPointerMove={spot} className="spot-card relative flex h-full flex-col p-5">
      <p className="kicker m-0">{p.note}</p>
      <h3 className="mt-3 font-display text-lg font-medium leading-snug tracking-[-0.02em] text-fg">
        {p.href ? (
          <a href={p.href} target="_blank" rel="noreferrer" className="after:absolute after:inset-0 after:rounded-[inherit] after:content-['']">
            {p.title}
            <span className="sr-only"> (GitHub, opens in a new tab)</span>
          </a>
        ) : (
          p.title
        )}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{p.line}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="m-0 font-mono text-xs text-subtle">{p.stack.join(' · ')}</p>
        {p.href ? <ArrowUpRight size={15} className="shrink-0 text-subtle" aria-hidden="true" /> : null}
      </div>
    </article>
  )
}
