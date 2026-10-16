import { CAT_COLOR, type Place } from './data'

/* Concept map (original artwork — not real map data). Coordinates: 1000 × 700. */
export function MapView({ places, selected, onSelect, compact = false, className = '', viewBox = '0 0 1000 700' }: {
  places: Place[]; selected?: string | null; onSelect?: (id: string) => void; compact?: boolean; className?: string; viewBox?: string
}) {
  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid slice" className={className} role="group" aria-label="Concept map of nearby places">
      <rect width="1000" height="700" fill="#EEF3F8" />
      {/* bay + river */}
      <path d="M0 470 C 120 430 220 520 330 560 C 420 595 380 700 380 700 L0 700Z" fill="#BFD9F7" />
      <path d="M0 470 C 120 430 220 520 330 560" fill="none" stroke="#A6C8F0" strokeWidth="3" />
      <path d="M1000 300 C 900 330 860 420 760 450 C 650 485 600 600 520 700" fill="none" stroke="#BFD9F7" strokeWidth="26" strokeLinecap="round" />
      {/* parks / forests */}
      <path d="M420 40 C 560 20 700 60 760 140 C 820 230 720 290 620 270 C 520 250 440 180 420 40Z" fill="#CFE8D6" />
      <path d="M800 470 C 880 450 990 500 1000 560 L1000 700 L760 700 C 760 620 760 520 800 470Z" fill="#F3E3C5" />
      <path d="M60 560 C 110 540 190 580 200 640 L60 700Z" fill="#CFE8D6" opacity="0.8" />
      {/* roads */}
      <g stroke="#FFFFFF" strokeWidth="14" fill="none" strokeLinecap="round">
        <path d="M0 360 C 200 340 400 380 600 360 S 900 330 1000 340" />
        <path d="M300 0 C 320 160 300 320 340 460" />
        <path d="M160 120 L 560 520" />
      </g>
      <g stroke="#DCE4EE" strokeWidth="5" fill="none"><path d="M0 220 L 300 200 M600 360 L 640 700 M700 0 L 680 360" /></g>
      {/* trails */}
      <path d="M470 90 C 540 130 600 180 640 210 C 700 250 740 300 770 330" fill="none" stroke="#1F7A5A" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
      <path d="M820 520 C 850 540 870 550 880 560" fill="none" stroke="#B9844A" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
      {!compact && (
        <g fill="#5B6B85" fontFamily="Inter, sans-serif" fontSize="18" fontWeight="600" letterSpacing="3">
          <text x="520" y="70">RIDGE PARK</text><text x="70" y="420">HARBOR</text><text x="860" y="680">DUNES</text><text x="330" y="340">OLD TOWN</text>
        </g>
      )}
      {/* "you are here" */}
      <g transform="translate(360 380)"><circle r="34" fill="#2F6BFF" opacity="0.12" /><circle r="11" fill="#2F6BFF" stroke="#fff" strokeWidth="4" /></g>
      {/* pins */}
      {places.map((p) => {
        const on = selected === p.id
        const c = p.hidden ? '#2F6BFF' : CAT_COLOR[p.categories[0]]
        return (
          <g key={p.id} transform={`translate(${p.map.x} ${p.map.y}) scale(${on ? 1.25 : 1})`}
            className={onSelect ? 'cursor-pointer' : ''} onClick={() => onSelect?.(p.id)}
            role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} aria-label={onSelect ? `${p.name}, ${p.rating} stars` : undefined}
            onKeyDown={(e) => { if (onSelect && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(p.id) } }}
            style={{ transition: 'transform .25s' }}>
            <ellipse cy="4" rx="12" ry="4" fill="#0B1530" opacity="0.18" />
            <path d="M0 0 C -18 -22 -18 -46 0 -48 C 18 -46 18 -22 0 0Z" fill={c} stroke="#fff" strokeWidth="3" />
            {p.hidden ? (
              <g transform="translate(0 -30) scale(0.55)" fill="#fff">
                <path d="M0 2 C -8 -14 -20 -10 -18 -2 C -16 4 -6 4 0 2Z M0 2 C 8 -14 20 -10 18 -2 C 16 4 6 4 0 2Z" />
              </g>
            ) : <circle cy="-30" r="6" fill="#fff" />}
            {on && !compact && (
              <g transform="translate(0 -74)">
                <rect x={-p.name.length * 5.4 - 14} y="-20" width={p.name.length * 10.8 + 28} height="34" rx="17" fill="#0B1530" />
                <text textAnchor="middle" y="3" fill="#fff" fontFamily="Inter, sans-serif" fontSize="17" fontWeight="600">{p.name}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
