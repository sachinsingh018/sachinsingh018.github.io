import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'li' | 'p' }

const EASE = [0.19, 1, 0.22, 1] as const

/** Fades and lifts content in once, the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0, as = 'div' }: Props) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.75, ease: EASE, delay }}
    >
      {children}
    </Tag>
  )
}
