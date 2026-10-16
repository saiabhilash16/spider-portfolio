/** Butterfly brand mark (original): two wing pairs that also read as a map pin. */
export function ButterflyMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="bf-wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8EC5FF" /><stop offset="0.55" stopColor="#2F6BFF" /><stop offset="1" stopColor="#1736A8" />
        </linearGradient>
      </defs>
      <path d="M20 21 C 12 4, 1 7, 3 17 C 4 23, 13 24, 20 21Z" fill="url(#bf-wing)" />
      <path d="M20 21 C 28 4, 39 7, 37 17 C 36 23, 27 24, 20 21Z" fill="url(#bf-wing)" />
      <path d="M20 22 C 14 25, 8 32, 12 35 C 16 37, 19 29, 20 22Z" fill="#1736A8" />
      <path d="M20 22 C 26 25, 32 32, 28 35 C 24 37, 21 29, 20 22Z" fill="#1736A8" />
      <rect x="19" y="12" width="2" height="22" rx="1" fill="#0B1530" />
    </svg>
  )
}
