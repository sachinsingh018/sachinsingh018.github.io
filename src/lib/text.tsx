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

/**
 * Line-breaking for multi-sentence titles: from the sm breakpoint each sentence starts on its own
 * line, and the last two words of every sentence are kept together so nothing is orphaned.
 */
export function sentenceLines(text: string): ReactNode {
  const sentences = text.split(/(?<=[.?!])\s+/)
  if (sentences.length < 2) return text
  return sentences.map((s, i) => {
    const glued = s.replace(/\s+(\S+)$/, ' $1')
    return (
      <span key={i} className="sm:block">
        {glued}
        {i < sentences.length - 1 ? ' ' : ''}
      </span>
    )
  })
}
