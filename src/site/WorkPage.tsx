import { useEffect, useRef } from 'react'
import { caseStudies, profile, projects } from '../data/content'
import { ButterflyArt, CONCEPT_ART, PROJECT_ART } from './Art'
import { CityPlate, Footer, SiteNav, Tag, Title, reducedMotion } from './shared'
import { useReveals } from './reveal'
import { FinalScene } from './FinalScene'

export type WorkSection = 'top' | 'projects' | 'cases' | 'contact'

export function WorkPage({ section = 'top' }: { section?: WorkSection }) {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)

  // route → section: jump on first load; when already on the page, jump while the route wipe covers the screen.
  // Keyboard focus moves to the section heading.
  const mounted = useRef(false)
  useEffect(() => {
    const go = () => {
      const el = section === 'top' ? null : document.getElementById(section)
      if (el) el.scrollIntoView({ block: 'start' })
      else scrollTo(0, 0)
      document.getElementById(`${section}-title`)?.focus({ preventScroll: true })
    }
    const delay = mounted.current && !reducedMotion() ? 380 : 0
    mounted.current = true
    const t = setTimeout(() => requestAnimationFrame(go), delay)
    return () => clearTimeout(t)
  }, [section])

  const [butterfly, ...concepts] = caseStudies
  return (
    <div ref={root} className="bg-black text-white">
      <SiteNav />
      <main>
        {/* ---------------- HERO ---------------- */}
        <section className="relative flex min-h-[100svh] items-end overflow-hidden pb-[12vh] pt-32" aria-labelledby="top-title">
          <CityPlate strength={0.6} />
          <div className="relative mx-auto grid w-full max-w-[1500px] gap-12 px-5 sm:px-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div className="min-w-0">
              <div data-rv="up" className="mb-5 font-mono text-[11px] tracking-[0.35em] text-white/70">THE WORK — {profile.name}</div>
              <div data-rv="title"><Title as="h1" id="top-title" text="SELECTED WORK" className="t1-chroma-strong text-[clamp(64px,11vw,200px)]" /></div>
              <p data-rv="up" className="mt-6 max-w-[560px] text-[clamp(15px,1.3vw,19px)] leading-relaxed text-white/75">
                Two software projects, from user journeys to working code — and six self-initiated UX concepts. {profile.headline}.
              </p>
            </div>
            <nav aria-label="Index of work" data-rv="up" className="min-w-0 border-t border-white/15">
              {[...projects.map((p) => ({ n: p.index, t: p.title, k: 'PROJECT', href: `#/project/${p.id}` })),
                ...caseStudies.map((c, i) => ({ n: String(i + 3).padStart(2, '0'), t: c.title, k: 'CONCEPT', href: `#/case/${c.id}` }))].map((x) => (
                <a key={x.href} href={x.href} className="group flex items-baseline gap-4 border-b border-white/15 py-2.5 transition hover:bg-white/[0.04]">
                  <span className="w-7 font-mono text-[11px] text-[#2f6bff]">{x.n}</span>
                  <span className="flex-1 truncate text-[14px] font-semibold tracking-wide group-hover:text-[#ff4a5a]">{x.t}</span>
                  <span className="font-mono text-[9px] tracking-[0.25em] text-white/40">{x.k}</span>
                </a>
              ))}
            </nav>
          </div>
          <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-white/50 sm:block" aria-hidden>SCROLL ↓</div>
        </section>

        {/* ---------------- PART I — PROJECTS ---------------- */}
        <section id="projects" className="relative scroll-mt-0 overflow-hidden" aria-labelledby="projects-title">
          <Chapter part="PART I" id="projects-title" title="ENGINEERING" note="Two software projects. The interfaces shown are illustrative recreations made for this portfolio, not production screenshots." />
          {projects.map((p, i) => {
            const Art = PROJECT_ART[p.id]
            const flip = i % 2 === 1
            return (
              <article key={p.id} className="relative mx-auto max-w-[1500px] px-5 py-[14vh] sm:px-10" aria-labelledby={`p-${p.id}`}>
                <div data-rv="par" data-k="18" className={`t1-display pointer-events-none absolute top-[4vh] select-none text-[clamp(160px,30vw,460px)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.12)] ${flip ? 'left-0' : 'right-0'}`} aria-hidden>{p.index}</div>
                <div className={`relative grid items-center gap-10 lg:grid-cols-12 lg:gap-16`}>
                  <figure className={`min-w-0 lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
                    <div data-rv="wipe" data-dir={flip ? 'r' : 'l'} style={{ perspective: 1400 }}>
                      <div className="transition-transform duration-700" style={{ transform: `rotateY(${flip ? -6 : 6}deg) rotateX(3deg)` }}><Art /></div>
                    </div>
                    <figcaption className="mt-3 font-mono text-[10px] tracking-[0.2em] text-white/40">ILLUSTRATIVE RECREATION · NOT A PRODUCTION SCREENSHOT</figcaption>
                  </figure>
                  <div className={`min-w-0 lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
                    <div data-rv="up" className="mb-4 flex items-center gap-3"><span className="font-mono text-[12px] text-[#2f6bff]">{p.index}</span><Tag>PROJECT</Tag></div>
                    <div data-rv="title"><Title id={`p-${p.id}`} text={p.title.toUpperCase()} as="h3" className="text-[clamp(38px,4.6vw,76px)]" /></div>
                    <p data-rv="up" className="mt-5 text-[17px] leading-relaxed text-white/80">{p.tagline}</p>
                    <dl data-rv="up" className="mt-8 grid gap-6 sm:grid-cols-2">
                      <div><dt className="mb-2 font-mono text-[10px] tracking-[0.3em] text-[#ff4a5a]">THE PROBLEM</dt><dd className="text-[14px] leading-relaxed text-white/70">{p.problem}</dd></div>
                      <div><dt className="mb-2 font-mono text-[10px] tracking-[0.3em] text-[#7aa2ff]">THE BUILD</dt><dd className="text-[14px] leading-relaxed text-white/70">{p.solution}</dd></div>
                    </dl>
                    <p data-rv="up" className="mt-7 font-mono text-[11px] leading-loose tracking-[0.12em] text-white/55">{p.tech.join('  /  ')}</p>
                    {p.result && (
                      <div data-rv="up" className="mt-7 border-l-2 border-[#e8202f] pl-4">
                        <div className="t1-display text-[44px] leading-none text-white">{p.result.match(/[+\-]?\d+%/)?.[0] ?? ''}</div>
                        <div className="mt-1 text-[13px] text-white/60">{p.result.replace(/\s*[+\-]?\d+%/, '')}</div>
                      </div>
                    )}
                    <a data-rv="up" href={`#/project/${p.id}`} className="group mt-9 inline-flex items-center gap-3 border-b-2 border-[#e8202f] pb-1 text-[13px] font-semibold tracking-[0.2em] hover:text-[#ff4a5a]">
                      READ THE PROJECT <span className="transition group-hover:translate-x-1" aria-hidden>→</span>
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        {/* ---------------- PART II — CONCEPT CASE STUDIES ---------------- */}
        <section id="cases" className="relative" aria-labelledby="cases-title">
          <Chapter part="PART II" id="cases-title" title="CONCEPTS" note="Six self-initiated UX case studies. These are concept projects — not client work, and no research results are claimed." blue />

          {/* featured: Butterfly */}
          <article className="relative overflow-hidden bg-[radial-gradient(80%_70%_at_70%_40%,#123a8f_0%,#071433_55%,#000_100%)] py-[14vh]" aria-labelledby="c-butterfly">
            <div data-rv="par" data-k="10" className="t1-display pointer-events-none absolute inset-x-0 top-[6vh] select-none text-center text-[clamp(120px,24vw,420px)] leading-none text-white/[0.06]" aria-hidden>BUTTERFLY</div>
            <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 px-5 sm:px-10 lg:grid-cols-[1fr_1.1fr]">
              <div className="min-w-0">
                <div data-rv="up" className="mb-4 flex items-center gap-3"><span className="font-mono text-[12px] text-[#8EC5FF]">03</span><Tag tone="blue">CONCEPT · FEATURED</Tag></div>
                <div data-rv="title"><Title id="c-butterfly" text="BUTTERFLY" as="h3" className="text-[clamp(64px,9vw,150px)] text-[#cfe3ff]" /></div>
                <p data-rv="up" className="mt-3 font-fraunces text-[clamp(20px,2vw,28px)] italic text-white/85">{butterfly.oneLiner}</p>
                <dl data-rv="up" className="mt-8 space-y-5 text-[14px] leading-relaxed text-white/70">
                  <div><dt className="mb-1 font-mono text-[10px] tracking-[0.3em] text-[#8EC5FF]">PROBLEM</dt><dd>{butterfly.problem}</dd></div>
                  <div><dt className="mb-1 font-mono text-[10px] tracking-[0.3em] text-[#8EC5FF]">KEY DECISION</dt><dd>{butterfly.decision}</dd></div>
                </dl>
                <a data-rv="up" href="#/case/butterfly" className="mt-9 inline-flex items-center gap-3 bg-[#2f6bff] px-6 py-3.5 text-[13px] font-semibold tracking-[0.2em] shadow-[0_0_40px_-8px_#2f6bff] hover:bg-[#1f4fe0]">OPEN THE CASE STUDY →</a>
              </div>
              <div data-rv="up" className="flex min-w-0 justify-center overflow-hidden pb-6"><ButterflyArt /></div>
            </div>
          </article>

          {concepts.map((c, i) => {
            const Art = CONCEPT_ART[c.id]
            const flip = i % 2 === 0
            const n = String(i + 4).padStart(2, '0')
            return (
              <article key={c.id} className="relative overflow-hidden border-t border-white/10" aria-labelledby={`c-${c.id}`}>
                <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(55% 70% at ${flip ? '78%' : '22%'} 50%, ${c.accent}22, transparent 70%)` }} aria-hidden />
                <div className="relative mx-auto grid min-h-[86svh] max-w-[1500px] items-center gap-10 px-5 py-[12vh] sm:px-10 lg:grid-cols-12 lg:gap-16">
                  <div className={`min-w-0 lg:col-span-5 ${flip ? '' : 'lg:order-2'}`}>
                    <div data-rv="up" className="mb-4 flex items-center gap-3">
                      <span className="t1-display text-[42px] leading-none" style={{ color: c.accent }}>{n}</span>
                      <span className="inline-block border px-2 py-[3px] font-mono text-[10px] tracking-[0.25em]" style={{ borderColor: c.accent, color: c.accent }}>CONCEPT</span>
                    </div>
                    <div data-rv="title"><Title id={`c-${c.id}`} text={c.title.toUpperCase()} as="h3" className="text-[clamp(52px,6.4vw,118px)]" /></div>
                    <p data-rv="up" className="mt-3 font-fraunces text-[clamp(19px,1.8vw,26px)] italic text-white/85">{c.oneLiner}</p>
                    <dl data-rv="up" className="mt-8 divide-y divide-white/10 border-y border-white/10 text-[14px] leading-relaxed">
                      {[['PROBLEM', c.problem], ['IDEA', c.solution], ['KEY DECISION', c.decision]].map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[110px_1fr] gap-4 py-3.5"><dt className="font-mono text-[10px] tracking-[0.25em]" style={{ color: c.accent }}>{k}</dt><dd className="text-white/70">{v}</dd></div>
                      ))}
                    </dl>
                    <a data-rv="up" href={`#/case/${c.id}`} className="group mt-8 inline-flex items-center gap-3 border-b-2 pb-1 text-[13px] font-semibold tracking-[0.2em]" style={{ borderColor: c.accent }}>
                      CONCEPT OVERVIEW <span className="transition group-hover:translate-x-1" aria-hidden>→</span>
                    </a>
                  </div>
                  <div className={`min-w-0 lg:col-span-7 ${flip ? '' : 'lg:order-1'}`}>
                    <div data-rv="wipe" data-dir={flip ? 'r' : 'l'}>{Art && <Art big />}</div>
                    <div className="mt-3 font-mono text-[10px] tracking-[0.2em] text-white/40">MOOD · {c.mood.toUpperCase()}</div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        {/* ---------------- FINAL SCENE / CONTACT ---------------- */}
        <FinalScene />
      </main>
      <Footer />
    </div>
  )
}

function Chapter({ part, id, title, note, blue = false }: { part: string; id: string; title: string; note: string; blue?: boolean }) {
  return (
    <header className="relative mx-auto max-w-[1500px] px-5 pb-6 pt-[16vh] sm:px-10">
      <div className={`absolute left-5 right-5 top-[10vh] h-px sm:left-10 sm:right-10 ${blue ? 'bg-gradient-to-r from-[#2f6bff] to-transparent' : 'bg-gradient-to-r from-[#e8202f] to-transparent'}`} aria-hidden />
      <div data-rv="up" className={`mb-4 font-mono text-[11px] tracking-[0.4em] ${blue ? 'text-[#7aa2ff]' : 'text-[#ff4a5a]'}`}>{part}</div>
      <div data-rv="title"><Title id={id} text={title} className="text-[clamp(64px,12.5vw,230px)] text-transparent [-webkit-text-stroke:2px_#fff]" /></div>
      <p data-rv="up" className="mt-5 max-w-[620px] text-[15px] leading-relaxed text-white/60">{note}</p>
    </header>
  )
}
