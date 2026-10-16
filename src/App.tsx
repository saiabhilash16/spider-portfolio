import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Scene } from './three/Scene'
import { chapterProgress, holdById, prefersReducedMotion, rt, setUI, totalScreens, useUI } from './three/runtime'
import { about, caseStudies, caseStudyProcess, education, profile, projects, skills } from './data/content'
import { Butterfly } from './ui/Butterfly'
import { WorldLabels } from './ui/WorldLabels'

gsap.registerPlugin(ScrollTrigger)

type Open = { kind: 'project' | 'case'; id: string } | null

export default function App() {
  const ui = useUI()
  const [open, setOpenRaw] = useState<Open>(null)
  // case studies with a dedicated page open as their own route
  const setOpen = (o: Open) => {
    if (o?.kind === 'case' && o.id === 'butterfly') { window.location.hash = '#/case/butterfly'; return }
    setOpenRaw(o)
  }
  const [menu, setMenu] = useState(false)
  const spacer = useRef<HTMLDivElement>(null)

  /* ---------- Scroll drives the story (GSAP ScrollTrigger with scrub = smoothing/momentum) ---------- */
  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: spacer.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: prefersReducedMotion ? true : 1.2,
      onUpdate: (self) => { rt.scroll = self.progress },
    })
    return () => st.kill()
  }, [])

  /* Lock scrolling while the intro plays */
  useEffect(() => {
    document.documentElement.style.overflow = ui.introDone ? '' : 'hidden'
  }, [ui.introDone])

  const skipIntro = () => {
    const h = holdById('hero')
    rt.index = h.i1
    rt.mode = 'scroll'
    rt.introCam = 0
    setUI({ introDone: true, nameVisible: true, chapter: 'home' })
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (open) setOpen(null); else if (!ui.introDone) skipIntro() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    // deep links into the city: #/projects, #/cases, #/contact (on load and on hash change)
    const jump = () => {
      const target = window.location.hash.replace('#/', '')
      if (target === 'projects' || target === 'cases' || target === 'contact')
        requestAnimationFrame(() => requestAnimationFrame(() => goTo(target, 'auto')))
    }
    jump()
    window.addEventListener('hashchange', jump)
    return () => window.removeEventListener('hashchange', jump)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (c: 'home' | 'about' | 'projects' | 'cases' | 'contact', behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth') => {
    if (!ui.introDone) skipIntro()
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: chapterProgress(c) * max, behavior })
  }

  const nav: { id: 'home' | 'about' | 'projects' | 'cases' | 'contact'; label: string }[] = [
    { id: 'home', label: 'Home' }, { id: 'about', label: 'About' }, { id: 'projects', label: 'Projects' },
    { id: 'cases', label: 'Case Studies' }, { id: 'contact', label: 'Contact' },
  ]
  const activeNav = ui.chapter === 'education' ? 'cases' : ui.chapter === 'intro' ? 'home' : ui.chapter

  return (
    <>
      <Scene />
      <WorldLabels onOpen={(kind, id) => setOpen({ kind, id })} />

      {/* Fade-from-black opening */}
      <div className={`fixed inset-0 bg-black pointer-events-none z-30 transition-opacity duration-[1600ms] ease-out ${ui.introDone || prefersReducedMotion ? 'opacity-0' : 'animate-[fadeout_1.6s_0.3s_ease-out_forwards]'}`} />

      {/* ---------------- Top navigation (always available) ---------------- */}
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 sm:px-8 py-4">
        <button onClick={() => goTo('home')} className="flex items-center gap-2 text-white/90 font-display tracking-[0.18em] text-xl">
          <span className="inline-block w-2.5 h-2.5 rotate-45 bg-cyan-300 shadow-[0_0_14px_#22D3EE]" />SAI · MANDAVA
        </button>
        <nav aria-label="Sections" className="hidden md:flex gap-1 rounded-full bg-[#0b0d14]/60 backdrop-blur px-1.5 py-1.5 border border-white/10">
          {nav.map((n) => (
            <button key={n.id} onClick={() => goTo(n.id)} aria-current={activeNav === n.id ? 'true' : undefined}
              className={`px-3.5 py-1.5 rounded-full text-[13px] transition-colors ${activeNav === n.id ? 'bg-cyan-300 text-[#04121a] font-semibold' : 'text-slate-300 hover:text-white'}`}>
              {n.label}
            </button>
          ))}
        </nav>
        <button className="md:hidden btn-ghost !py-2 !px-4" aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((m) => !m)}>
          {menu ? '✕' : '☰'} Menu
        </button>
        {menu && (
          <nav id="mobile-menu" aria-label="Sections" className="md:hidden glass absolute top-16 right-4 flex flex-col p-2 min-w-[180px]">
            {nav.map((n) => (
              <button key={n.id} onClick={() => { setMenu(false); goTo(n.id) }}
                className={`text-left px-3 py-2.5 rounded-lg text-[15px] ${activeNav === n.id ? 'text-cyan-300 font-semibold' : 'text-slate-200'}`}>{n.label}</button>
            ))}
            {!ui.introDone && <button onClick={() => { setMenu(false); skipIntro() }} className="text-left px-3 py-2.5 text-[15px] text-slate-200">Skip intro ⏭</button>}
          </nav>
        )}
        {!ui.introDone ? (
          <button onClick={skipIntro} className="btn-ghost !py-2 hidden md:inline-flex">Skip intro ⏭</button>
        ) : (
          <a href={`mailto:${profile.email}`} className="btn-ghost !py-2 hidden sm:inline-flex">Let's talk</a>
        )}
      </header>

      {/* ---------------- Web-node progress rail ---------------- */}
      <ol aria-hidden className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-5">
        {nav.map((n) => (
          <li key={n.id} className="relative flex items-center justify-end">
            <span className={`block rounded-full transition-all ${activeNav === n.id ? 'w-3 h-3 bg-cyan-300 shadow-[0_0_14px_#22D3EE]' : 'w-1.5 h-1.5 bg-white/40'}`} />
          </li>
        ))}
      </ol>

      {/* ---------------- HERO title (appears after the landing) ---------------- */}
      <HeroTitle visible={ui.nameVisible && ui.chapter === 'home'} onExplore={() => goTo('projects')} />

      {ui.introDone && ui.chapter === 'home' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 text-[11px] tracking-[0.35em] text-slate-300/80 animate-pulse">SCROLL TO SWING ↓</div>
      )}

      {/* ---------------- About + Skills (while swinging to Project 1) ---------------- */}
      <Panel show={ui.chapter === 'about'} side="left">
        <div className="eyebrow">ABOUT</div>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-200">{about}</p>
        <div className="eyebrow mt-5">SKILLS</div>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3">
          {skills.map((g) => (
            <div key={g.group}>
              <div className="text-[12px] font-semibold text-cyan-300">{g.group}</div>
              <div className="text-[12px] text-slate-300 leading-snug">{g.items.join(' · ')}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel show={ui.chapter === 'cases'} side="left" compact>
        <div className="eyebrow">UI/UX CASE STUDIES</div>
        <p className="mt-1 text-[14px] text-slate-200">Six concept case studies — my ideas and design thinking. Click any glowing sign, or pick one:</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {caseStudies.map((c) => (
            <button key={c.id} onClick={() => setOpen({ kind: 'case', id: c.id })} className="text-left rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 transition-colors">
              <span className="block text-[13px] font-semibold" style={{ color: c.accent }}>{c.title}</span>
              <span className="block text-[11px] text-slate-400">{c.oneLiner}</span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel show={ui.chapter === 'education'} side="left" compact>
        <div className="eyebrow">EDUCATION</div>
        <div className="mt-2 font-display text-3xl text-white">{education.degree}</div>
        <div className="text-slate-300 text-[14px]">{education.school}</div>
        <div className="text-cyan-300 text-[13px] mt-1">{education.date}</div>
      </Panel>

      {/* ---------------- Contact finale ---------------- */}
      <ContactFinale visible={ui.chapter === 'contact'} />

      {/* ---------------- Readable detail views ---------------- */}
      {open && <DetailModal open={open} onClose={() => setOpen(null)} />}

      {/* The scroll track: its height decides how long the journey is */}
      <div ref={spacer} style={{ height: `${(totalScreens + 1) * 100}vh` }} aria-hidden />
    </>
  )
}

/* =================================================================================== */

function HeroTitle({ visible, onExplore }: { visible: boolean; onExplore: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const played = useRef(false)
  useLayoutEffect(() => {
    if (!root.current) return
    if (visible && !played.current) {
      played.current = true
      const tl = gsap.timeline()
      tl.fromTo(root.current.querySelectorAll('.ch'), { yPercent: 110, opacity: 0, rotateX: -70 },
        { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger: 0.028, ease: 'power4.out' })
        .fromTo(root.current.querySelectorAll('.reveal'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, '-=0.35')
      if (prefersReducedMotion) tl.progress(1)
    }
    gsap.to(root.current, { autoAlpha: visible ? 1 : 0, duration: 0.5 })
  }, [visible])
  return (
    <section ref={root} className="fixed left-4 sm:left-10 bottom-[12vh] z-20 max-w-[760px] invisible" style={{ opacity: 0 }} aria-label="Introduction">
      <div className="reveal eyebrow">ORIGIN · DESIGN × CODE</div>
      <h1 className="font-display text-white leading-[0.88] text-[clamp(52px,9vw,124px)] [perspective:600px] drop-shadow-[0_6px_30px_rgba(0,0,0,0.7)]">
        {profile.name.split(' ').map((w, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap mr-[0.22em] overflow-hidden align-bottom">
            {[...w].map((c, i) => <span key={i} className="ch inline-block">{c}</span>)}
          </span>
        ))}
      </h1>
      <p className="reveal mt-3 text-[clamp(15px,1.6vw,19px)] text-slate-200 font-medium">{profile.headline}</p>
      <p className="reveal mt-2 text-[15px] text-slate-400 max-w-[520px]">{profile.intro}</p>
      <div className="reveal mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" onClick={onExplore}>Explore My Work</button>
        <ResumeButton />
      </div>
    </section>
  )
}

function ResumeButton() {
  return profile.resumeUrl ? (
    <a className="btn-ghost" href={profile.resumeUrl} download>Download Resume</a>
  ) : (
    <button className="btn-ghost" title="Placeholder — add a web copy of the resume without the phone number" aria-disabled>
      Download Resume
    </button>
  )
}

function Panel({ show, side, compact, children }: { show: boolean; side: 'left' | 'right'; compact?: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    gsap.to(ref.current, { autoAlpha: show ? 1 : 0, x: show ? 0 : side === 'left' ? -40 : 40, duration: prefersReducedMotion ? 0 : 0.55, ease: 'power3.out' })
  }, [show, side])
  return (
    <aside ref={ref} className={`glass fixed z-20 invisible ${side === 'left' ? 'left-4 sm:left-8' : 'right-4 sm:right-8'} bottom-6 sm:bottom-auto sm:top-24 w-[min(92vw,${compact ? 420 : 480}px)] p-5`}
      style={{ width: `min(92vw, ${compact ? 420 : 480}px)`, opacity: 0 }}>
      {children}
    </aside>
  )
}

function ContactFinale({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    gsap.to(ref.current, { autoAlpha: visible ? 1 : 0, y: visible ? 0 : 30, duration: prefersReducedMotion ? 0 : 0.8, ease: 'power3.out', delay: visible ? 0.4 : 0 })
  }, [visible])
  return (
    <section ref={ref} className="fixed inset-x-4 sm:inset-x-auto sm:left-10 bottom-[10vh] z-20 invisible max-w-[720px]" style={{ opacity: 0 }} aria-label="Contact">
      <div className="eyebrow">SIGNAL RECEIVED</div>
      <h2 className="font-display text-white text-[clamp(48px,8vw,110px)] leading-[0.9] drop-shadow-[0_6px_30px_rgba(0,0,0,0.8)]">
        LET'S BUILD<br />SOMETHING AMAZING.
      </h2>
      <div className="mt-6 flex flex-wrap gap-3">
        <a className="btn-primary" href={`mailto:${profile.email}`}>✉ {profile.email}</a>
        <a className="btn-ghost" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a className="btn-ghost" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
        <ResumeButton />
      </div>
    </section>
  )
}

function DetailModal({ open, onClose }: { open: NonNullable<Open>; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => {
    closeBtn.current?.focus()
    if (!prefersReducedMotion)
      gsap.fromTo(ref.current, { clipPath: 'inset(48% 0 48% 0)', opacity: 0 }, { clipPath: 'inset(0% 0 0% 0)', opacity: 1, duration: 0.7, ease: 'expo.out' })
  }, [open])

  const p = open.kind === 'project' ? projects.find((x) => x.id === open.id)! : null
  const c = open.kind === 'case' ? caseStudies.find((x) => x.id === open.id)! : null
  const accent = (p ?? c)!.accent

  return (
    <div className="fixed inset-0 z-50 bg-[#05070d]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-8" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="dlg-title" onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[920px] max-h-[88vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d111c] p-6 sm:p-10"
        style={{ ['--accent' as any]: accent, boxShadow: `0 0 80px -20px ${accent}` }}>
        {c?.id === 'butterfly' && <Butterfly />}
        <button ref={closeBtn} onClick={onClose} className="absolute top-4 right-4 btn-ghost !py-1.5 !px-3" aria-label="Close">✕ Close</button>

        {p && (
          <>
            <div className="text-[12px] tracking-[0.3em] font-semibold text-[var(--accent)]">PROJECT {p.index}</div>
            <h2 id="dlg-title" className="font-display text-[clamp(40px,6vw,64px)] leading-[0.95] text-white mt-2 pr-24">{p.title}</h2>
            <p className="text-slate-300 mt-2">{p.tagline}</p>
            <div className="grid sm:grid-cols-2 gap-5 mt-8">
              <Block title="Problem">{p.problem}</Block>
              <Block title="Solution">{p.solution}</Block>
            </div>
            <Block title="Process" className="mt-5">
              <ol className="flex flex-wrap gap-2 mt-1">{p.process.map((s, i) => <li key={s} className="chip">{i + 1}. {s}</li>)}</ol>
            </Block>
            <Block title="Tech stack" className="mt-5">
              <div className="flex flex-wrap gap-2 mt-1">{p.tech.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            </Block>
            {p.result && <div className="mt-6 text-xl font-semibold text-[var(--accent)]">Result: {p.result}</div>}
            <MockupPlaceholder label="UI mockups (recreated visuals — original work is confidential)" />
          </>
        )}

        {c && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-[12px] tracking-[0.3em] font-semibold text-[var(--accent)]">UI/UX CASE STUDY</span>
              <span className="tag">Concept Case Study</span>
            </div>
            <h2 id="dlg-title" className="font-display text-[clamp(44px,7vw,76px)] leading-none text-white mt-2">{c.title}</h2>
            <p className="text-slate-300">{c.oneLiner} <span className="text-slate-500">· Visual mood: {c.mood}</span></p>
            <div className="grid sm:grid-cols-2 gap-5 mt-8">
              <Block title="Problem statement">{c.problem}</Block>
              <Block title="Proposed solution">{c.solution}</Block>
            </div>
            <Block title="Design process (planned)" className="mt-5">
              <ol className="flex flex-wrap gap-2 mt-1">{caseStudyProcess.map((s, i) => <li key={s} className="chip">{i + 1}. {s}</li>)}</ol>
            </Block>
            {c.flow && (
              <Block title="User flow" className="mt-5">
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[13px]">
                  {c.flow.map((s, i) => (<span key={s} className="flex items-center gap-2"><span className="chip">{s}</span>{i < c.flow!.length - 1 && <span className="text-[var(--accent)]">→</span>}</span>))}
                </div>
              </Block>
            )}
            <div className="grid sm:grid-cols-2 gap-5 mt-5">
              <MockupPlaceholder label="Wireframes — in progress (Figma)" />
              <MockupPlaceholder label="High-fidelity UI — in progress (Figma)" />
            </div>
            <Block title="Key design decision" className="mt-5">{c.decision}</Block>
            <p className="mt-6 text-[12px] text-slate-500">This is a self-initiated concept, not a client project. No research results are claimed.</p>
          </>
        )}
      </div>
    </div>
  )
}

function Block({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[11px] tracking-[0.25em] uppercase text-[var(--accent)] font-semibold">{title}</div>
      <div className="mt-1.5 text-[15px] text-slate-200 leading-relaxed">{children}</div>
    </div>
  )
}

function MockupPlaceholder({ label }: { label: string }) {
  return (
    <div className="mt-6 aspect-[16/9] rounded-xl border border-dashed border-white/15 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.03)_0_12px,transparent_12px_24px)] flex items-center justify-center text-center px-4 text-[13px] text-slate-400">
      {label}
    </div>
  )
}
