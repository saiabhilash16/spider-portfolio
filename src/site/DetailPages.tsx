import { useEffect, useRef } from 'react'
import { caseStudies, caseStudyProcess, projects } from '../data/content'
import { CONCEPT_ART, PROJECT_ART } from './Art'
import { CityPlate, Footer, SiteNav, Tag, Title } from './shared'
import { useReveals } from './reveal'

/* Layers used to group each project's LISTED stack (grouping only — no extra claims). */
const LAYER: Record<string, string> = {
  React: 'Interface', TypeScript: 'Interface', 'Chakra UI': 'Interface', 'Material UI': 'Interface', Figma: 'Design',
  FastAPI: 'API', 'Django REST': 'API', 'Azure OpenAI': 'AI', PostgreSQL: 'Data', 'AWS Amplify': 'Cloud',
}
const ORDER = ['Design', 'Interface', 'API', 'AI', 'Data', 'Cloud']

function useTop(key: string) {
  useEffect(() => { scrollTo(0, 0); requestAnimationFrame(() => { scrollTo(0, 0); document.getElementById('detail-title')?.focus({ preventScroll: true }) }) }, [key])
}

export function ProjectPage({ id }: { id: string }) {
  const root = useRef<HTMLDivElement>(null)
  const i = Math.max(0, projects.findIndex((p) => p.id === id))
  const p = projects[i]
  const next = projects[(i + 1) % projects.length]
  const Art = PROJECT_ART[p.id]
  useReveals(root, [p.id]); useTop(p.id)
  const layers = ORDER.map((l) => ({ l, items: p.tech.filter((t) => (LAYER[t] ?? 'Other') === l) })).filter((x) => x.items.length)

  return (
    <div ref={root} className="bg-black text-white">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden pb-[10vh] pt-36" aria-labelledby="detail-title">
          <CityPlate strength={0.35} />
          <div className="relative mx-auto max-w-[1500px] px-5 sm:px-10">
            <a href="#/projects" className="font-mono text-[11px] tracking-[0.3em] text-white/60 hover:text-white">← ALL PROJECTS</a>
            <div data-rv="up" className="mb-5 mt-10 flex items-center gap-3"><span className="font-mono text-[12px] text-[#2f6bff]">{p.index}</span><Tag>PROJECT</Tag></div>
            <div data-rv="title"><Title as="h1" id="detail-title" text={p.title.toUpperCase()} className="t1-chroma max-w-[18ch] text-[clamp(48px,8vw,136px)]" /></div>
            <p data-rv="up" className="mt-6 max-w-[640px] text-[clamp(16px,1.4vw,20px)] leading-relaxed text-white/75">{p.tagline}</p>
          </div>
          <figure className="relative mx-auto mt-16 max-w-[1200px] px-5 sm:px-10">
            <div data-rv="wipe" style={{ perspective: 1600 }}><div style={{ transform: 'rotateX(6deg)' }}><Art /></div></div>
            <figcaption className="mt-3 font-mono text-[10px] tracking-[0.2em] text-white/40">ILLUSTRATIVE RECREATION · NOT A PRODUCTION SCREENSHOT</figcaption>
          </figure>
        </section>

        <section className="mx-auto grid max-w-[1500px] gap-14 px-5 py-[12vh] sm:px-10 lg:grid-cols-2" aria-label="Problem and solution">
          <Block k="01 · THE PROBLEM" tone="#ff4a5a" text={p.problem} />
          <Block k="02 · THE BUILD" tone="#7aa2ff" text={p.solution} />
        </section>

        <section className="border-y border-white/10 bg-[#07080c] py-[12vh]" aria-labelledby="proc">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
            <div data-rv="title"><Title id="proc" text="PROCESS" className="text-[clamp(52px,8vw,130px)] text-transparent [-webkit-text-stroke:2px_#fff]" /></div>
            <ol className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
              {p.process.map((s, k) => (
                <li key={s} data-rv="up" className="relative bg-[#07080c] p-6">
                  <div className="t1-display text-[48px] leading-none text-[#e8202f]">{String(k + 1).padStart(2, '0')}</div>
                  <div className="mt-4 text-[15px] font-semibold">{s}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-5 py-[12vh] sm:px-10" aria-labelledby="stack">
          <div data-rv="title"><Title id="stack" text="STACK" className="text-[clamp(52px,8vw,130px)]" /></div>
          <p data-rv="up" className="mt-3 font-mono text-[10px] tracking-[0.2em] text-white/40">SIMPLIFIED — THE LISTED TECHNOLOGIES, GROUPED BY LAYER</p>
          <div className="mt-10 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
            {layers.map((x, k) => (
              <div key={x.l} className="contents">
                <div data-rv="up" className="flex-1 border border-white/15 p-5" style={{ boxShadow: k % 2 ? 'inset 0 -2px 0 #2f6bff' : 'inset 0 -2px 0 #e8202f' }}>
                  <div className="mb-3 font-mono text-[10px] tracking-[0.3em] text-white/50">{x.l.toUpperCase()}</div>
                  <div className="space-y-1 text-[15px] font-semibold">{x.items.map((t) => <div key={t}>{t}</div>)}</div>
                </div>
                {k < layers.length - 1 && <div className="self-center font-mono text-white/30" aria-hidden><span className="hidden lg:inline">→</span><span className="lg:hidden">↓</span></div>}
              </div>
            ))}
          </div>
        </section>

        {p.result && (
          <section className="relative overflow-hidden border-t border-white/10 py-[14vh]" aria-label="Result">
            <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_50%,rgba(232,32,47,.25),transparent_70%)]" aria-hidden />
            <div className="relative mx-auto max-w-[1500px] px-5 text-center sm:px-10">
              <div data-rv="up" className="font-mono text-[11px] tracking-[0.4em] text-white/60">RESULT</div>
              <div data-rv="up" className="t1-display t1-chroma-strong mt-4 text-[clamp(110px,20vw,320px)] leading-none">{p.result.match(/[+\-]?\d+%/)?.[0]}</div>
              <div data-rv="up" className="mt-2 text-[18px] text-white/75">{p.result.replace(/\s*[+\-]?\d+%/, '')}</div>
            </div>
          </section>
        )}

        <NextLink href={`#/project/${next.id}`} label="NEXT PROJECT" title={next.title} />
      </main>
      <Footer />
    </div>
  )
}

export function ConceptPage({ id }: { id: string }) {
  const root = useRef<HTMLDivElement>(null)
  const i = Math.max(0, caseStudies.findIndex((c) => c.id === id))
  const c = caseStudies[i]
  const next = caseStudies[(i + 1) % caseStudies.length]
  const Art = CONCEPT_ART[c.id]
  useReveals(root, [c.id]); useTop(c.id)
  return (
    <div ref={root} className="bg-black text-white">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden pb-[10vh] pt-36" aria-labelledby="detail-title">
          <div className="absolute inset-0" style={{ background: `radial-gradient(60% 60% at 75% 40%, ${c.accent}30, transparent 70%)` }} aria-hidden />
          <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 px-5 sm:px-10 lg:grid-cols-2">
            <div className="min-w-0">
              <a href="#/cases" className="font-mono text-[11px] tracking-[0.3em] text-white/60 hover:text-white">← ALL CONCEPTS</a>
              <div data-rv="up" className="mb-5 mt-10 flex items-center gap-3">
                <span className="t1-display text-[40px] leading-none" style={{ color: c.accent }}>{String(i + 3).padStart(2, '0')}</span>
                <span className="inline-block border px-2 py-[3px] font-mono text-[10px] tracking-[0.25em]" style={{ borderColor: c.accent, color: c.accent }}>CONCEPT CASE STUDY</span>
              </div>
              <div data-rv="title"><Title as="h1" id="detail-title" text={c.title.toUpperCase()} className="text-[clamp(60px,8vw,150px)]" /></div>
              <p data-rv="up" className="mt-4 font-fraunces text-[clamp(20px,2vw,30px)] italic text-white/85">{c.oneLiner}</p>
            </div>
            <div data-rv="wipe" data-dir="r" className="min-w-0">{Art && <Art big />}</div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1500px] gap-14 px-5 py-[12vh] sm:px-10 lg:grid-cols-3" aria-label="Concept summary">
          <Block k="01 · PROBLEM" tone={c.accent} text={c.problem} />
          <Block k="02 · IDEA" tone={c.accent} text={c.solution} />
          <Block k="03 · KEY DECISION" tone={c.accent} text={c.decision} />
        </section>

        <section className="border-y border-white/10 bg-[#07080c] py-[12vh]" aria-labelledby="cs-structure">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
            <div data-rv="title"><Title id="cs-structure" text="IN PRODUCTION" className="text-[clamp(48px,7vw,120px)] text-transparent [-webkit-text-stroke:2px_#fff]" /></div>
            <p data-rv="up" className="mt-5 max-w-[640px] text-[15px] leading-relaxed text-white/60">
              The full case study is being written. It will follow the same structure as Butterfly. Personas will be marked as assumptions, and no research results are claimed.
            </p>
            <ol className="mt-10 flex flex-wrap gap-3">
              {caseStudyProcess.map((s, k) => (
                <li key={s} data-rv="up" className="border border-white/15 px-4 py-3 text-[14px]"><span className="mr-2 font-mono text-[11px]" style={{ color: c.accent }}>{String(k + 1).padStart(2, '0')}</span>{s}</li>
              ))}
            </ol>
            <p className="mt-8 font-mono text-[10px] tracking-[0.2em] text-white/40">MOOD · {c.mood.toUpperCase()}</p>
          </div>
        </section>

        <NextLink href={`#/case/${next.id}`} label="NEXT CONCEPT" title={next.title} />
      </main>
      <Footer />
    </div>
  )
}

function Block({ k, text, tone }: { k: string; text: string; tone: string }) {
  return (
    <div data-rv="up">
      <div className="mb-4 font-mono text-[11px] tracking-[0.3em]" style={{ color: tone }}>{k}</div>
      <p className="text-[clamp(18px,1.6vw,24px)] leading-snug text-white/85">{text}</p>
    </div>
  )
}

function NextLink({ href, label, title }: { href: string; label: string; title: string }) {
  return (
    <a href={href} className="group relative block overflow-hidden border-t border-white/10 py-[12vh]">
      <span className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-[#e8202f] to-[#2f6bff] transition-transform duration-700 group-hover:scale-x-100" aria-hidden />
      <span className="relative mx-auto block max-w-[1500px] px-5 sm:px-10">
        <span className="block font-mono text-[11px] tracking-[0.4em] text-white/60">{label} →</span>
        <span className="t1-display mt-3 block text-[clamp(44px,8vw,140px)] leading-[0.9]">{title.toUpperCase()}</span>
      </span>
    </a>
  )
}
