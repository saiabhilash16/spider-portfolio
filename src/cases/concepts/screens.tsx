import type { ReactNode } from 'react'
import { StatusBar } from '../common/Phone'

/* High-fidelity concept screens (320×692). The SAME components render as wireframes when wrapped
 * in `.wf` (see index.css): text marked `t` becomes grey bars, graphics marked `g` become grey boxes.
 * Sample content in these mockups is fictional. */

const Scr = ({ bg, children, dark = false }: { bg: string; children: ReactNode; dark?: boolean }) => (
  <div className="scr absolute inset-0 flex flex-col overflow-hidden" style={{ background: bg }}><StatusBar dark={dark} />{children}</div>
)

/* ================================ LANDED ================================ */
const L = { paper: '#FFF4E8', ink: '#2B1606', orange: '#F97316', teal: '#0F766E' }
const tasks = [['Phone plan', 'Day 1', true], ['SSN appointment', 'Day 2', true], ['Bank account', 'Day 3', false], ['Transit card', 'Day 4', false], ['Health insurance', 'Day 5', false]] as const
export function LandedChecklist() {
  return (
    <Scr bg={L.paper}>
      <div className="px-5 pt-2" style={{ color: L.ink }}>
        <div className="t text-[11px] font-semibold tracking-[0.2em]" style={{ color: L.teal }}>WEEK 1 · BALTIMORE</div>
        <div className="t mt-1 font-fraunces text-[28px] font-semibold leading-tight">Your first week</div>
        <div className="g mt-4 flex items-center gap-3 rounded-2xl p-3" style={{ background: L.ink, color: L.paper }}>
          <div className="g grid h-12 w-12 place-items-center rounded-full border-2 border-dashed text-[11px] font-bold" style={{ borderColor: L.orange, color: L.orange }}>2/6</div>
          <div><div className="t text-[13px] font-semibold">2 stamps collected</div><div className="t text-[11px] opacity-70">Next: open a bank account</div></div>
        </div>
        <div className="mt-4 space-y-2">
          {tasks.map(([t, d, done]) => (
            <div key={t} className="g flex items-center gap-3 rounded-xl border bg-white px-3 py-3" style={{ borderColor: '#F1DFC8' }}>
              <span className="g grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: done ? L.teal : '#E8D5BC' }}>{done ? '✓' : ''}</span>
              <span className={`t flex-1 text-[14px] font-semibold ${done ? 'line-through opacity-50' : ''}`}>{t}</span>
              <span className="t text-[11px] font-semibold" style={{ color: L.orange }}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </Scr>
  )
}
export function LandedGuide() {
  return (
    <Scr bg={L.paper}>
      <div className="px-5 pt-2" style={{ color: L.ink }}>
        <div className="t text-[12px] font-semibold" style={{ color: L.teal }}>← Checklist</div>
        <div className="t mt-2 text-[11px] font-semibold tracking-[0.2em]" style={{ color: L.orange }}>DAY 3 · ABOUT 45 MIN</div>
        <div className="t font-fraunces text-[26px] font-semibold leading-tight">Open a bank account</div>
        <div className="g mt-3 rounded-2xl border-2 border-dashed p-3" style={{ borderColor: L.orange }}>
          <div className="t text-[11px] font-bold tracking-[0.15em]" style={{ color: L.orange }}>BRING THESE</div>
          {['Passport', 'I-20 / visa documents', 'Proof of address', 'Student ID'].map((x) => <div key={x} className="t mt-1.5 text-[13px]">☐ {x}</div>)}
        </div>
        <div className="mt-4 space-y-3">
          {['Choose a bank near campus', 'Book an appointment', 'Ask for a student checking account'].map((x, i) => (
            <div key={x} className="flex gap-3"><span className="g grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: L.teal }}>{i + 1}</span><span className="t text-[13px] leading-snug">{x}</span></div>
          ))}
        </div>
        <div className="g mt-5 rounded-full py-3 text-center text-[14px] font-bold text-white" style={{ background: L.orange }}><span className="t">Mark as done</span></div>
      </div>
    </Scr>
  )
}
export function LandedPassport() {
  const st = [['PHONE', -8, L.teal], ['SSN', 6, L.orange], ['BANK', -4, '#B45309'], ['', 0, ''], ['', 0, ''], ['', 0, '']] as const
  return (
    <Scr bg={L.ink} dark>
      <div className="px-5 pt-2 text-[#FFF4E8]">
        <div className="t text-[11px] font-semibold tracking-[0.2em]" style={{ color: L.orange }}>YOUR PASSPORT</div>
        <div className="t font-fraunces text-[26px] font-semibold">3 of 6 stamps</div>
        <div className="g mt-4 grid grid-cols-2 gap-3 rounded-2xl p-4" style={{ background: L.paper }}>
          {st.map(([t, r, c], i) => (
            <div key={i} className="g grid aspect-square place-items-center rounded-full border-[3px] border-dashed" style={{ borderColor: c || '#E8D5BC', transform: `rotate(${r}deg)`, color: c }}>
              <span className="t font-fraunces text-[15px] font-bold">{t || '—'}</span>
            </div>
          ))}
        </div>
        <div className="t mt-4 text-center text-[12px] opacity-70">Every finished task becomes a stamp.</div>
      </div>
    </Scr>
  )
}

/* ================================ SPOTFINDER ================================ */
const S = { bg: '#F5F5F2', ink: '#111111', green: '#10B981', amber: '#F59E0B', red: '#EF4444' }
const Dot = ({ c }: { c: string }) => <span className="g inline-block h-3 w-3 rounded-full" style={{ background: c }} />
export function SpotMap() {
  const rooms = [[60, 120, S.green, 'Library 3F'], [190, 90, S.amber, 'Hall B'], [230, 230, S.green, 'Eng 204'], [90, 280, S.red, 'Commons'], [170, 330, S.green, 'Sci 112']] as const
  return (
    <Scr bg={S.bg}>
      <div className="px-4 pt-1" style={{ color: S.ink }}>
        <div className="t text-[22px] font-black tracking-tight">Free now</div>
        <div className="mt-2 flex gap-1.5">{['Quiet', 'Outlets', 'Group 4+'].map((f, i) => <span key={f} className={`g rounded-full border px-3 py-1 text-[11px] font-bold ${i < 2 ? 'border-black bg-black text-white' : 'border-black/30'}`}><span className="t">{f}</span></span>)}</div>
      </div>
      <div className="g relative mx-4 mt-3 h-[420px] overflow-hidden rounded-xl border border-black/10 bg-white" style={{ backgroundImage: 'linear-gradient(#0001 1px,transparent 1px),linear-gradient(90deg,#0001 1px,transparent 1px)', backgroundSize: '28px 28px' }}>
        {[[20, 60, 110, 90], [150, 40, 120, 100], [180, 190, 100, 110], [40, 240, 110, 80], [130, 300, 110, 90]].map(([x, y, w, h], i) => <div key={i} className="g absolute border border-black/15 bg-black/[0.03]" style={{ left: x, top: y, width: w, height: h }} />)}
        {rooms.map(([x, y, c, n]) => <div key={n} className="absolute flex items-center gap-1" style={{ left: x, top: y }}><span className="g h-4 w-4 rounded-full ring-4" style={{ background: c, ['--tw-ring-color' as string]: c + '33' }} /><span className="t rounded bg-white px-1 text-[10px] font-bold">{n}</span></div>)}
      </div>
      <div className="g mx-4 mt-3 flex items-center justify-between rounded-xl bg-black px-4 py-3 text-white"><span className="t text-[13px] font-bold">3 quiet rooms within 5 min</span><span className="t text-[12px]">List ↓</span></div>
    </Scr>
  )
}
export function SpotRoom() {
  return (
    <Scr bg={S.bg}>
      <div className="px-5 pt-2" style={{ color: S.ink }}>
        <div className="t text-[12px] font-bold">← Map</div>
        <div className="t mt-3 text-[34px] font-black leading-none tracking-tight">Eng 204</div>
        <div className="t mt-1 text-[13px] opacity-60">Engineering Building · 2nd floor</div>
        <div className="g mt-4 flex items-center gap-3 rounded-xl p-4 text-white" style={{ background: S.green }}><span className="g h-3 w-3 rounded-full bg-white" /><div><div className="t text-[16px] font-black">FREE NOW</div><div className="t text-[11px] opacity-90">Updated 2 min ago</div></div></div>
        <div className="mt-4 grid grid-cols-3 border-y border-black/15 py-3 text-center">
          {[['12', 'seats'], ['8', 'outlets'], ['Quiet', 'noise']].map(([a, b]) => <div key={b}><div className="t text-[20px] font-black">{a}</div><div className="t text-[10px] uppercase tracking-[0.15em] opacity-60">{b}</div></div>)}
        </div>
        <div className="t mt-4 text-[12px] leading-relaxed opacity-70">Large tables, natural light, whiteboard. Open until 11 pm.</div>
        <div className="g mt-6 rounded-xl bg-black py-3.5 text-center text-[14px] font-bold text-white"><span className="t">Navigate · 4 min walk</span></div>
      </div>
    </Scr>
  )
}
export function SpotList() {
  const rows = [['Library 3F', '2 min', S.green, 'Quiet · outlets'], ['Eng 204', '4 min', S.green, 'Quiet · 12 seats'], ['Hall B', '5 min', S.amber, 'Filling up'], ['Sci 112', '7 min', S.green, 'Group rooms'], ['Commons', '8 min', S.red, 'Full']] as const
  return (
    <Scr bg={S.bg}>
      <div className="px-4 pt-1" style={{ color: S.ink }}>
        <div className="flex items-end justify-between"><div className="t text-[22px] font-black tracking-tight">Nearby</div><div className="t text-[11px] font-bold">Map ↑</div></div>
        <div className="mt-3 divide-y divide-black/10 border-y border-black/15">
          {rows.map(([n, d, c, s]) => (
            <div key={n} className="flex items-center gap-3 py-3.5">
              <Dot c={c} /><div className="flex-1"><div className="t text-[15px] font-bold">{n}</div><div className="t text-[11px] opacity-60">{s}</div></div><div className="t text-[13px] font-black">{d}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3 text-[10px] font-bold">{[[S.green, 'Free'], [S.amber, 'Filling'], [S.red, 'Full']].map(([c, l]) => <span key={l} className="flex items-center gap-1"><Dot c={c} /><span className="t">{l}</span></span>)}</div>
      </div>
    </Scr>
  )
}

/* ================================ PREPPILOT ================================ */
const P = { bg: '#0B0816', panel: '#151027', violet: '#A78BFA', cyan: '#67E8F9' }
export function PrepChoose() {
  return (
    <Scr bg={P.bg} dark>
      <div className="px-5 pt-2 font-mono text-white">
        <div className="t text-[10px] tracking-[0.3em]" style={{ color: P.violet }}>PREPPILOT</div>
        <div className="t mt-1 font-sans text-[24px] font-bold leading-tight">What are we practising?</div>
        <div className="mt-5 space-y-3">
          {[['Frontend', '10 min · 3 questions', true], ['Behavioural', '15 min · STAR answers', false], ['System design', '20 min · 1 scenario', false]].map(([t, s, on]) => (
            <div key={t as string} className="g rounded-xl border p-4" style={{ borderColor: on ? P.violet : '#ffffff1f', background: on ? '#A78BFA14' : P.panel, boxShadow: on ? `0 0 24px -6px ${P.violet}` : 'none' }}>
              <div className="t font-sans text-[16px] font-bold">{t}</div><div className="t mt-1 text-[11px] text-white/60">{s}</div>
            </div>
          ))}
        </div>
        <div className="g mt-6 rounded-xl py-3.5 text-center font-sans text-[14px] font-bold text-black" style={{ background: P.violet }}><span className="t">Start session</span></div>
      </div>
    </Scr>
  )
}
export function PrepLive() {
  return (
    <Scr bg={P.bg} dark>
      <div className="px-5 pt-2 font-mono text-white">
        <div className="flex justify-between text-[10px] tracking-[0.2em]"><span className="t" style={{ color: P.violet }}>Q 2 / 3</span><span className="t" style={{ color: P.cyan }}>03:42</span></div>
        <div className="g mt-4 rounded-xl border border-white/10 p-4" style={{ background: P.panel }}>
          <div className="t font-sans text-[17px] font-semibold leading-snug">How would you make a slow-loading product list feel fast?</div>
        </div>
        <div className="g mt-6 flex h-24 items-center justify-center gap-[3px] rounded-xl border border-white/10" style={{ background: P.panel }}>
          {Array.from({ length: 34 }, (_, i) => <span key={i} className="g w-[3px] rounded-full" style={{ height: `${18 + Math.abs(Math.sin(i * .9)) * 52}%`, background: i % 3 ? P.violet : P.cyan }} />)}
        </div>
        <div className="t mt-3 text-center text-[11px] text-white/50">Listening… or type your answer</div>
        <div className="mt-8 flex justify-center"><div className="g grid h-16 w-16 place-items-center rounded-full" style={{ background: P.violet, boxShadow: `0 0 40px ${P.violet}` }}><span className="g h-5 w-5 rounded-sm bg-black" /></div></div>
      </div>
    </Scr>
  )
}
export function PrepFeedback() {
  const rows = [['Clarity', 70, 'Clear structure: problem → options → choice.'], ['Trade-offs', 55, 'Mentioned caching; skipped pagination cost.'], ['Depth', 80, 'Good detail on skeleton states.']] as const
  return (
    <Scr bg={P.bg} dark>
      <div className="px-5 pt-2 text-white">
        <div className="t font-mono text-[10px] tracking-[0.3em]" style={{ color: P.violet }}>FEEDBACK · EXPLAINED</div>
        <div className="t mt-1 text-[22px] font-bold">Why these scores</div>
        <div className="mt-4 space-y-3">
          {rows.map(([k, v, why]) => (
            <div key={k} className="g rounded-xl border border-white/10 p-3" style={{ background: P.panel }}>
              <div className="flex justify-between font-mono text-[11px]"><span className="t">{k}</span><span className="t" style={{ color: P.cyan }}>{v}/100</span></div>
              <div className="g mt-2 h-1.5 rounded-full bg-white/10"><div className="g h-full rounded-full" style={{ width: `${v}%`, background: P.violet }} /></div>
              <div className="t mt-2 text-[11px] leading-snug text-white/70">{why}</div>
              <div className="t mt-2 font-mono text-[10px]" style={{ color: P.violet }}>I disagree ✎</div>
            </div>
          ))}
        </div>
      </div>
    </Scr>
  )
}

/* ================================ SPLITNEST ================================ */
const N = { bg: '#FFF1F7', pink: '#F472B6', ink: '#3B0A24', mint: '#A7F3D0', lilac: '#DDD6FE' }
const Ava = ({ l, c }: { l: string; c: string }) => <span className="g grid h-9 w-9 place-items-center rounded-full text-[13px] font-extrabold" style={{ background: c, color: N.ink }}>{l}</span>
export function NestHome() {
  return (
    <Scr bg={N.bg}>
      <div className="px-5 pt-2" style={{ color: N.ink }}>
        <div className="t text-[13px] font-semibold opacity-70">Apartment 4B</div>
        <div className="t text-[26px] font-extrabold leading-tight">Who owes what</div>
        <div className="g mt-4 rounded-[28px] bg-white p-5 shadow-[0_20px_40px_-20px_rgba(244,114,182,.6)]">
          <div className="t text-[12px] font-semibold opacity-60">You are owed</div>
          <div className="t text-[38px] font-extrabold" style={{ color: N.pink }}>$18.40</div>
        </div>
        <div className="mt-4 space-y-2.5">
          {[['A', N.mint, 'Alex owes you', '$12.40'], ['J', N.lilac, 'Jo owes you', '$6.00'], ['S', '#FDE68A', 'Sam is settled', '✓']].map(([l, c, t, v]) => (
            <div key={l} className="g flex items-center gap-3 rounded-[22px] bg-white/80 px-4 py-3"><Ava l={l} c={c} /><span className="t flex-1 text-[14px] font-semibold">{t}</span><span className="t text-[14px] font-extrabold">{v}</span></div>
          ))}
        </div>
        <div className="g mt-5 rounded-full py-3.5 text-center text-[14px] font-extrabold text-white" style={{ background: N.pink }}><span className="t">Settle up</span></div>
      </div>
    </Scr>
  )
}
export function NestList() {
  const items = [['Milk', 'A', N.mint, true], ['Eggs', 'J', N.lilac, true], ['Rice 5 lb', 'You', N.pink, false], ['Dish soap', 'S', '#FDE68A', false], ['Bananas', '—', '#eee', false]] as const
  return (
    <Scr bg={N.bg}>
      <div className="px-5 pt-2" style={{ color: N.ink }}>
        <div className="t text-[26px] font-extrabold">Shared list</div>
        <div className="t text-[12px] opacity-60">Tap an item to say you’ll buy it</div>
        <div className="mt-4 space-y-2.5">
          {items.map(([n, who, c, done]) => (
            <div key={n} className="g flex items-center gap-3 rounded-[20px] bg-white px-4 py-3 shadow-[0_10px_24px_-18px_rgba(59,10,36,.5)]">
              <span className="g grid h-6 w-6 place-items-center rounded-full border-2 text-[11px] font-black" style={{ borderColor: N.pink, background: done ? N.pink : 'transparent', color: '#fff' }}>{done ? '✓' : ''}</span>
              <span className={`t flex-1 text-[14px] font-semibold ${done ? 'line-through opacity-50' : ''}`}>{n}</span>
              <span className="g rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: c }}><span className="t">{who}</span></span>
            </div>
          ))}
        </div>
        <div className="g mt-4 rounded-[20px] border-2 border-dashed py-3 text-center text-[13px] font-bold" style={{ borderColor: N.pink, color: N.pink }}><span className="t">+ Add item</span></div>
      </div>
    </Scr>
  )
}
export function NestSplit() {
  return (
    <Scr bg={N.bg}>
      <div className="px-5 pt-2" style={{ color: N.ink }}>
        <div className="t text-[13px] font-semibold opacity-60">New expense</div>
        <div className="t text-[26px] font-extrabold">Groceries · $36.80</div>
        <div className="g mt-4 flex rounded-full bg-white p-1 text-[13px] font-bold">
          <span className="g flex-1 rounded-full py-2 text-center text-white" style={{ background: N.pink }}><span className="t">Equally</span></span><span className="flex-1 py-2 text-center opacity-60"><span className="t">By item</span></span>
        </div>
        <div className="mt-4 space-y-2.5">
          {[['You', N.pink], ['A', N.mint], ['J', N.lilac], ['S', '#FDE68A']].map(([l, c]) => (
            <div key={l} className="g flex items-center gap-3 rounded-[20px] bg-white px-4 py-3"><Ava l={l === 'You' ? 'Y' : l} c={c} /><span className="t flex-1 text-[14px] font-semibold">{l === 'You' ? 'You (paid)' : l === 'A' ? 'Alex' : l === 'J' ? 'Jo' : 'Sam'}</span><span className="t text-[14px] font-extrabold">$9.20</span></div>
          ))}
        </div>
        <div className="g mt-5 rounded-full py-3.5 text-center text-[14px] font-extrabold text-white" style={{ background: N.ink }}><span className="t">Save & notify roommates</span></div>
      </div>
    </Scr>
  )
}

/* ================================ PAUSE ================================ */
const Z = { bg: '#EEF2F6', ink: '#334155', soft: '#94A3B8', mist: '#E2E8F0' }
export function PauseFocus() {
  return (
    <Scr bg={Z.bg}>
      <div className="flex flex-1 flex-col items-center px-6 pt-10" style={{ color: Z.ink }}>
        <div className="t text-[11px] tracking-[0.4em]" style={{ color: Z.soft }}>FOCUS</div>
        <div className="g relative mt-10 grid h-56 w-56 place-items-center">
          {[1, .8, .6].map((s) => <span key={s} className="g breathe absolute rounded-full border" style={{ inset: `${(1 - s) * 50}%`, borderColor: '#94A3B866' }} />)}
          <div className="t font-cormorant text-[56px] font-light">18:24</div>
        </div>
        <div className="t mt-10 text-center font-cormorant text-[20px] italic">Statistics, chapter 4</div>
        <div className="g mt-auto mb-10 rounded-full border px-6 py-2 text-[12px]" style={{ borderColor: Z.soft }}><span className="t">End session</span></div>
      </div>
    </Scr>
  )
}
export function PauseNudge() {
  return (
    <Scr bg={Z.bg}>
      <div className="flex flex-1 flex-col px-6 pt-16" style={{ color: Z.ink }}>
        <div className="t font-cormorant text-[34px] font-light leading-tight">Time for a 5-minute pause?</div>
        <div className="t mt-3 text-[13px] leading-relaxed" style={{ color: '#64748B' }}>You’ve focused for 25 minutes. A short break helps the next session.</div>
        <div className="mt-8 space-y-3">
          {['Stretch for 2 minutes', 'Refill your water', 'Step outside'].map((x) => <div key={x} className="g rounded-2xl bg-white/70 px-4 py-4 text-[14px]"><span className="t">{x}</span></div>)}
        </div>
        <div className="mt-8 flex gap-3 text-[13px]"><div className="g flex-1 rounded-full py-3 text-center text-white" style={{ background: Z.ink }}><span className="t">Start pause</span></div><div className="g flex-1 rounded-full border py-3 text-center" style={{ borderColor: Z.soft }}><span className="t">5 more min</span></div></div>
      </div>
    </Scr>
  )
}
export function PauseWeek() {
  const days = [3, 4, 2, 5, 4, 1, 0]
  return (
    <Scr bg={Z.bg}>
      <div className="px-6 pt-8" style={{ color: Z.ink }}>
        <div className="t text-[11px] tracking-[0.4em]" style={{ color: Z.soft }}>THIS WEEK</div>
        <div className="t mt-2 font-cormorant text-[30px] font-light leading-tight">A calm week of focus.</div>
        <div className="g mt-8 flex h-40 items-end justify-between rounded-2xl bg-white/60 px-5 pb-4">
          {days.map((d, i) => <div key={i} className="flex flex-col items-center gap-2"><span className="g w-5 rounded-full" style={{ height: `${10 + d * 22}px`, background: '#CBD5E1' }} /><span className="t text-[10px]" style={{ color: Z.soft }}>{'MTWTFSS'[i]}</span></div>)}
        </div>
        <div className="t mt-6 text-[14px] leading-relaxed">You took real breaks on 5 days. Rest days count too.</div>
      </div>
    </Scr>
  )
}

export const CONCEPT_SCREENS: Record<string, (() => ReactNode)[]> = {
  landed: [LandedChecklist, LandedGuide, LandedPassport],
  spotfinder: [SpotMap, SpotRoom, SpotList],
  preppilot: [PrepChoose, PrepLive, PrepFeedback],
  splitnest: [NestHome, NestList, NestSplit],
  pause: [PauseFocus, PauseNudge, PauseWeek],
}
