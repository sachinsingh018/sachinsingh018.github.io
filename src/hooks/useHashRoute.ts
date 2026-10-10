import { useCallback, useSyncExternalStore } from 'react'
import type { CaseStudyId } from '../content/site'

const CASES: CaseStudyId[] = ['renewal-agent', 'latency', 'rag-cache']

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener('popstate', onChange)
  }
}

function readCase(): CaseStudyId | null {
  const m = window.location.hash.match(/^#work\/([a-z-]+)$/)
  const id = m?.[1] as CaseStudyId | undefined
  return id && CASES.includes(id) ? id : null
}

/** Deep-linkable case studies: #work/renewal-agent opens that sheet. */
export function useCaseRoute() {
  const openCase = useSyncExternalStore(subscribe, readCase, () => null)

  const open = useCallback((id: CaseStudyId) => {
    const current = readCase()
    if (current === id) return
    // Switching between case studies replaces the entry, so Back still closes the sheet.
    if (current) history.replaceState(history.state, '', `#work/${id}`)
    else history.pushState({ case: id }, '', `#work/${id}`)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }, [])

  const close = useCallback(() => {
    if (!readCase()) return
    // Go back when the sheet was opened from the page, so Back does not reopen it.
    if (history.state && (history.state as { case?: string }).case) {
      history.back()
    } else {
      history.replaceState(null, '', '#work')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    }
  }, [])

  return { openCase, open, close }
}
