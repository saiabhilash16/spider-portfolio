import type { ReactNode } from 'react'

/** Device frame. Screens are designed at 320×692 and scaled as a whole, so text stays crisp. */
export const SCREEN_W = 320
export const SCREEN_H = 692
const BEZEL = 11

export function Phone({ children, scale = 1, className = '', tilt, label }: {
  children: ReactNode; scale?: number; className?: string; tilt?: string; label?: string
}) {
  const W = SCREEN_W + BEZEL * 2
  const H = SCREEN_H + BEZEL * 2
  return (
    <figure className={`relative shrink-0 ${className}`} style={{ width: W * scale, height: H * scale, transform: tilt }} aria-label={label}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <div className="absolute inset-0 rounded-[52px] bg-[#0B0F1A] shadow-[0_40px_80px_-30px_rgba(11,21,48,0.55),inset_0_0_0_2px_#2A3045]" />
        <div className="absolute overflow-hidden rounded-[42px] bg-white" style={{ left: BEZEL, top: BEZEL, width: SCREEN_W, height: SCREEN_H }}>
          {children}
          {/* dynamic island */}
          <div className="pointer-events-none absolute left-1/2 top-[9px] h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
        </div>
      </div>
    </figure>
  )
}

export function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex h-[46px] items-center justify-between px-7 pt-1 text-[13px] font-semibold ${dark ? 'text-white' : 'text-[#0B1530]'}`}>
      <span>9:41</span>
      <span className="flex items-center gap-1.5" aria-hidden>
        <svg width="16" height="10" viewBox="0 0 16 10"><g fill="currentColor"><rect x="0" y="6" width="3" height="4" rx="1" /><rect x="4.3" y="4" width="3" height="6" rx="1" /><rect x="8.6" y="2" width="3" height="8" rx="1" /><rect x="12.9" y="0" width="3" height="10" rx="1" /></g></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="18" height="10" rx="3" fill="none" stroke="currentColor" opacity="0.5" /><rect x="2" y="2" width="14" height="7" rx="2" fill="currentColor" /><rect x="19.5" y="3.5" width="1.5" height="4" rx="0.7" fill="currentColor" opacity="0.5" /></svg>
      </span>
    </div>
  )
}
