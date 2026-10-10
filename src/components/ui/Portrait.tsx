import type { CSSProperties } from 'react'
import { person } from '../../content/site'

type Props = {
  /** Square WebP widths to offer, smallest first, from public/images/sachin-<w>.webp. */
  widths: number[]
  /** The sizes attribute, matching the rendered width at each breakpoint. */
  sizes: string
  /** Intrinsic size for the width and height attributes, so the box is reserved before load. */
  size: number
  loading: 'eager' | 'lazy'
  className?: string
  style?: CSSProperties
}

/** Square photo with a WebP srcset and a JPG fallback. Face kept in frame if the box is not square. */
export function Portrait({ widths, sizes, size, loading, className = '', style }: Props) {
  return (
    <picture className="block shrink-0">
      <source type="image/webp" srcSet={widths.map((w) => `/images/sachin-${w}.webp ${w}w`).join(', ')} sizes={sizes} />
      <img
        src="/images/sachin-480.jpg"
        alt={person.photoAlt}
        width={size}
        height={size}
        loading={loading}
        decoding="async"
        className={`block object-cover ${className}`}
        style={{ objectPosition: 'center 30%', ...style }}
      />
    </picture>
  )
}
