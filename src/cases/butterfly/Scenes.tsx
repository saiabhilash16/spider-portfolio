import { useId } from 'react'
import type { SceneKind } from './data'

/* Original illustrated "photographs" for the concept (no stock imagery).
 * Replace with real trip photos later — every <Scene> accepts a `photo` URL override. */
export function Scene({ kind, className = '', photo, label }: { kind: SceneKind; className?: string; photo?: string; label?: string }) {
  const id = useId().replace(/:/g, '')
  if (photo) return <img src={photo} alt={label ?? ''} className={`object-cover ${className}`} />
  const g = (n: string) => `${id}-${n}`
  const sky = (a: string, b: string, c: string) => (
    <linearGradient id={g('sky')} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={a} /><stop offset="0.6" stopColor={b} /><stop offset="1" stopColor={c} />
    </linearGradient>
  )
  const common = { viewBox: '0 0 400 300', preserveAspectRatio: 'xMidYMid slice', className, role: 'img', 'aria-label': label ?? `Illustration: ${kind}` } as const
  switch (kind) {
    case 'ridge':
      return (
        <svg {...common}>
          <defs>{sky('#7FB2FF', '#CFE3FF', '#FCE7D2')}
            <linearGradient id={g('m1')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5D7FB8" /><stop offset="1" stopColor="#9FB7DA" /></linearGradient>
            <linearGradient id={g('m2')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2E4B7A" /><stop offset="1" stopColor="#5675A6" /></linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g('sky')})`} />
          <circle cx="300" cy="96" r="26" fill="#FFF4E0" opacity="0.9" />
          <path d="M0 170 L60 120 L110 150 L170 95 L230 140 L290 110 L350 150 L400 125 L400 300 L0 300Z" fill={`url(#${g('m1')})`} opacity="0.75" />
          <path d="M0 200 L70 160 L130 190 L200 150 L260 185 L330 160 L400 190 L400 300 L0 300Z" fill={`url(#${g('m2')})`} />
          <path d="M0 230 Q120 200 200 225 T400 215 L400 300 L0 300Z" fill="#1B2F52" />
          <path d="M180 300 L230 238 L262 236 L300 300Z" fill="#0F1C33" />
          <g transform="translate(244 214)"><rect x="-2" y="0" width="4" height="12" rx="2" fill="#0B1530" /><circle cy="-3" r="3.2" fill="#0B1530" /></g>
          <path d="M70 70 q6 -5 12 0 q6 -5 12 0" stroke="#40577F" strokeWidth="1.5" fill="none" />
          <path d="M110 88 q4 -3 8 0 q4 -3 8 0" stroke="#40577F" strokeWidth="1.2" fill="none" />
        </svg>
      )
    case 'sunset':
      return (
        <svg {...common}>
          <defs>{sky('#2B3F8F', '#E9809A', '#FFC07A')}</defs>
          <rect width="400" height="300" fill={`url(#${g('sky')})`} />
          <circle cx="200" cy="178" r="40" fill="#FFE3A3" />
          <path d="M0 190 L80 150 L140 175 L210 140 L280 172 L340 150 L400 170 L400 300 L0 300Z" fill="#7A4B78" opacity="0.8" />
          <path d="M0 222 Q100 190 190 214 T400 205 L400 300 L0 300Z" fill="#3D2650" />
          <path d="M40 300 L120 232 Q160 220 200 240 L230 300Z" fill="#20142C" />
          <g transform="translate(150 222)"><rect x="-2" y="0" width="4" height="13" rx="2" fill="#120B1A" /><circle cy="-3" r="3.4" fill="#120B1A" /></g>
        </svg>
      )
    case 'dunes':
      return (
        <svg {...common}>
          <defs>{sky('#5EA8FF', '#BFE0FF', '#F7EAD2')}
            <linearGradient id={g('d1')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F2D3A0" /><stop offset="1" stopColor="#D9A866" /></linearGradient>
            <linearGradient id={g('d2')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E8BE7E" /><stop offset="1" stopColor="#B9844A" /></linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${g('sky')})`} />
          <rect y="150" width="400" height="30" fill="#3E86D6" />
          <rect y="150" width="400" height="4" fill="#9CCBFF" opacity="0.7" />
          <path d="M0 175 Q90 140 180 172 T400 165 L400 300 L0 300Z" fill={`url(#${g('d1')})`} />
          <path d="M0 230 Q120 170 230 215 T400 205 L400 300 L0 300Z" fill={`url(#${g('d2')})`} />
          <path d="M60 300 Q150 235 260 300" fill="none" stroke="#F7E3BF" strokeWidth="2" strokeDasharray="3 6" />
          <path d="M20 205 q30 -6 60 0 M240 196 q40 -8 80 0" stroke="#FFF3DD" strokeWidth="1.4" fill="none" opacity="0.8" />
          <g stroke="#8C6A3E" strokeWidth="1.4"><path d="M330 214 l4 -14 M338 216 l1 -16 M346 214 l-3 -13" /></g>
        </svg>
      )
    case 'coast':
      return (
        <svg {...common}>
          <defs>{sky('#8BB8F0', '#DCEBFF', '#F3F7FF')}</defs>
          <rect width="400" height="300" fill={`url(#${g('sky')})`} />
          <rect y="150" width="400" height="150" fill="#2D6CB5" />
          <path d="M0 160 h400" stroke="#BBD9FF" strokeWidth="2" opacity="0.6" />
          <path d="M0 175 L60 160 L120 185 L170 170 L200 200 L150 240 L60 250 L0 260Z" fill="#9A8C82" />
          <path d="M0 210 L80 200 L150 230 L210 280 L0 300Z" fill="#6E625B" />
          <path d="M260 300 L300 240 L360 228 L400 240 L400 300Z" fill="#7C6F67" />
          {[30, 52, 74, 300, 330, 362].map((x, i) => (
            <path key={i} d={`M${x} ${i < 3 ? 182 : 236} l10 -38 l10 38Z`} fill="#1F4A3A" />
          ))}
          <path d="M150 262 q20 -6 40 0 q20 6 40 0" stroke="#E6F1FF" strokeWidth="2" fill="none" opacity="0.8" />
        </svg>
      )
    case 'forest':
      return (
        <svg {...common}>
          <defs>{sky('#BFE3C8', '#E8F4E4', '#F4F1E6')}</defs>
          <rect width="400" height="300" fill={`url(#${g('sky')})`} />
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M${i * 30 - 10} 300 L${i * 30 + 12} ${120 + (i % 3) * 18} L${i * 30 + 34} 300Z`} fill={i % 2 ? '#2F6B4F' : '#3E8462'} opacity={0.6 + (i % 3) * 0.12} />
          ))}
          <path d="M170 300 Q200 230 230 200 Q245 190 250 180" stroke="#C9A77A" strokeWidth="18" fill="none" strokeLinecap="round" />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={i * 70 + 10} y="120" width="10" height="180" fill="#3B2A20" opacity="0.85" />
          ))}
          <g fill="#FFF7D6" opacity="0.5">{[80, 160, 260, 330].map((x) => <circle key={x} cx={x} cy={150 + (x % 40)} r="2" />)}</g>
        </svg>
      )
    case 'cafe':
      return (
        <svg {...common}>
          <defs>{sky('#F7E8D6', '#F2DCC4', '#E9CBA9')}</defs>
          <rect width="400" height="300" fill={`url(#${g('sky')})`} />
          <rect x="40" y="40" width="150" height="120" rx="6" fill="#CFE3FF" stroke="#8B5E3C" strokeWidth="6" />
          <path d="M115 40 v120 M40 100 h150" stroke="#8B5E3C" strokeWidth="4" />
          <path d="M60 140 q20 -30 40 0 M130 120 q15 -20 30 0" stroke="#3E8462" strokeWidth="3" fill="none" />
          <rect x="230" y="60" width="130" height="10" rx="2" fill="#8B5E3C" />
          {[244, 278, 312].map((x, i) => <rect key={x} x={x} y={36 - i * 4} width="22" height={24 + i * 4} rx="3" fill={['#2F6BFF', '#E8590C', '#1F7A5A'][i]} />)}
          <rect y="200" width="400" height="100" fill="#7A5236" />
          <rect x="90" y="186" width="220" height="16" rx="4" fill="#5E3E28" />
          <g transform="translate(170 150)">
            <path d="M0 0 h44 l-6 36 h-32Z" fill="#FFFFFF" />
            <path d="M44 8 q16 2 8 16 l-10 2" stroke="#FFFFFF" strokeWidth="5" fill="none" />
            <path d="M14 -10 q-6 -8 2 -16 M26 -10 q-6 -8 2 -16" stroke="#C8B6A6" strokeWidth="3" fill="none" />
          </g>
          <ellipse cx="192" cy="190" rx="34" ry="5" fill="#4A3020" opacity="0.5" />
        </svg>
      )
    case 'harbor':
      return (
        <svg {...common}>
          <defs>{sky('#1E2B5C', '#5B6CA8', '#F0A27A')}</defs>
          <rect width="400" height="300" fill={`url(#${g('sky')})`} />
          {[[20, 70], [60, 110], [110, 80], [150, 130], [210, 95], [260, 120], [310, 75], [350, 105]].map(([x, h], i) => (
            <g key={i}><rect x={x} y={180 - h} width="36" height={h} fill="#16203F" />
              {Array.from({ length: Math.floor(h / 18) }, (_, k) => <rect key={k} x={x + 8 + (k % 2) * 14} y={190 - h + k * 16} width="6" height="6" fill="#FFC872" opacity={0.85} />)}
            </g>
          ))}
          <rect y="180" width="400" height="120" fill="#13244A" />
          {[40, 120, 200, 280, 360].map((x) => <rect key={x} x={x} y={196 + (x % 30)} width="34" height="3" fill="#FFC872" opacity="0.55" />)}
          <path d="M240 210 h90 l-12 18 h-66Z" fill="#E8EDF7" /><rect x="280" y="170" width="3" height="40" fill="#E8EDF7" />
        </svg>
      )
  }
}
