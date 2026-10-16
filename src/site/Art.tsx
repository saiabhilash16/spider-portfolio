import type { ReactNode } from 'react'
import { Phone } from '../cases/common/Phone'
import { AppScreen, staticState } from '../cases/butterfly/Screens'

/* Artwork for the Work pages — all built in code.
 * Project visuals are ILLUSTRATIVE RECREATIONS of the interface type (not production screenshots).
 * Concept motifs express each concept's design idea. No characters. */

const bar = (w: string, c = 'bg-white/15', h = 'h-2') => <div className={`${h} rounded-full ${c}`} style={{ width: w }} />

function Browser({ children, accent, url }: { children: ReactNode; accent: string; url: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-[14px] border border-white/10 bg-[#0b0d14] shadow-[0_60px_120px_-40px_rgba(0,0,0,.9)]" style={{ boxShadow: `0 0 0 1px rgba(255,255,255,.05), 0 50px 120px -40px ${accent}66, 0 40px 80px -30px rgba(0,0,0,.9)` }}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e8202f]" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" /><span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <div className="ml-3 flex-1 truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[10px] text-white/40">{url}</div>
      </div>
      {children}
    </div>
  )
}

export function PortalArt() {
  const a = '#22D3EE'
  return (
    <Browser accent={a} url="service-portal / search">
      <div className="grid grid-cols-[44px_1fr] sm:grid-cols-[150px_1fr]">
        <aside className="hidden space-y-3 border-r border-white/10 p-4 sm:block">
          {['Search', 'My requests', 'Knowledge', 'Teams'].map((t, i) => (
            <div key={t} className={`rounded-md px-2 py-1.5 text-[11px] ${i === 0 ? 'bg-white/10 text-white' : 'text-white/45'}`}>{t}</div>
          ))}
        </aside>
        <aside className="space-y-3 border-r border-white/10 p-3 sm:hidden">{[0, 1, 2].map((i) => <div key={i} className="h-5 w-5 rounded bg-white/10" />)}</aside>
        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-3 rounded-lg border px-4 py-3" style={{ borderColor: a + '88', boxShadow: `0 0 30px -10px ${a}` }}>
            <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><circle cx="8" cy="8" r="6" stroke={a} strokeWidth="2" fill="none" /><path d="M13 13l5 5" stroke={a} strokeWidth="2" /></svg>
            <span className="text-[12px] text-white/80">Ask a question or search documents…</span>
            <span className="ml-auto hidden rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] text-white/50 sm:inline">AI</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center gap-2 font-mono text-[9px] tracking-[0.2em]" style={{ color: a }}>● AI ANSWER</div>
            <div className="space-y-2">{bar('92%')}{bar('85%')}{bar('64%')}</div>
            <div className="mt-4 flex flex-wrap gap-2">{['Source 1', 'Source 2', 'Source 3'].map((s) => <span key={s} className="rounded border border-white/15 px-2 py-0.5 text-[9px] text-white/50">{s}</span>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 p-3"><div className="mb-2 font-mono text-[9px] tracking-[0.2em] text-white/40">ROUTE REQUEST</div>{bar('70%', 'bg-white/20')}<div className="mt-3 inline-block rounded px-2 py-1 text-[9px] font-semibold text-black" style={{ background: a }}>Suggested team</div></div>
            <div className="rounded-lg border border-white/10 p-3"><div className="mb-2 font-mono text-[9px] tracking-[0.2em] text-white/40">RELATED</div><div className="space-y-2">{bar('80%')}{bar('60%')}{bar('72%')}</div></div>
          </div>
        </div>
      </div>
    </Browser>
  )
}

export function CommerceArt() {
  const a = '#F59E0B'
  const steps = ['Cart', 'Shipping', 'Payment', 'Review']
  return (
    <Browser accent={a} url="store / checkout">
      <div className="grid gap-4 p-4 sm:grid-cols-[1.4fr_1fr] sm:p-6">
        <div>
          <ol className="mb-5 flex items-center gap-2" aria-hidden>
            {steps.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-bold" style={{ background: i <= 2 ? a : 'rgba(255,255,255,.1)', color: i <= 2 ? '#000' : '#fff8' }}>{i + 1}</span>
                <span className={`hidden text-[10px] sm:inline ${i === 2 ? 'text-white' : 'text-white/40'}`}>{s}</span>
                {i < 3 && <span className="h-px flex-1" style={{ background: i < 2 ? a : 'rgba(255,255,255,.15)' }} />}
              </li>
            ))}
          </ol>
          <div className="space-y-3 rounded-lg border border-white/10 p-4">
            <div className="font-mono text-[9px] tracking-[0.2em] text-white/40">PAYMENT</div>
            <div className="h-8 rounded border border-white/15" /><div className="grid grid-cols-2 gap-3"><div className="h-8 rounded border border-white/15" /><div className="h-8 rounded border border-white/15" /></div>
            <div className="mt-2 h-9 rounded text-center text-[11px] font-bold leading-9 text-black" style={{ background: a }}>Continue to review</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-white/10 p-4">
            <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[9px] tracking-[0.2em] text-white/40">ORDER</span><span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] text-emerald-300">In stock</span></div>
            {[0, 1].map((i) => <div key={i} className="mb-2 flex items-center gap-3"><div className="h-9 w-9 rounded bg-white/10" /><div className="flex-1 space-y-1.5">{bar('80%')}{bar('40%', 'bg-white/10')}</div></div>)}
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <div className="mb-3 font-mono text-[9px] tracking-[0.2em] text-white/40">TRACKING</div>
            {['Ordered', 'Packed', 'Shipped', 'Delivered'].map((t, i) => (
              <div key={t} className="flex items-center gap-2 py-0.5"><span className="h-2 w-2 rounded-full" style={{ background: i < 3 ? a : 'rgba(255,255,255,.2)' }} /><span className={`text-[10px] ${i < 3 ? 'text-white/80' : 'text-white/35'}`}>{t}</span></div>
            ))}
          </div>
        </div>
      </div>
    </Browser>
  )
}

export function ButterflyArt() {
  return (
    <div className="relative flex items-end justify-center gap-4 sm:gap-8" aria-label="Butterfly app screens">
      <div className="hidden translate-y-10 sm:block"><Phone scale={0.58} label="Home screen"><AppScreen s={staticState('home')} /></Phone></div>
      <Phone scale={0.7} label="Place details screen"><AppScreen s={staticState('place', 'ridge')} /></Phone>
      <div className="hidden translate-y-16 2xl:block"><Phone scale={0.54} label="Add a discovery screen"><AppScreen s={staticState('add')} /></Phone></div>
    </div>
  )
}

/* ------------------------------ concept motifs ------------------------------ */
export function LandedArt({ big = false }: { big?: boolean }) {
  const a = '#FB923C'
  const stamps = [
    { t: 'SSN', s: 'DAY 2', x: 6, y: 10, r: -12, shape: 'rounded-full' },
    { t: 'BANK', s: 'DAY 3', x: 52, y: 4, r: 8, shape: 'rounded-[10px]' },
    { t: 'PHONE', s: 'DAY 1', x: 30, y: 44, r: -4, shape: 'rounded-full' },
    { t: 'TRANSIT', s: 'DAY 4', x: 62, y: 52, r: 14, shape: 'rounded-[4px]' },
  ]
  return (
    <div className={`relative w-full ${big ? 'aspect-[4/3]' : 'aspect-[5/4]'} overflow-hidden rounded-sm bg-[#1a0f08]`} aria-hidden>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 22px, rgba(251,146,60,.18) 22px 23px)' }} />
      <div className="absolute left-[6%] top-[70%] font-mono text-[10px] tracking-[0.3em] text-[#FB923C]/60">FIRST WEEK · CHECKLIST</div>
      {stamps.map((s) => (
        <div key={s.t} className={`absolute grid aspect-square w-[34%] place-items-center border-[3px] border-dashed ${s.shape}`} style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `rotate(${s.r}deg)`, borderColor: a, color: a, boxShadow: `0 0 40px -10px ${a}` }}>
          <div className="text-center"><div className="t1-display text-[clamp(18px,3vw,40px)] leading-none">{s.t}</div><div className="mt-1 font-mono text-[9px] tracking-[0.3em]">{s.s} ✓</div></div>
        </div>
      ))}
    </div>
  )
}

export function SpotFinderArt({ big = false }: { big?: boolean }) {
  const dots = [
    { x: 22, y: 30, c: '#34D399', l: 'QUIET' }, { x: 58, y: 22, c: '#FBBF24', l: 'BUSY' }, { x: 74, y: 60, c: '#34D399', l: 'OUTLETS' },
    { x: 36, y: 66, c: '#F87171', l: 'FULL' }, { x: 84, y: 30, c: '#34D399', l: 'GROUP 4' },
  ]
  return (
    <div className={`relative w-full ${big ? 'aspect-[4/3]' : 'aspect-[5/4]'} overflow-hidden rounded-sm bg-[#07130e]`} aria-hidden>
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(52,211,153,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      {[[8, 12, 26, 30], [44, 8, 24, 26], [70, 44, 24, 30], [16, 52, 34, 30], [72, 12, 22, 24]].map(([x, y, w, h], i) => (
        <div key={i} className="absolute border border-[#34D399]/25 bg-[#34D399]/[0.04]" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }} />
      ))}
      {dots.map((d) => (
        <div key={d.l} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
          <span className="block h-4 w-4 rounded-full" style={{ background: d.c, boxShadow: `0 0 0 6px ${d.c}33, 0 0 30px ${d.c}` }} />
          <span className="absolute left-6 top-0 whitespace-nowrap font-mono text-[9px] tracking-[0.25em] text-white/70">{d.l}</span>
        </div>
      ))}
    </div>
  )
}

export function PrepPilotArt({ big = false }: { big?: boolean }) {
  const a = '#A78BFA'
  return (
    <div className={`relative w-full ${big ? 'aspect-[4/3]' : 'aspect-[5/4]'} overflow-hidden rounded-sm bg-[#0c0817] p-[6%]`} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_30%_40%,rgba(167,139,250,.25),transparent_70%)]" />
      <div className="relative grid h-full grid-cols-[1fr_1.2fr] gap-[6%]">
        <div className="grid place-items-center">
          <svg viewBox="0 0 120 120" className="w-full max-w-[220px]"><circle cx="60" cy="60" r="50" stroke="#ffffff1a" strokeWidth="6" fill="none" /><circle cx="60" cy="60" r="50" stroke={a} strokeWidth="6" fill="none" strokeDasharray="230 400" strokeLinecap="round" transform="rotate(-90 60 60)" style={{ filter: `drop-shadow(0 0 8px ${a})` }} /><text x="60" y="58" textAnchor="middle" fill="#fff" fontSize="10" fontFamily="monospace" letterSpacing="2">SCORE</text><text x="60" y="74" textAnchor="middle" fill={a} fontSize="9" fontFamily="monospace">— · —</text></svg>
        </div>
        <div className="flex flex-col justify-center gap-3">
          <div className="font-mono text-[10px] tracking-[0.3em]" style={{ color: a }}>WHY THIS SCORE</div>
          {['Clarity', 'Structure', 'Trade-offs', 'Edge cases'].map((k, i) => (
            <div key={k}><div className="mb-1 flex justify-between font-mono text-[9px] text-white/60"><span>{k}</span><span>edit ✎</span></div><div className="h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${[70, 55, 80, 40][i]}%`, background: a }} /></div></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SplitNestArt({ big = false }: { big?: boolean }) {
  const a = '#F9A8D4'
  return (
    <div className={`relative w-full ${big ? 'aspect-[4/3]' : 'aspect-[5/4]'} overflow-hidden rounded-sm bg-[#1a0c14] p-[7%]`} aria-hidden>
      <div className="absolute -right-[10%] -top-[20%] h-[70%] w-[70%] rounded-full bg-[#F9A8D4]/20 blur-3xl" />
      <div className="relative mx-auto flex h-full max-w-[380px] flex-col justify-center gap-3">
        <div className="font-mono text-[10px] tracking-[0.3em]" style={{ color: a }}>WHO OWES WHAT</div>
        {[['A', 'owes', 'B'], ['C', 'owes', 'A'], ['B', 'settled', '✓']].map(([x, v, y], i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 backdrop-blur" style={{ transform: `translateX(${i * 6}%)`, boxShadow: '0 20px 40px -20px rgba(0,0,0,.8)' }}>
            <span className="grid h-8 w-8 place-items-center rounded-full text-[12px] font-bold text-black" style={{ background: a }}>{x}</span>
            <span className="text-[12px] text-white/60">{v}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-[12px] font-bold text-white">{y}</span>
            <div className="ml-auto h-2 w-16 rounded-full bg-white/15" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PauseArt({ big = false }: { big?: boolean }) {
  return (
    <div className={`relative grid w-full ${big ? 'aspect-[4/3]' : 'aspect-[5/4]'} place-items-center overflow-hidden rounded-sm bg-[#0d0f12]`} aria-hidden>
      {[1, .78, .56, .34].map((s, i) => (
        <span key={s} className="breathe absolute aspect-square rounded-full border border-[#CBD5E1]/25" style={{ width: `${s * 80}%`, animationDelay: `${i * .5}s` }} />
      ))}
      <div className="relative text-center">
        <div className="t1-display text-[clamp(36px,6vw,80px)] leading-none text-[#E2E8F0]">25:00</div>
        <div className="mt-2 font-mono text-[10px] tracking-[0.5em] text-white/50">BREATHE · FOCUS</div>
      </div>
    </div>
  )
}

export const CONCEPT_ART: Record<string, (p: { big?: boolean }) => ReactNode> = {
  landed: LandedArt, spotfinder: SpotFinderArt, preppilot: PrepPilotArt, splitnest: SplitNestArt, pause: PauseArt,
}
export const PROJECT_ART: Record<string, () => ReactNode> = { portal: PortalArt, commerce: CommerceArt }
