import { toolkit } from '../content/site'
import { logoStyle } from '../lib/logo'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'

export function SkillsBand() {
  return (
    <section id="toolkit" aria-labelledby="toolkit-h" className="relative z-[1] scroll-mt-16 cv-section py-16 md:py-24">
      <div className="container-page">
        <SectionHeader id="toolkit-h" kicker={toolkit.kicker} heading={toolkit.heading} />
        <div className="mt-12 grid gap-10 rounded-2xl border border-line bg-surface p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
          <Reveal className="lg:col-span-5">
            <h3 className="kicker m-0">Core tools</h3>
            <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
              {toolkit.tools.map((t) => (
                <li key={t.name} className="chip !h-8 !px-3 !text-[0.8125rem] text-fg">
                  {t.name}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.06} className="lg:col-span-3">
            <h3 className="kicker m-0">Credentials</h3>
            <ul className="m-0 mt-5 grid list-none gap-3 p-0">
              {toolkit.credentials.map((c) => (
                <li key={c.name} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-surface-2 text-fg">
                    <span className="logo-mask" style={logoStyle(c.logo, 16)} aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-snug text-fg">{c.name}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-4">
            <h3 className="kicker m-0">Education</h3>
            <ul className="m-0 mt-5 grid list-none gap-4 p-0">
              {toolkit.education.map((e) => (
                <li key={e.school}>
                  <p className="m-0 text-sm leading-snug text-fg">{e.degree}</p>
                  <p className="m-0 mt-0.5 text-sm text-muted">
                    {e.school}, <span className="num">{e.year}</span>
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
