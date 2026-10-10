import type Lenis from 'lenis'

/** The active Lenis instance, if smooth scrolling is on. */
let instance: Lenis | null = null

export const setLenis = (l: Lenis | null) => {
  instance = l
}
export const getLenis = () => instance
