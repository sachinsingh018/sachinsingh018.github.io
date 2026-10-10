import { shippedFor } from '../content/site'

/** Typographic wordmarks, set in our own type. Muted, brighter on hover. */
export function LogoWall() {
  return (
    <section aria-labelledby="shipped-h" className="relative z-[1]">
      <div className="container-page py-12 md:py-14">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:gap-12">
          <h2 id="shipped-h" className="kicker shrink-0">
            {shippedFor.kicker}
          </h2>
          <ul className="grid flex-1 grid-cols-2 items-center gap-x-8 gap-y-7 sm:grid-cols-3 lg:flex lg:justify-between">
            {shippedFor.orgs.map((o) => (
              <li key={o.name} className="text-subtle transition-colors duration-200 hover:text-fg">
                <Wordmark lines={o.lines} variant={o.style} />
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-7 font-mono text-xs text-subtle lg:text-right">{shippedFor.note}</p>
      </div>
    </section>
  )
}

function Wordmark({ lines, variant }: { lines: string[]; variant: 'eyebrow' | 'stack' | 'caps' }) {
  if (variant === 'eyebrow') {
    return (
      <span className="block leading-none">
        <span className="block font-mono text-[0.6rem] uppercase tracking-[0.18em]">{lines[0]}</span>
        <span className="mt-1 block font-display text-[1.15rem] font-medium tracking-[-0.02em]">{lines[1]}</span>
      </span>
    )
  }
  if (variant === 'stack') {
    return (
      <span className="block font-display text-[0.95rem] font-medium leading-[1.12] tracking-[-0.015em]">
        {lines.map((l, i) => (
          <span key={l} className="block">
            {l}
            {i < lines.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    )
  }
  return <span className="block font-display text-[1rem] font-semibold uppercase tracking-[0.16em]">{lines[0]}</span>
}
