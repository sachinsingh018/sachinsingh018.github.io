import { Fragment, type ReactNode } from 'react'

/** Keeps hyphenated words like "go-live" from breaking across lines. */
export function keepHyphens(text: string): ReactNode {
  const parts = text.split(/(\S+-\S+)/g)
  return parts.map((p, i) =>
    /\S+-\S+/.test(p) ? (
      <span key={i} className="whitespace-nowrap">
        {p}
      </span>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  )
}

