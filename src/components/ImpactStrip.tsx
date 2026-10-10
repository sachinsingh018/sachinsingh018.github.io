import { impact } from '../content/site'
import { CountUp } from './CountUp'

export function ImpactStrip() {
  return (
    <section
      aria-label="Impact"
      className="relative z-[1] border-y border-line bg-[color-mix(in_oklab,var(--bg)_88%,transparent)]"
    >
      <dl className="container-page grid grid-cols-2 lg:grid-cols-4">
        {impact.map((m, i) => (
          <div
            key={m.label}
            className={[
              'flex flex-col-reverse justify-end gap-2.5 py-8 md:py-10',
              i % 2 === 1 ? 'border-l border-line pl-4 sm:pl-6' : 'pr-4',
              i > 1 ? 'border-t border-line lg:border-t-0' : '',
              i === 2 ? 'lg:border-l lg:pl-8' : '',
              i % 2 === 1 ? 'lg:pl-8' : '',
            ].join(' ')}
          >
            <dt className="max-w-[16rem] text-sm leading-snug text-muted">{m.label}</dt>
            <dd className="num m-0 text-[clamp(2.25rem,1.5rem+2.4vw,3.5rem)] font-medium leading-none text-fg">
              <CountUp metric={m} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
