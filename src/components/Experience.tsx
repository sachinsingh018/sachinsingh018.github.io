import { ArrowUpRight } from 'lucide-react'
import { experience, type Employer, type Engagement, type Role } from '../content/site'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-h" className="relative z-[1] scroll-mt-16 cv-section py-16 md:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeader id="experience-h" kicker={experience.kicker} heading={experience.heading} />
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[34rem] text-muted">{experience.about}</p>
              <a
                href={experience.more.href}
                target="_blank"
                rel="noreferrer"
                className="link-underline mt-6 inline-flex items-center gap-1.5 text-sm text-fg"
              >
                {experience.more.label}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </Reveal>
          </div>
        </div>

        <ol className="m-0 list-none p-0 lg:col-span-7 xl:col-span-8">
          {experience.employers.map((e, i) => (
            <Reveal as="li" key={e.org} delay={0.04 * i} className="border-t border-line py-8 first:border-t-0 first:pt-0 md:py-10">
              <EmployerBlock employer={e} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

function EmployerBlock({ employer }: { employer: Employer }) {
  return (
    <div>
      <div className="min-w-0">
        <h3 className="kicker m-0 !text-[0.8125rem] !text-muted">{employer.org}</h3>
        <div className="mt-3 grid gap-7">
          {employer.roles.map((r) => (
            <RoleBlock key={r.title} role={r} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RoleBlock({ role }: { role: Role }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="m-0 text-[1.0625rem] font-medium text-fg">
          {role.title}
          {role.subtitle ? <span className="font-normal text-subtle"> ({role.subtitle})</span> : null}
        </p>
        <p className="num m-0 text-xs text-subtle">{role.dates}</p>
      </div>
      {role.sentence ? <p className="mt-2 text-muted">{role.sentence}</p> : null}
      {role.metrics ? <Metrics items={role.metrics} /> : null}
      {role.stack ? <Stack items={role.stack} /> : null}
      {role.engagements ? (
        <ul className="m-0 mt-4 grid list-none gap-6 border-l border-line p-0 pl-5">
          {role.engagements.map((g) => (
            <EngagementBlock key={g.org} g={g} />
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function EngagementBlock({ g }: { g: Engagement }) {
  return (
    <li className="relative">
      <span aria-hidden="true" className="absolute -left-[23px] top-[9px] h-[5px] w-[5px] rounded-full bg-line-strong" />
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="m-0 text-fg">
          {g.org}
          {g.detail ? <span className="text-subtle">, {g.detail}</span> : null}
        </p>
        <p className="num m-0 text-xs text-subtle">{g.dates}</p>
      </div>
      <p className="mt-1.5 text-muted">{g.sentence}</p>
      <Metrics items={g.metrics} />
      {g.stack ? <Stack items={g.stack} /> : null}
    </li>
  )
}

function Metrics({ items }: { items: string[] }) {
  return (
    <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
      {items.map((m) => (
        <li key={m} className="chip">
          {m}
        </li>
      ))}
    </ul>
  )
}

function Stack({ items }: { items: string[] }) {
  return (
    <p className="m-0 mt-3 font-mono text-xs leading-relaxed text-subtle">
      <span className="sr-only">Stack: </span>
      {items.join(' · ')}
    </p>
  )
}
