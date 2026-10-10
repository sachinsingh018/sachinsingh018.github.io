import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import { prefersReducedMotion } from '../hooks/useReducedMotion'
import type { Metric } from '../content/site'

function format(m: Metric, v: number) {
  const n = v.toFixed(m.decimals ?? 0)
  return `${m.prefix ?? ''}${n}${m.suffix ?? ''}`
}

/**
 * Renders the final value on the server. If the number starts below the fold it resets to zero
 * and counts up the first time it is seen; if it is already visible it is left alone.
 */
export function CountUp({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState(() => format(metric, metric.value))

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let first = true
    let armed = false
    let stop: (() => void) | undefined
    const io = new IntersectionObserver(
      ([entry]) => {
        if (first) {
          first = false
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
            armed = true
            setText(format(metric, 0))
          } else {
            io.disconnect()
          }
          return
        }
        if (armed && entry.isIntersecting) {
          io.disconnect()
          const controls = animate(0, metric.value, {
            duration: 1.6,
            ease: [0.19, 1, 0.22, 1],
            onUpdate: (v) => setText(format(metric, v)),
          })
          stop = () => controls.stop()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      stop?.()
    }
  }, [metric])

  return (
    <span ref={ref} role="text" aria-label={format(metric, metric.value)}>
      <span aria-hidden="true">{text}</span>
    </span>
  )
}
