import { shippedFor } from '../content/site'

/** Typographic wordmarks, set in our own type. Muted, brighter on hover. */
export function LogoWall() {
  return (
    <section aria-labelledby="shipped-h" className="relative z-[1]">
      <div className="container-page py-10 md:py-12">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:gap-12">
          <div className="shrink-0">
            <h2 id="shipped-h" className="kicker m-0">
              {shippedFor.kicker}
            </h2>
            <p className="m-0 mt-1.5 font-mono text-[0.6875rem] text-subtle">{shippedFor.note}</p>
          </div>
          <ul className="m-0 grid flex-1 list-none grid-cols-2 items-center gap-x-8 gap-y-5 p-0 sm:grid-cols-3 lg:flex lg:justify-between">
            {shippedFor.orgs.map((o) => (
              <li key={o.name} className="text-subtle transition-colors duration-200 hover:text-fg">
                <Wordmark lines={o.lines} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Wordmark({ lines }: { lines: string[] }) {
  return (
    <span className="block font-display text-[1.02rem] font-medium leading-tight tracking-[-0.02em]">{lines.join(' ')}</span>
  )
}
