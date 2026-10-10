/**
 * All visible copy for the site lives here. Components only lay it out.
 *
 * Rules for editing:
 * - Every number, title and date must trace to the resume (see docs/plan.md, section 1).
 * - No em dashes anywhere. `npm run build` fails if one slips in.
 * - Keep it short. The whole page targets 600 to 800 visible words.
 */

export type Link = { label: string; href: string; external?: boolean }

export type Metric = {
  value: number
  /** Decimal places shown while counting up. */
  decimals?: number
  prefix?: string
  suffix?: string
  label: string
}

export type CaseStudyId = 'renewal-agent' | 'latency' | 'rag-cache'

export type CaseStudy = {
  id: CaseStudyId
  /** Figure label shown above the card, e.g. "FIG 1". */
  fig: string
  title: string
  org: string
  context: string
  problem: string
  result: { value: string; label: string }
  stack: string[]
  /** Optional. Only add a line here if it is true and in your own words. */
  gotWrongFirst?: string
  size: 'large' | 'small'
}

export type Engagement = {
  org: string
  detail?: string
  dates: string
  sentence: string
  /** Each entry renders as its own chip. */
  metrics: string[]
  stack?: string[]
}

export type Role = {
  title: string
  subtitle?: string
  dates: string
  engagements?: Engagement[]
  /** Used when the role has no separate client engagements. */
  sentence?: string
  metrics?: string[]
  stack?: string[]
}

export type Employer = {
  org: string
  roles: Role[]
}

export type Tool = {
  name: string
  /** File name in public/logos without extension. Omit for a text-only chip. */
  logo?: string
}

export type Project = {
  title: string
  line: string
  stack: string[]
  note: string
  href?: string
}

export const person = {
  name: 'Sachin Singh',
  email: 'sachinsingh018@gmail.com',
  jobTitle: 'Forward Deployed Engineer',
  employer: 'Ignyte Group',
  url: 'https://sachinsingh018.github.io/',
  linkedin: 'https://www.linkedin.com/in/sac108',
  github: 'https://github.com/sachinsingh018',
}

export const meta = {
  title: 'Sachin Singh, solutions engineer',
  description:
    'Solutions engineer and forward deployed engineer. Systems of record for government and healthcare, LLM agents with real guardrails, and the discovery and bids that come before them.',
}

export const nav: Link[] = [
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

export const hero = {
  kicker: 'Solutions engineer, forward deployed',
  /** The middle part is rendered with the accent gradient. */
  headline: { before: 'I build production systems for ', accent: 'government and healthcare', after: '.' },
  sub: 'From the first discovery session to architecture, code, and go-live. Most recently, LLM agents on AWS Bedrock that auto-process 77% of medical licence renewals for 1.5M+ practitioners. Before that, co-founder and CTO of an AI startup.',
  primary: { label: 'See the work', href: '#work' },
  secondary: { label: 'Get in touch', href: '#contact' },
}

export const impact: Metric[] = [
  { value: 77, suffix: '%', label: 'of licence renewals auto-processed by agents' },
  { value: 70, suffix: '%', label: 'less page load time on a state case system' },
  { value: 10, suffix: 'M+', label: 'records migrated from MySQL to SQL Server' },
  { value: 1.5, decimals: 1, suffix: 'M+', label: 'practitioners licensed a year on a platform I helped build' },
]

export const shippedFor = {
  kicker: 'Shipped for',
  /**
   * Typographic wordmarks only. Several of these organisations restrict logo use
   * (the Massachusetts seal is barred from advertising use by M.G.L. c.264 s.5).
   */
  orgs: [
    { name: 'Commonwealth of Massachusetts', lines: ['Commonwealth of', 'Massachusetts'] },
    { name: 'Florida Department of Health', lines: ['Florida', 'Department of Health'] },
    { name: 'Rocky Mountain Human Services', lines: ['Rocky Mountain', 'Human Services'] },
    { name: 'Kodak', lines: ['Kodak'] },
    { name: 'Monster Energy', lines: ['Monster Energy'] },
  ] satisfies { name: string; lines: string[] }[],
  note: 'Government and healthcare work via Ignyte Group',
}

export const work = {
  kicker: '01 / Work',
  heading: 'Three systems, shown running.',
  sub: 'Simplified illustrations of real work. Press play, or step through.',
  cases: [
    {
      id: 'renewal-agent',
      fig: 'FIG 1',
      title: 'An agent that is not allowed to say no',
      org: 'Florida Department of Health',
      context: 'MQA licensing',
      problem:
        'Automate routine licence renewals for 1.5M+ practitioners without ever letting a model deny one.',
      result: { value: '77%', label: 'of renewals auto-processed' },
      stack: ['Appian', 'Claude Sonnet 4.5', 'AWS Bedrock', 'JSON Schema'],
      size: 'large',
    },
    {
      id: 'latency',
      fig: 'FIG 2',
      title: 'Finding where the time went',
      org: 'Massachusetts Administration and Finance',
      context: 'Legal case management',
      problem:
        'Pages were slow across a case system for four judicial appeals boards, and for more than one reason.',
      result: { value: '70%', label: 'less page load time' },
      stack: ['Microsoft Graph', 'SQL Server', 'Appian'],
      size: 'small',
    },
    {
      id: 'rag-cache',
      fig: 'FIG 3',
      title: 'Paying for the same answer twice',
      org: 'Networkqy AI',
      context: 'Career platform for universities',
      problem:
        'Users asked the same questions in different words, and every one was a paid API call.',
      result: { value: '', label: 'Repeat questions served by a self-hosted model, not the paid API.' },
      stack: ['Pinecone', 'Cross-encoder', 'Mistral 7B', 'vLLM'],
      size: 'small',
    },
  ] satisfies CaseStudy[],
}

export const process = {
  kicker: '02 / Process',
  heading: 'From the first workshop to go-live.',
  sub: 'The person who scoped it is the person who ships it.',
  stages: [
    { name: 'Discovery', proof: '12+ regulator sessions' },
    { name: 'Requirements', proof: '112 traced requirements' },
    { name: 'Bid and demo', proof: '20+ RFP sections, 2 winning bids' },
    { name: 'Build', proof: 'LLM agents in production' },
    { name: 'Go-live', proof: '30 staff trained' },
  ],
  lesson: {
    label: 'What I got wrong first',
    text: 'Working solo. The best work on this page was a team win, and that took me a while to learn.',
  },
}

export const experience = {
  kicker: '03 / Experience',
  heading: 'Where I’ve worked.',
  about:
    'Most of my work sits where software meets regulation: licensing, appeals boards and health services. I like starting at the shadowing sessions and staying until the system is stable in production.',
  employers: [
    {
      org: 'Ignyte Group',
      roles: [
        {
          title: 'Forward Deployed Engineer',
          subtitle: 'Technology Consultant',
          dates: 'Apr 2025 – Present',
          engagements: [
            {
              org: 'Massachusetts A&F',
              detail: 'Legal Case Management System',
              dates: 'Apr 2026 – Present',
              sentence:
                'Building the case lifecycle engine that moves four judicial appeals boards onto one Appian platform: state transitions, parent-child case consolidation, and multi-day hearing scheduling. Traced app-wide latency to Graph API fan-out and unindexed dashboard queries, then fixed it with request batching and indexed SQL Server views. Owned the Civil Service Commission go-live.',
              metrics: ['70% faster page loads', '44,000 external users'],
              stack: ['Appian', 'Java', 'SQL Server', 'AWS S3 + Lambda', 'Microsoft Graph API', 'OAuth 2.0'],
            },
            {
              org: 'Florida Department of Health',
              detail: 'MQA Licensing System',
              dates: 'Apr 2025 – Mar 2026',
              sentence:
                'Ran 12+ discovery sessions with regulators, then architected renewal decisioning on Claude via AWS Bedrock: a JSON-schema decision contract, a parallel validation layer, and no denial without human review. Built the integrations around it, including Tyler payments with settlement reconciliation, CE Broker, AHCA, and SAML SSO on the state’s Entra ID.',
              metrics: ['77% of renewals auto-processed', '1.5M+ practitioners a year'],
              stack: ['Appian AI Agents', 'Claude on Bedrock', 'REST APIs', 'SAML SSO', 'SQL stored procedures', 'Selenium'],
            },
          ],
        },
        {
          title: 'Associate Forward Deployed Engineer',
          subtitle: 'Associate Consultant',
          dates: 'Feb 2024 – Apr 2025',
          engagements: [
            {
              org: 'Rocky Mountain Human Services',
              detail: 'Case-management expansion',
              dates: 'Feb 2024 – Mar 2025',
              sentence:
                'Ran day-to-day delivery for the client’s five-person dev team and built a custom Java plugin. Led the MySQL to SQL Server migration with UTF-8 hardening and walked stakeholders through cutover risk before go-live.',
              metrics: ['10M+ records migrated'],
              stack: ['Java', 'MySQL', 'SQL Server', 'Appian'],
            },
          ],
        },
      ],
    },
    {
      org: 'Eastman Kodak Company',
      roles: [
        {
          title: 'Software Developer',
          dates: 'Aug 2023 – Dec 2023',
          sentence:
            'Replaced manual Excel reporting with a Google Tag Manager to Tableau analytics pipeline, and shipped Vue.js/Nuxt features to kodak.com behind a containerised Git and Docker release workflow.',
          metrics: ['12 high-priority defects resolved', 'still live on kodak.com'],
          stack: ['Vue.js', 'Nuxt', 'Docker', 'Craft CMS', 'Tableau'],
        },
      ],
    },
    {
      org: 'Networkqy AI',
      roles: [
        {
          title: 'Co-founder and CTO',
          dates: 'Apr 2021 – Jul 2023',
          sentence:
            'Co-founded an angel-funded career platform for universities and built the AI stack end to end: real-time interview practice on Whisper and GPT-4 over WebSockets, a Pinecone RAG pipeline with cross-encoder reranking, and a semantic cache on a self-hosted, LoRA-tuned Mistral 7B. Ran every pilot from first call to paid contract.',
          metrics: ['15,000 users', '2 of 3 pilots converted to paid'],
          stack: ['Python', 'React/Next.js', 'Pinecone', 'vLLM', 'OpenAI', 'MongoDB'],
        },
      ],
    },
    {
      org: 'Monster Energy Company',
      roles: [
        {
          title: 'Business Technology Intern',
          dates: 'May 2023 – Jul 2023',
          sentence:
            'Moved an Excel-only master data team onto SQL, Python and Power Platform, adding pipeline monitoring and event-driven alerts against SAP and Azure SQL.',
          metrics: ['67% faster issue detection', '~50,000 records, 40+ markets'],
          stack: ['SQL', 'Python', 'Power BI', 'Power Automate'],
        },
      ],
    },
  ] satisfies Employer[],
  more: { label: 'Full history on LinkedIn', href: person.linkedin, external: true },
}

export const toolkit = {
  kicker: '04 / Toolkit',
  heading: 'What I reach for.',
  tools: [
    { name: 'Appian' },
    { name: 'Java' },
    { name: 'Python' },
    { name: 'SQL Server' },
    { name: 'AWS' },
    { name: 'Claude' },
    { name: 'React' },
    { name: 'LangChain' },
    { name: 'Pinecone' },
    { name: 'vLLM' },
    { name: 'Docker' },
    { name: 'Git' },
  ] satisfies Tool[],
  credentials: [
    { name: 'Appian Certified Senior Developer', logo: 'appian' },
    { name: 'Claude Certified Architect', logo: 'claude' },
  ],
  education: [
    {
      degree: 'MS Computer Science, Data Science',
      school: 'University of Southern California',
      year: '2023',
    },
    {
      degree: 'BE Computer Science, minor in Finance',
      school: 'BITS Pilani, Dubai',
      year: '2021',
    },
  ],
}

export const projects = {
  kicker: '05 / Earlier work',
  heading: 'Before the day job.',
  items: [
    {
      title: 'Real-time interview practice',
      line: 'Whisper speech-to-text chained into GPT-4 inference, streamed over WebSockets so mock interviews run in real time.',
      stack: ['Whisper', 'GPT-4', 'WebSockets'],
      note: 'NETWORKQY AI',
    },
    {
      title: 'Retrieval over a professional graph',
      line: 'RAG over users, skills, companies and jobs: 256-token chunks, top-5 retrieval and cross-encoder reranking, scored on precision and recall.',
      stack: ['Python', 'Pinecone', 'LangChain'],
      note: 'NETWORKQY AI',
    },
    {
      title: 'Semantic cache on a fine-tuned LLM',
      line: 'A LoRA fine-tuned Mistral 7B, self-hosted on vLLM, matching repeat queries and answering them locally instead of calling OpenAI.',
      stack: ['Mistral 7B', 'LoRA', 'vLLM'],
      note: 'NETWORKQY AI',
    },
    {
      title: 'Weenix kernel',
      line: 'Processes, threads, a virtual file system and virtual memory for a teaching operating system.',
      stack: ['C'],
      note: 'USC COURSEWORK, CODE PRIVATE',
    },
  ] satisfies Project[],
  all: { label: 'All projects on GitHub', href: `${person.github}?tab=repositories`, external: true },
}

export const contact = {
  kicker: '06 / Contact',
  heading: 'Building something that has to be right the first time?',
  sub: 'I would like to hear about it.',
  copied: 'Email copied',
}

export const footer = {
  colophon: 'Designed and built by me with React Three Fiber, GSAP and Motion.',
}

/** Section ids in page order. The hero graph has one node cluster per section. */
export const sectionIds = ['work', 'process', 'experience', 'toolkit', 'projects', 'contact'] as const
export type SectionId = (typeof sectionIds)[number]
