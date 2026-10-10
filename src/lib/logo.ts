import type { CSSProperties } from 'react'

/** Style for a .logo-mask element pointing at public/logos/<name>.svg. */
export function logoStyle(name: string, size = 16): CSSProperties {
  return {
    ['--logo' as string]: `url(/logos/${name}.svg)`,
    width: size,
    height: size,
  }
}
