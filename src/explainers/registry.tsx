import type { ComponentType } from 'react'
import type { CaseStudyId } from '../content/site'
import { RenewalAgent } from './RenewalAgent'
import { LatencyFix } from './LatencyFix'
import { RagCache } from './RagCache'

/** Maps each case study to its explainer. Add new explainers here. */
export const explainerFor: Record<CaseStudyId, ComponentType<{ variant?: 'inline' | 'sheet' }>> = {
  'renewal-agent': RenewalAgent,
  latency: LatencyFix,
  'rag-cache': RagCache,
}
