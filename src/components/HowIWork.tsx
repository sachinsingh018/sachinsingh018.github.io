import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { process } from '../content/site'
import { SectionHeader } from './ui/SectionHeader'
import { Reveal } from './ui/Reveal'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Five stages on one line. The line draws as the section scrolls through and
 * each stage lights up as the line reaches it. Under reduced motion it is
 * simply drawn.
 */
export function HowIWork() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(
        {
          desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const desktop = Boolean(ctx.conditions?.desktop)
          const stages = gsap.utils.toArray<HTMLElement>('.hw-stage')
          stages.forEach((s) => s.removeAttribute('data-on'))
          gsap.fromTo(
            '.hw-line-fill',
            desktop ? { scaleX: 0, scaleY: 1 } : { scaleY: 0, scaleX: 1 },
            {
              scaleX: 1,
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: '.hw-track',
                start: desktop ? 'top 80%' : 'top 75%',
                end: desktop ? 'top 35%' : 'bottom 55%',
                scrub: 0.6,
                onUpdate: (self) => {
                  stages.forEach((s, i) => {
                    const at = stages.length > 1 ? i / (stages.length - 1) : 0
                    if (self.progress >= at - 0.02) s.setAttribute('data-on', '')
                    else s.removeAttribute('data-on')
                  })
                },
              },
            },
          )
        },
      )
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="process" aria-labelledby="process-h" className="relative z-[1] scroll-mt-16 py-24 md:py-32">
      <div className="container-page">
        <SectionHeader id="process-h" kicker={process.kicker} heading={process.heading} sub={process.sub} twoTone />

        <div className="hw-track relative mt-14 md:mt-16">
          {/* Track: horizontal on desktop, vertical on mobile */}
          <div aria-hidden="true" className="absolute bottom-2 left-[5px] top-2 w-px bg-line md:bottom-auto md:left-0 md:right-0 md:top-[5px] md:h-px md:w-auto">
            <div className="hw-line-fill absolute inset-0 origin-top bg-gradient-to-b from-accent-a to-accent-b md:origin-left md:bg-gradient-to-r" />
          </div>
          <ol className="relative m-0 grid list-none gap-8 p-0 md:grid-cols-5 md:gap-6">
            {process.stages.map((s, i) => (
              <li key={s.name} className="hw-stage group/st relative pl-8 md:pl-0 md:pt-9" data-on="">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1 h-[11px] w-[11px] rounded-full border border-line-strong bg-bg transition-[background-color,border-color,box-shadow] duration-300 group-data-[on]/st:border-transparent group-data-[on]/st:bg-accent-b group-data-[on]/st:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent-b)_18%,transparent)] md:top-0"
                />
                <p className="num m-0 text-xs text-subtle">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-1.5 font-display text-lg font-medium tracking-[-0.02em] text-fg">{s.name}</h3>
                <p className="mt-1 font-mono text-[0.8125rem] leading-snug text-muted transition-colors duration-300 group-data-[on]/st:text-fg">
                  {s.proof}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-14 max-w-[40rem] border-l-2 border-[color-mix(in_oklab,var(--accent-a)_60%,transparent)] pl-5 md:mt-16">
          <p className="kicker">{process.lesson.label}</p>
          <p className="mt-2 text-lg text-fg">{process.lesson.text}</p>
        </Reveal>
      </div>
    </section>
  )
}
