import { useEffect, useRef, useState, type RefObject } from 'react'

type Options = {
  /** Fraction of the element that must be visible. */
  amount?: number
  /** Stop observing after the first time it enters. */
  once?: boolean
  rootMargin?: string
}

export function useInView<T extends Element>(
  options: Options = {},
): [RefObject<T | null>, boolean] {
  const { amount = 0, once = false, rootMargin } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold: amount, rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [amount, once, rootMargin])

  return [ref, inView]
}
