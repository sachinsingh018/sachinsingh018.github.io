import type { CaseStudyId } from '../content/site'
import { explainerFor } from './registry'

/** Default export for React.lazy: renders the explainer for a case study. */
export default function ExplainerLoader({ id, variant }: { id: CaseStudyId; variant: 'inline' | 'sheet' }) {
  const Explainer = explainerFor[id]
  return <Explainer variant={variant} />
}
