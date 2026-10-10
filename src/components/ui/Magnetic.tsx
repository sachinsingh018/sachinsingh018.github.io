import { motion, useMotionValue, useSpring, type HTMLMotionProps } from 'motion/react'
import type { PointerEvent } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const MAX = 8

/** Leans an element toward the cursor a few pixels. Mouse only, off under reduced motion. */
function useMagnetic(strength = 0.22) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 320, damping: 22, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 320, damping: 22, mass: 0.4 })
  const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v))
  return {
    style: { x: sx, y: sy },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (reduced || e.pointerType !== 'mouse') return
      const r = e.currentTarget.getBoundingClientRect()
      x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength))
      y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength))
    },
    onPointerLeave: () => {
      x.set(0)
      y.set(0)
    },
  }
}

export function Magnetic(props: HTMLMotionProps<'a'>) {
  const m = useMagnetic()
  return <motion.a {...props} style={{ ...props.style, ...m.style }} onPointerMove={m.onPointerMove} onPointerLeave={m.onPointerLeave} />
}

export function MagneticButton(props: HTMLMotionProps<'button'>) {
  const m = useMagnetic()
  return (
    <motion.button {...props} style={{ ...props.style, ...m.style }} onPointerMove={m.onPointerMove} onPointerLeave={m.onPointerLeave} />
  )
}
