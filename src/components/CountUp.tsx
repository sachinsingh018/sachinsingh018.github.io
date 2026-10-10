import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import { useInView } from '../hooks/useInView'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import type { Metric } from '../content/site'

function format(m: Metric, v: number) {
  const n = v.toFixed(m.decimals ?? 0)
  return `${m.prefix ?? ''}${n}${m.suffix ?? ''}`
}

/** Renders the final value on the server; counts up from zero the first time it is seen. */
export function CountUp({ metric }: { metric: Metric }) {
  const [ref, inView] = useInView<HTMLSpanElement>({ amount: 0.6, once: true })
  const [text, setText] = useState(() => format(metric, metric.value))
  const armed = useRef(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const r = ref.current?.getBoundingClientRect()
    // Only arm the count if it starts below the fold, so nothing visible jumps.
    if (r && r.top > window.innerHeight) {
      armed.current = true
      setText(format(metric, 0))
    }
  }, [metric, ref])

  useEffect(() => {
    if (!inView || !armed.current) return
    const controls = animate(0, metric.value, {
      duration: 1.6,
      ease: [0.19, 1, 0.22, 1],
      onUpdate: (v) => setText(format(metric, v)),
    })
    return () => controls.stop()
  }, [inView, metric])

  return (
    <span ref={ref} role="text" aria-label={format(metric, metric.value)}>
      <span aria-hidden="true">{text}</span>
    </span>
  )
}
