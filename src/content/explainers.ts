import type { CaseStudyId } from './site'

/**
 * Step data for each explainer. `id` must match a timeline label in the
 * explainer component. Captions are the explainer's text track, so each one
 * should make sense with no animation at all.
 */
export type ExplainerStep = { id: string; label: string; caption: string }

export type ExplainerData = {
  id: CaseStudyId
  /** One sentence for screen readers describing the whole diagram. */
  summary: string
  steps: ExplainerStep[]
}

export const explainers: Record<CaseStudyId, ExplainerData> = {
  'renewal-agent': {
    id: 'renewal-agent',
    summary:
      'Licence renewals are split into fields, checked in parallel by an LLM agent and a business-rules layer, and routed to either auto-approval or human review. The agent has no way to deny.',
    steps: [
      {
        id: 'intake',
        label: 'Intake',
        caption: 'Renewal applications arrive. Sample data only, no real records.',
      },
      {
        id: 'split',
        label: 'Split',
        caption: 'Each renewal is broken into fields that can be checked on their own.',
      },
      {
        id: 'check',
        label: 'Check twice',
        caption: 'The agent and a business-rules layer check the same fields in parallel.',
      },
      {
        id: 'contract',
        label: 'Contract',
        caption: 'The agent must answer inside a JSON schema: approve or review. Deny is not an option it has.',
      },
      {
        id: 'route',
        label: 'Route',
        caption: 'Both agree on approve: auto-processed. Any disagreement goes to a person.',
      },
      {
        id: 'scope',
        label: 'Scope',
        caption: 'Records outside the user’s role and case assignment never reach the result set.',
      },
    ],
  },
  latency: {
    id: 'latency',
    summary:
      'A page load waterfall shows repeated Microsoft Graph calls and an unindexed dashboard query. Batching the calls and moving the query to an indexed view cuts page load time by 70%.',
    steps: [
      {
        id: 'load',
        label: 'Page load',
        caption: 'One page load, drawn as a network waterfall. Timings are relative.',
      },
      {
        id: 'graph',
        label: 'Repeat calls',
        caption: 'The same Microsoft Graph request fires again and again.',
      },
      {
        id: 'scan',
        label: 'Slow query',
        caption: 'A dashboard query has no index to use, so it reads the whole table.',
      },
      {
        id: 'batch',
        label: 'Batch',
        caption: 'The repeated Graph calls are batched into fewer round trips.',
      },
      {
        id: 'index',
        label: 'Index',
        caption: 'The dashboard query moves to an indexed SQL Server view.',
      },
      {
        id: 'result',
        label: 'Result',
        caption: 'Page load time down 70%.',
      },
    ],
  },
  'rag-cache': {
    id: 'rag-cache',
    summary:
      'A retrieval pipeline answers a new question through Pinecone, a cross-encoder and a paid API. A reworded repeat of the question is matched by a semantic cache and answered by a self-hosted model, skipping the paid call.',
    steps: [
      {
        id: 'ingest',
        label: 'Ingest',
        caption: 'Ahead of time, platform data is cut into 256-token chunks and embedded into Pinecone.',
      },
      {
        id: 'ask',
        label: 'Ask',
        caption: 'A user asks a question.',
      },
      {
        id: 'miss',
        label: 'Cache check',
        caption: 'Nothing similar has been answered before. Cache miss.',
      },
      {
        id: 'retrieve',
        label: 'Retrieve',
        caption: 'The question is embedded and the 5 closest chunks come back from Pinecone.',
      },
      {
        id: 'rerank',
        label: 'Rerank',
        caption: 'A cross-encoder reorders the 5 so the best context goes first.',
      },
      {
        id: 'answer',
        label: 'Answer',
        caption: 'The paid API answers, and the pair joins the history the cache learns from.',
      },
      {
        id: 'again',
        label: 'Ask again',
        caption: 'A reworded version of the same question arrives.',
      },
      {
        id: 'hit',
        label: 'Served locally',
        caption: 'The semantic cache matches it. A fine-tuned Mistral 7B on vLLM answers, and the paid call is skipped.',
      },
    ],
  },
}
