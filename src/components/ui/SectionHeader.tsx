import { Reveal } from './Reveal'
import { keepHyphens } from '../../lib/text'

type Props = {
  id: string
  kicker: string
  heading: string
  sub?: string
  /** Linear-style two-tone heading: the sub continues the heading in a muted tone. */
  twoTone?: boolean
  className?: string
}

export function SectionHeader({ id, kicker, heading, sub, twoTone, className = '' }: Props) {
  return (
    <Reveal className={className}>
      <p className="kicker" aria-hidden="true">
        {kicker}
      </p>
      {twoTone && sub ? (
        <h2 id={id} className="h2 mt-4 max-w-[22ch] text-balance">
          {keepHyphens(heading)} <span className="text-subtle">{keepHyphens(sub)}</span>
        </h2>
      ) : (
        <>
          <h2 id={id} className="h2 mt-4 max-w-[20ch] text-balance">
            {keepHyphens(heading)}
          </h2>
          {sub ? <p className="mt-4 max-w-[36rem] text-lg text-muted">{sub}</p> : null}
        </>
      )}
    </Reveal>
  )
}
