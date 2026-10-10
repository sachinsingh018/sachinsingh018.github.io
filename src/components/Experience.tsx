import { ArrowUpRight } from 'lucide-react'
import { experience, type Employer, type Engagement, type Role } from '../content/site'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-h" className="relative z-[1] scroll-mt-16 py-24 md:py-32">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeader id="experience-h" kicker={experience.kicker} heading={experience.heading} />
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[34rem] text-pretty text-muted">{experience.about}</p>
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

        <ol className="m-0 list-none p-0 lg:col-span-8">
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

function Mark({ text }: { text: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface-2 font-mono text-[0.625rem] font-medium tracking-[0.04em] text-muted"
    >
      {text}
    </span>
  )
}

function EmployerBlock({ employer }: { employer: Employer }) {
  return (
    <div className="flex gap-4 md:gap-5">
      <Mark text={employer.mark} />
      <div className="min-w-0 flex-1">
        <h3 className="m-0 font-display text-xl font-medium tracking-[-0.025em] text-fg">{employer.org}</h3>
        <div className="mt-4 grid gap-7">
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
        <p className="m-0 text-fg">
          {role.title}
          {role.subtitle ? <span className="text-subtle"> ({role.subtitle})</span> : null}
        </p>
        <p className="num m-0 text-xs text-subtle">{role.dates}</p>
      </div>
      {role.sentence ? <p className="mt-2 text-pretty text-muted">{role.sentence}</p> : null}
      {role.metric ? <p className="chip mt-3">{role.metric}</p> : null}
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
        <p className="m-0 font-medium text-fg">
          {g.org}
          {g.detail ? <span className="font-normal text-subtle">, {g.detail}</span> : null}
        </p>
        <p className="num m-0 text-xs text-subtle">{g.dates}</p>
      </div>
      <p className="mt-1.5 text-pretty text-muted">{g.sentence}</p>
      <p className="chip mt-3">{g.metric}</p>
    </li>
  )
}
