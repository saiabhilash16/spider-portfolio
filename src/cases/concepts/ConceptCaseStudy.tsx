import { useEffect, useRef, type ReactNode } from 'react'
import { caseStudies } from '../../data/content'
import { Phone } from '../common/Phone'
import { CONCEPT_DETAILS } from './data'
import { CONCEPT_SCREENS } from './screens'
import { SiteNav } from '../../site/shared'
import { useReveals } from '../../site/reveal'
import { CTA } from '../../site/FinalScene'

/* Full concept case study (Landed, SpotFinder, PrepPilot, SplitNest, Pause).
 * Same eight-part structure for each — every concept gets its own visual language (THEMES). */

type Theme = { bg: string; ink: string; accent: string; accent2: string; muted: string; card: string; line: string; display: string; radius: string; dark: boolean; deco: ReactNode }
const THEMES: Record<string, Theme> = {
  landed: {
    bg: '#FFF4E8', ink: '#2B1606', accent: '#EA580C', accent2: '#0F766E', muted: '#7C5A3A', card: '#FFFFFF', line: '#F1DFC8',
    display: 'font-fraunces font-semibold tracking-[-0.02em]', radius: 'rounded-2xl', dark: false,
    deco: <div className="absolute inset-0 opacity-[.35]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 31px, #F1DFC8 31px 32px)' }} />,
  },
  spotfinder: {
    bg: '#F5F5F2', ink: '#111111', accent: '#059669', accent2: '#111111', muted: '#555555', card: '#FFFFFF', line: '#11111126',
    display: 'font-sans font-black tracking-[-0.04em]', radius: 'rounded-none', dark: false,
    deco: <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#0000000d 1px,transparent 1px),linear-gradient(90deg,#0000000d 1px,transparent 1px)', backgroundSize: '48px 48px' }} />,
  },
  preppilot: {
    bg: '#0B0816', ink: '#F5F3FF', accent: '#A78BFA', accent2: '#67E8F9', muted: '#A1A1B5', card: '#151027', line: '#ffffff1a',
    display: 'font-mono font-bold uppercase tracking-[-0.02em]', radius: 'rounded-lg', dark: true,
    deco: <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_80%_10%,rgba(167,139,250,.22),transparent_70%),radial-gradient(40%_40%_at_10%_90%,rgba(103,232,249,.12),transparent_70%)]" />,
  },
  splitnest: {
    bg: '#FFF1F7', ink: '#3B0A24', accent: '#DB2777', accent2: '#A7F3D0', muted: '#8A5570', card: '#FFFFFF', line: '#F9D3E6',
    display: 'font-sans font-extrabold tracking-[-0.03em]', radius: 'rounded-[28px]', dark: false,
    deco: <><div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#F9A8D4]/40 blur-3xl" /><div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-[#A7F3D0]/40 blur-3xl" /></>,
  },
  pause: {
    bg: '#EEF2F6', ink: '#334155', accent: '#475569', accent2: '#94A3B8', muted: '#64748B', card: '#FFFFFFB3', line: '#CBD5E1',
    display: 'font-cormorant font-light tracking-[-0.01em]', radius: 'rounded-3xl', dark: false,
    deco: <div className="absolute left-1/2 top-[30%] h-[60vmin] w-[60vmin] -translate-x-1/2 rounded-full border border-[#CBD5E1] breathe" />,
  },
}

export function ConceptCaseStudy({ id }: { id: string }) {
  const root = useRef<HTMLDivElement>(null)
  const i = caseStudies.findIndex((c) => c.id === id)
  const c = caseStudies[i], d = CONCEPT_DETAILS[id], T = THEMES[id], screens = CONCEPT_SCREENS[id]
  const prev = caseStudies[(i - 1 + caseStudies.length) % caseStudies.length], next = caseStudies[(i + 1) % caseStudies.length]
  useReveals(root, [id])
  useEffect(() => { scrollTo(0, 0); requestAnimationFrame(() => document.getElementById('detail-title')?.focus({ preventScroll: true })) }, [id])

  const H = ({ n, k, children }: { n: string; k: string; children: ReactNode }) => (
    <div data-rv="up" className="mb-10">
      <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.3em]" style={{ color: T.accent }}><span>{n}</span><span className="h-px w-10" style={{ background: T.accent }} /><span>{k}</span></div>
      <h2 className={`mt-3 text-[clamp(32px,4.6vw,60px)] leading-[1.02] ${T.display}`}>{children}</h2>
    </div>
  )
  const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`${T.radius} border p-6 ${className}`} style={{ background: T.card, borderColor: T.line }}>{children}</div>
  )
  const Badge = ({ children }: { children: ReactNode }) => (
    <span className={`inline-block border px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] ${T.radius === 'rounded-none' ? '' : 'rounded-full'}`} style={{ borderColor: T.accent, color: T.accent }}>{children}</span>
  )

  return (
    <div ref={root} className="min-h-screen" style={{ background: T.bg, color: T.ink }}>
      <SiteNav tone={T.dark ? 'dark' : 'light'} />
      <main>
        {/* 01 OVERVIEW */}
        <section className="relative overflow-hidden pb-20 pt-32" aria-labelledby="detail-title">
          <div className="pointer-events-none absolute inset-0" aria-hidden>{T.deco}</div>
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="min-w-0">
              <a href="#/cases" className="font-mono text-[11px] tracking-[0.3em] opacity-70 hover:opacity-100">← ALL CASE STUDIES</a>
              <div className="mt-8 font-mono text-[11px] tracking-[0.3em]" style={{ color: T.accent }}>01 — OVERVIEW</div>
              <div className="mt-3 flex flex-wrap gap-2"><Badge>CONCEPT CASE STUDY</Badge><Badge>SELF-INITIATED</Badge></div>
              <h1 id="detail-title" tabIndex={-1} className={`mt-5 text-[clamp(56px,9vw,128px)] leading-[0.9] outline-none ${T.display}`}>{c.title}</h1>
              <p className="mt-4 font-cormorant text-[clamp(22px,2.4vw,32px)] italic" style={{ color: T.muted }}>{c.oneLiner}</p>
              <dl className="mt-8 grid max-w-[560px] grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
                <div><dt className="font-mono text-[10px] tracking-[0.25em] opacity-60">PLATFORM</dt><dd className="mt-1 font-semibold">{d.platform}</dd></div>
                <div><dt className="font-mono text-[10px] tracking-[0.25em] opacity-60">MOOD</dt><dd className="mt-1 font-semibold">{c.mood}</dd></div>
                <div className="col-span-2"><dt className="font-mono text-[10px] tracking-[0.25em] opacity-60">STATUS</dt><dd className="mt-1">Concept — not a shipped product. No user research has been conducted yet.</dd></div>
              </dl>
            </div>
            <div data-rv="up" className="flex justify-center"><Phone scale={0.82} tilt="rotate(-3deg)" label={`${c.title} — ${d.screens[0].title}`}>{screens[0]()}</Phone></div>
          </div>
        </section>

        {/* 02 PROBLEM */}
        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
          <H n="02" k="PROBLEM">{c.problem}</H>
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2"><div className="font-semibold">{d.persona.name}</div><Badge>ASSUMPTION</Badge></div>
              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: T.muted }}>{d.persona.line}</p>
            </Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Card><div className="font-mono text-[10px] tracking-[0.25em]" style={{ color: T.accent }}>GOALS</div><ul className="mt-3 space-y-2 text-[14px] leading-snug">{d.persona.goals.map((g) => <li key={g}>· {g}</li>)}</ul></Card>
              <Card><div className="font-mono text-[10px] tracking-[0.25em]" style={{ color: T.accent }}>FRUSTRATIONS</div><ul className="mt-3 space-y-2 text-[14px] leading-snug">{d.persona.frustrations.map((g) => <li key={g}>· {g}</li>)}</ul></Card>
            </div>
          </div>
        </section>

        {/* 03 RESEARCH (plan only) */}
        <section className="border-y py-20" style={{ borderColor: T.line }}>
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <H n="03" k="RESEARCH">A research plan — not yet conducted.</H>
            <p data-rv="up" className="-mt-4 mb-10 max-w-[680px] text-[15px] leading-relaxed" style={{ color: T.muted }}>This is a concept. The plan below describes how the idea would be validated; there are no findings yet, and nothing on this page should be read as a research result.</p>
            <div className="grid gap-5 md:grid-cols-3">
              {[['METHODS', d.research.methods], ['KEY QUESTIONS', d.research.questions], ['ASSUMPTIONS TO VALIDATE', d.research.assumptions]].map(([k, list]) => (
                <Card key={k as string}><div className="font-mono text-[10px] tracking-[0.25em]" style={{ color: T.accent }}>{k as string}</div><ul className="mt-3 space-y-2.5 text-[14px] leading-snug">{(list as string[]).map((x) => <li key={x}>· {x}</li>)}</ul></Card>
              ))}
            </div>
          </div>
        </section>

        {/* 04 USER FLOW */}
        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
          <H n="04" k="USER FLOW">From opening the app to done.</H>
          <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {d.flow.map((s, k) => (
              <li key={s} data-rv="up" className={`relative ${T.radius} border p-4`} style={{ borderColor: T.line, background: T.card }}>
                <div className="font-mono text-[11px]" style={{ color: T.accent }}>{String(k + 1).padStart(2, '0')}</div>
                <div className="mt-2 text-[14px] font-semibold leading-snug">{s}</div>
                {k < d.flow.length - 1 && <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 lg:block" style={{ color: T.accent }} aria-hidden>→</span>}
              </li>
            ))}
          </ol>
        </section>

        {/* 05 WIREFRAMES */}
        <section className="border-y py-20" style={{ borderColor: T.line }}>
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <H n="05" k="WIREFRAMES">Structure first, colour later.</H>
            <div className="flex flex-wrap justify-center gap-8">
              {screens.map((S, k) => (
                <figure key={k} data-rv="up" className="text-center">
                  <div className="wf"><Phone scale={0.62} label={`Wireframe — ${d.screens[k].title}`}>{S()}</Phone></div>
                  <figcaption className="mt-3 font-mono text-[11px] tracking-[0.15em] opacity-70">WF-{k + 1} · {d.screens[k].title.toUpperCase()}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 06 HIGH-FIDELITY */}
        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
          <H n="06" k="HIGH-FIDELITY SCREENS">The concept, in its own visual language.</H>
          <div className="flex flex-wrap justify-center gap-10">
            {screens.map((S, k) => (
              <figure key={k} data-rv="up" className="max-w-[300px]">
                <Phone scale={0.74} tilt={`rotate(${[-2, 0, 2][k]}deg)`} label={`${c.title} — ${d.screens[k].title}`}>{S()}</Phone>
                <figcaption className="mt-4"><div className="font-semibold">{d.screens[k].title}</div><div className="mt-1 text-[13px] leading-snug" style={{ color: T.muted }}>{d.screens[k].note}</div></figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-10 text-center font-mono text-[10px] tracking-[0.2em] opacity-60">SAMPLE CONTENT IN MOCKUPS IS FICTIONAL</p>
        </section>

        {/* 07 DECISIONS */}
        <section className="border-y py-20" style={{ borderColor: T.line }}>
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <H n="07" k="DESIGN DECISIONS">Why it looks and works this way.</H>
            <div className="grid gap-5 md:grid-cols-3">
              {d.decisions.map((x, k) => (
                <div key={x.title} data-rv="up"><Card className="h-full">
                  <div className={`text-[44px] leading-none ${T.display}`} style={{ color: T.accent }}>{String(k + 1).padStart(2, '0')}</div>
                  <div className="mt-4 text-[17px] font-semibold">{x.title}</div>
                  <p className="mt-2 text-[14px] leading-relaxed" style={{ color: T.muted }}>{x.why}</p>
                </Card></div>
              ))}
            </div>
          </div>
        </section>

        {/* 08 OUTCOMES & LEARNINGS */}
        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
          <H n="08" k="OUTCOMES & LEARNINGS">What this concept produced.</H>
          <div className="grid gap-5 md:grid-cols-3">
            <Card><div className="font-mono text-[10px] tracking-[0.25em]" style={{ color: T.accent }}>OUTCOME</div><p className="mt-3 text-[14px] leading-relaxed">A concept: problem framing, a proto-persona, a research plan, a user flow, wireframes and three high-fidelity screens. Not tested with users and not shipped.</p></Card>
            <Card><div className="font-mono text-[10px] tracking-[0.25em]" style={{ color: T.accent }}>LEARNINGS</div><ul className="mt-3 space-y-2.5 text-[14px] leading-snug">{d.learnings.map((x) => <li key={x}>· {x}</li>)}</ul></Card>
            <Card><div className="font-mono text-[10px] tracking-[0.25em]" style={{ color: T.accent }}>NEXT STEPS</div><ul className="mt-3 space-y-2.5 text-[14px] leading-snug">{d.next.map((x) => <li key={x}>· {x}</li>)}</ul></Card>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: T.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex flex-wrap gap-3 text-[13px] font-semibold">
            <a href={`#/case/${prev.id}`} className={`border px-4 py-2.5 ${T.radius === 'rounded-none' ? '' : 'rounded-full'}`} style={{ borderColor: T.line }}>← {prev.title}</a>
            <a href={`#/case/${next.id}`} className={`border px-4 py-2.5 ${T.radius === 'rounded-none' ? '' : 'rounded-full'}`} style={{ borderColor: T.line }}>{next.title} →</a>
          </div>
          <a href="#/contact" className="t1-display bg-[#e8202f] px-6 py-3.5 text-[18px] tracking-[0.06em] text-white hover:bg-[#c81624]">{CTA}</a>
        </div>
        <p className="pb-8 text-center text-[11px] opacity-50">{c.title} is a self-initiated concept. Sample content shown in mockups is fictional.</p>
      </footer>
    </div>
  )
}
