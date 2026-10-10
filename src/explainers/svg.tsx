/** Small SVG helpers shared by the explainers. */

/** A smooth cubic between two points, bending along the main axis. */
export function curve(x1: number, y1: number, x2: number, y2: number, dir: 'h' | 'v' = 'h') {
  if (dir === 'h') {
    const mx = (x1 + x2) / 2
    return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`
  }
  const my = (y1 + y2) / 2
  return `M${x1} ${y1} C${x1} ${my} ${x2} ${my} ${x2} ${y2}`
}

export function CheckMark({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>
        <circle r={6.5} className="ex-box-ok" />
        <path d="M-2.8 0.2 L-0.8 2.2 L3 -1.8" fill="none" stroke="var(--ok)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  )
}

export function LockIcon({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>
        <rect x={1} y={6} width={12} height={9} rx={2} fill="var(--fg-subtle)" />
        <path d="M3.5 6V4.5a3.5 3.5 0 0 1 7 0V6" fill="none" stroke="var(--fg-subtle)" strokeWidth={1.5} />
      </g>
    </g>
  )
}
