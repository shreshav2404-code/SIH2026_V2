import { BAND_COLOR, type Band } from './data'

export function BandChip({ band, big }: { band: Band; big?: boolean }) {
  return (
    <span
      className={`inline-block rounded font-bold tracking-wide ${big ? 'px-2.5 py-1 text-sm' : 'px-1.5 py-0.5 text-[11px]'}`}
      style={{ background: BAND_COLOR[band], color: band === 'MODERATE' ? '#1b2f45' : '#fff' }}
    >
      {band}
    </span>
  )
}

/* semicircular SVI gauge with the four bands */
export function Gauge({ value, band, size = 190 }: { value: number; band: Band; size?: number }) {
  const r = 80, cx = 100, cy = 96
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [cx + r * Math.cos(Math.PI * (1 - a)), cy - r * Math.sin(Math.PI * (1 - a))]
    const [x0, y0] = p(a0), [x1, y1] = p(a1)
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`
  }
  const seg: [number, number, string][] = [[0, .25, '#2e7d3a'], [.25, .5, '#d99612'], [.5, .75, '#c2510f'], [.75, 1, '#b3261e']]
  const a = Math.PI * (1 - value / 100)
  return (
    <svg viewBox="0 0 200 128" width={size}>
      {seg.map(([a0, a1, c]) => <path key={c} d={arc(a0 + .004, a1 - .004)} stroke={c} strokeWidth={16} fill="none" />)}
      <line x1={cx} y1={cy} x2={cx + 64 * Math.cos(a)} y2={cy - 64 * Math.sin(a)} stroke="#1b2f45" strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7} fill="#1b2f45" />
      <text x={cx} y={cy + 29} textAnchor="middle" fontSize={20} fontWeight={800} fill={BAND_COLOR[band]}>SVI {value}</text>
    </svg>
  )
}

/* the four weighted terms as one stacked bar */
export function SviBar({ parts }: { parts: { S: number; L: number; V: number; C: number } }) {
  const seg = [
    ['S', parts.S, '#b76e00', 'screeners'], ['L', parts.L, '#5846b5', 'language'],
    ['V', parts.V, '#0e7c86', 'voice'], ['C', parts.C, '#6b7785', 'context'],
  ] as const
  const total = parts.S + parts.L + parts.V + parts.C
  return (
    <div>
      <div className="flex h-5 overflow-hidden rounded bg-[#e3e8ee] text-[10.5px] font-bold text-white">
        {seg.map(([k, v, c]) => v > 0 && (
          <div key={k} style={{ width: `${v}%`, background: c }} className="flex items-center overflow-hidden whitespace-nowrap pl-1">{v >= 9 ? `${k} ${v}` : k}</div>
        ))}
        <div className="flex flex-1 items-center justify-end pr-1 text-muted">/100</div>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10.5px] whitespace-nowrap text-muted">
        {seg.map(([k, , c, n]) => <span key={k}><b style={{ color: c }}>{k}</b> {n}</span>)}
        <span className="ml-auto">total {total}</span>
      </div>
    </div>
  )
}

export function Card({ title, right, children, className = '' }: { title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-white p-4 shadow-sm ${className}`}>
      {title && (
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-[13px] font-bold tracking-wide text-navy uppercase">{title}</h3>
          <div className="ml-auto">{right}</div>
        </div>
      )}
      {children}
    </section>
  )
}

export const KIND_STYLE: Record<string, string> = {
  legal: 'bg-[#e6f3e8] text-[#1f4f27] border-[#b9dcbf]',
  clinical: 'bg-[#efecfa] text-[#3d2f8f] border-[#cfc8ee]',
  safety: 'bg-[#fbe8e6] text-[#8e1f18] border-[#efc4bf]',
  admin: 'bg-[#e9eff5] text-[#14375e] border-[#c9d6e4]',
}
