import type { CSSProperties } from 'react'
import { ArrowDownRight } from 'lucide-react'
import { hero } from '../content/site'
import { HeroBackdrop } from './HeroBackdrop'
import { Magnetic } from './ui/Magnetic'
import { keepHyphens } from '../lib/text'

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-h"
      className="relative flex min-h-[100svh] items-end pb-16 pt-32 md:items-center md:pb-24"
    >
      <HeroBackdrop />
      {/* Scrim keeps the copy readable over the canvas in both themes */}
      <div aria-hidden="true" className="hero-scrim pointer-events-none absolute inset-0 z-[1]" />

      <div className="container-page relative z-10">
        <p className="kicker rise" style={delay(40)}>
          {hero.kicker}
        </p>
        <h1
          id="hero-h"
          className="display rise mt-5 max-w-[15ch] text-balance text-[clamp(2.6rem,1.1rem+5.4vw,6rem)]"
          style={delay(100)}
        >
          {hero.headline.before}
          <span className="text-gradient">{hero.headline.accent}</span>
          {hero.headline.after}
        </h1>
        <p
          className="rise mt-6 max-w-[34rem] text-pretty text-lg leading-relaxed text-muted md:text-xl"
          style={delay(200)}
        >
          {keepHyphens(hero.sub)}
        </p>
        <div className="rise mt-9 flex flex-wrap items-center gap-3" style={delay(300)}>
          <Magnetic href={hero.primary.href} className="btn btn-primary">
            {hero.primary.label}
            <ArrowDownRight size={16} aria-hidden="true" />
          </Magnetic>
          <a href={hero.secondary.href} className="btn btn-ghost">
            {hero.secondary.label}
          </a>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="kicker pointer-events-none absolute bottom-6 right-4 z-10 hidden text-right sm:right-6 lg:right-8 lg:block"
      >
        Fig 0 / System map. Each cluster is a section below.
      </p>
    </section>
  )
}
