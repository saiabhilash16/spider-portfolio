import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Phone } from '../common/Phone'
import { CAT_COLOR, CATEGORIES, PLACES, type Category } from './data'
import { ButterflyMark } from './Logo'
import { MapView } from './MapView'
import { Scene } from './Scenes'
import { AppScreen, staticState, type AppState, type ScreenId } from './Screens'
import { WIREFRAMES } from './Wireframes'

/* =====================================================================================
 *  BUTTERFLY — featured concept case study (standalone page, route #/case/butterfly)
 *  Visual identity: "Morpho" — luminous blue + warm sand paper, Fraunces + Inter.
 * ===================================================================================== */


/* fade-up on scroll (respects reduced motion via CSS) */
function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { rootMargin: '0px 0px -10% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`bf-reveal ${on ? 'bf-reveal--on' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>
}

function Eyebrow({ n, children }: { n: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.22em] text-[#2F6BFF]">
      <span className="font-fraunces text-[15px] normal-case tracking-normal text-[#0B1530]/40">{n}</span>
      <span className="h-px w-8 bg-[#2F6BFF]/40" />{children}
    </div>
  )
}
function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-4 max-w-[820px] font-fraunces text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.04] tracking-[-0.02em] text-[#0B1530]">{children}</h2>
}
function Tag({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'amber' | 'ink' }) {
  const c = tone === 'amber' ? 'bg-[#FFF3DC] text-[#8A5A00] ring-[#F5D9A3]' : tone === 'ink' ? 'bg-[#0B1530] text-white ring-[#0B1530]' : 'bg-[#EAF2FF] text-[#1F4FE0] ring-[#CFE0FF]'
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ${c}`}>{children}</span>
}
const Section = ({ id, children, className = '' }: { id?: string; children: ReactNode; className?: string }) => (
  <section id={id} className={`mx-auto w-full max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28 ${className}`}>{children}</section>
)

/* ------------------------------------ page ------------------------------------ */
export function ButterflyPage() {
  useEffect(() => { window.scrollTo(0, 0); document.title = 'Butterfly — Concept Case Study · Sai Abhilash Mandava' }, [])
  return (
    <div className="bf-page min-h-screen overflow-x-clip bg-[#F7F2EA] text-[#0B1530] antialiased">
      <TopBar />
      <Hero />
      <Overview />
      <Spark />
      <Problem />
      <Landscape />
      <Persona />
      <Flows />
      <Exploration />
      <Wireframes />
      <HiFi />
      <MapExplorer />
      <Prototype />
      <DesignSystem />
      <Decisions />
      <Validation />
      <Footer />
    </div>
  )
}

/* ------------------------------------ top bar ------------------------------------ */
function TopBar() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const on = () => setP(window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className="sticky top-0 z-40 border-b border-[#0B1530]/8 bg-[#F7F2EA]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-5 sm:px-8">
        <a href="#/cases" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-[14px] font-semibold text-[#0B1530] ring-1 ring-[#0B1530]/15 transition hover:bg-white">
          <span aria-hidden>←</span> <span className="hidden sm:inline">All</span> case studies
        </a>
        <div className="flex min-w-0 items-center gap-2">
          <ButterflyMark size={22} />
          <span className="truncate font-fraunces text-[17px] font-semibold">Butterfly</span>
          <span className="hidden sm:inline"><Tag tone="amber">Concept case study</Tag></span>
        </div>
        <nav className="flex items-center gap-1 text-[14px] font-semibold" aria-label="Portfolio">
          <a href="#/" className="hidden rounded-full px-3 py-2 hover:bg-white lg:inline">Home</a>
          <a href="#/projects" className="hidden rounded-full px-3 py-2 hover:bg-white md:inline">Projects</a>
          <a href="#/skills" className="hidden rounded-full px-3 py-2 hover:bg-white lg:inline">Skills</a>
          <a href="#prototype" className="rounded-full bg-[#0B1530] px-4 py-2 text-white hover:bg-[#1A2650]">Try it</a>
        </nav>
      </div>
      <div className="h-[2px] bg-gradient-to-r from-[#8EC5FF] to-[#2F6BFF]" style={{ width: `${p * 100}%` }} />
    </header>
  )
}

/* ------------------------------------ hero ------------------------------------ */
function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_80%_20%,#DCEBFF_0%,rgba(247,242,234,0)_70%),radial-gradient(50%_40%_at_10%_90%,#F1E2C9_0%,rgba(247,242,234,0)_70%)]" />
      <FlyingButterflies />
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:pb-24 lg:pt-20">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Tag tone="ink">Featured · Case study 01</Tag><Tag tone="amber">Concept — self-initiated</Tag></div>
          <h1 className="mt-6 font-fraunces text-[clamp(64px,10vw,128px)] font-semibold leading-[0.9] tracking-[-0.035em]">
            Butter<span className="italic text-[#2F6BFF]">fly</span>
          </h1>
          <p className="mt-5 max-w-[520px] font-fraunces text-[clamp(22px,2.4vw,30px)] leading-[1.2] text-[#0B1530]">
            Discover what others found <em className="text-[#2F6BFF]">along the way.</em>
          </p>
          <p className="mt-4 max-w-[520px] text-[17px] leading-relaxed text-[#3A4760]">
            A mobile app for finding places worth stopping for — cafés, trails, viewpoints — including the small hidden spots explorers find themselves and share in under a minute.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#prototype" className="rounded-full bg-[#2F6BFF] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(47,107,255,0.9)] transition hover:bg-[#1F4FE0]">Try the prototype</a>
            <a href="#spark" className="rounded-full px-6 py-3.5 text-[15px] font-semibold ring-1 ring-[#0B1530]/20 transition hover:bg-white">Read the story</a>
          </div>
        </div>
        <div className="relative mx-auto h-[520px] w-full max-w-[560px] sm:h-[600px]">
          <div className="absolute inset-x-6 bottom-6 top-16 overflow-hidden rounded-[36px] shadow-[0_40px_80px_-40px_rgba(11,21,48,0.5)]">
            <Scene kind="ridge" className="h-full w-full" label="Illustrated mountain viewpoint" />
          </div>
          <div className="absolute left-[2%] top-[18%] hidden sm:block" inert>
            <Phone scale={0.62} tilt="rotate(-8deg)" label="Home screen"><AppScreen s={staticState('home')} /></Phone>
          </div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2" inert>
            <Phone scale={0.74} label="Place details screen"><AppScreen s={staticState('place', 'ridge')} /></Phone>
          </div>
          <div className="absolute right-[2%] top-[22%] hidden sm:block" inert>
            <Phone scale={0.6} tilt="rotate(7deg)" label="Map screen"><AppScreen s={staticState('map', 'ridge')} /></Phone>
          </div>
        </div>
      </div>
    </section>
  )
}
function FlyingButterflies() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-[5]" aria-hidden>
      <span className="bf-drift absolute left-[48%] top-[12%]"><ButterflyMark size={26} className="bf-flutter" /></span>
      <span className="bf-drift bf-drift--2 absolute left-[8%] top-[70%]"><ButterflyMark size={18} className="bf-flutter" /></span>
    </div>
  )
}

/* ------------------------------------ overview ------------------------------------ */
function Overview() {
  const items: [string, string][] = [
    ['My role', 'Product designer — research framing, UX, UI, prototype (solo)'],
    ['Type', 'Self-initiated concept case study'],
    ['Platform', 'iOS-first mobile app'],
    ['Tools', 'Figma, FigJam, React (coded prototype)'],
    ['Status', 'Design concept · usability testing planned'],
  ]
  return (
    <div className="border-y border-[#0B1530]/10 bg-white/60">
      <dl className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-5">
        {items.map(([k, v]) => (
          <div key={k}>
            <dt className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#2F6BFF]">{k}</dt>
            <dd className="mt-1.5 text-[15px] leading-snug text-[#0B1530]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ------------------------------------ the spark ------------------------------------ */
function Spark() {
  return (
    <Section id="spark">
      <Reveal><Eyebrow n="01">The spark</Eyebrow><H2>The best part of the trip happened <em className="text-[#2F6BFF]">along the way</em> — and nobody had shared it.</H2></Reveal>
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {[
          { kind: 'dunes' as const, title: 'Sand dunes, Michigan', text: 'Reviews were mostly a few photos of the destination. The walk there felt like crossing a desert, with views nobody mentioned — and nobody warned that on a windy day the sand blows straight into your eyes. The small beach at the end was less satisfying than the journey.' },
          { kind: 'coast' as const, title: 'Beehive Trail, Acadia', text: 'There were almost no clear photos of what the trail actually feels like. Halfway up I kept thinking: why didn’t anyone show how good this is?' },
        ].map((c, i) => (
          <Reveal key={c.title} delay={i * 120}>
            <figure className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_60px_-40px_rgba(11,21,48,0.45)] ring-1 ring-[#0B1530]/5">
              <Scene kind={c.kind} className="block aspect-[16/10] w-full" label={c.title} />
              <figcaption className="p-6 sm:p-8">
                <div className="font-fraunces text-[24px] font-semibold">{c.title}</div>
                <p className="mt-2 text-[16px] leading-relaxed text-[#3A4760]">{c.text}</p>
                <p className="mt-4 text-[12px] font-semibold uppercase tracking-wider text-[#8A97AD]">Illustration · slot for my own trip photo</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------ problem ------------------------------------ */
function Problem() {
  const pains = [
    ['“Every app shows me the same top-ten list.”', 'Popular places dominate; small spots never surface.'],
    ['“I saved it on Instagram and can’t find where it is.”', 'Inspiration is visual, but locations are vague or missing.'],
    ['“Nobody told me what to watch out for.”', 'Practical tips — wind, tides, timing — rarely make it into reviews.'],
  ]
  return (
    <div className="bg-[#0B1530] text-white">
      <Section>
        <Reveal>
          <div className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.22em] text-[#8EC5FF]"><span className="font-fraunces text-[15px] normal-case tracking-normal text-white/40">02</span><span className="h-px w-8 bg-[#8EC5FF]/50" />Problem</div>
          <p className="mt-6 max-w-[900px] font-fraunces text-[clamp(28px,3.6vw,46px)] leading-[1.12]">
            Discovery platforms focus on established businesses and famous destinations. The small places people find while exploring — a ledge halfway up a trail, a café down three steps — stay hidden or get lost in social feeds.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {pains.map(([q, d], i) => (
            <Reveal key={q} delay={i * 100}>
              <div className="h-full rounded-[24px] bg-white/[0.06] p-6 ring-1 ring-white/10">
                <div className="font-fraunces text-[21px] leading-snug">{q}</div>
                <p className="mt-3 text-[15px] leading-relaxed text-white/70">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-5 text-[13px] text-white/50">Assumption-based pain points from my own trips — to be validated with interviews.</p>
        <Reveal>
          <div className="mt-14 rounded-[28px] bg-gradient-to-br from-[#2F6BFF] to-[#1736A8] p-8 sm:p-10">
            <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/70">How might we</div>
            <p className="mt-3 font-fraunces text-[clamp(24px,3vw,38px)] leading-[1.15]">…help people find places worth stopping for nearby — and make sharing their own discoveries take less than a minute?</p>
          </div>
        </Reveal>
      </Section>
    </div>
  )
}

/* ------------------------------------ landscape ------------------------------------ */
function Landscape() {
  const apps = [
    ['Google Maps', 'Businesses, hours, directions', 'A trailside viewpoint with no address doesn’t fit. Feels like a directory.'],
    ['Yelp', 'Restaurant reviews', 'Businesses only — no nature or hidden spots.'],
    ['AllTrails', 'Trail routes & conditions', 'Built around whole trails, not a single spot along one. No food or coffee.'],
    ['Instagram / TikTok', 'Inspiration & beautiful photos', 'Vague locations, hard to find again, not organized by “near me”.'],
  ]
  return (
    <Section>
      <Reveal><Eyebrow n="03">The gap</Eyebrow><H2>Nothing combines food, coffee, nature <em className="text-[#2F6BFF]">and</em> the spots people find themselves.</H2></Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {apps.map(([n, good, gap], i) => (
          <Reveal key={n} delay={i * 80}>
            <div className="h-full rounded-[24px] bg-white p-6 ring-1 ring-[#0B1530]/8">
              <div className="text-[18px] font-bold">{n}</div>
              <div className="mt-4 text-[12px] font-bold uppercase tracking-wider text-[#1F7A5A]">Great at</div>
              <p className="mt-1 text-[15px] text-[#3A4760]">{good}</p>
              <div className="mt-4 text-[12px] font-bold uppercase tracking-wider text-[#C2410C]">Missing</div>
              <p className="mt-1 text-[15px] leading-snug text-[#3A4760]">{gap}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-5 text-[13px] text-[#8A97AD]">Desk review of publicly available apps, from my perspective as a user.</p>
    </Section>
  )
}

/* ------------------------------------ persona & goals ------------------------------------ */
function Persona() {
  return (
    <Section className="!pt-0">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <div className="relative h-full overflow-hidden rounded-[28px] bg-white p-8 ring-1 ring-[#0B1530]/8 sm:p-10">
            <div className="flex items-center justify-between"><Eyebrow n="04">Proto-persona</Eyebrow><Tag tone="amber">Assumption</Tag></div>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F1E2C9] to-[#D9A866] font-fraunces text-[26px] font-semibold">A</div>
              <div><div className="font-fraunces text-[30px] font-semibold leading-none">Arjun, 24</div><div className="mt-1 text-[15px] text-[#5B6B85]">Grad student · Baltimore</div></div>
            </div>
            <ul className="mt-6 space-y-3 text-[16px] leading-snug text-[#3A4760]">
              <li>• Explores on weekends — cafés, short hikes, sunset spots</li>
              <li>• Saves posts but rarely finds the places again</li>
              <li>• Tight budget; prefers places within ~30 minutes</li>
              <li>• Finds cool spots on hikes — would share them if it took under a minute</li>
            </ul>
            <blockquote className="mt-6 border-l-4 border-[#2F6BFF] pl-4 font-fraunces text-[21px] italic leading-snug">“Reviews show the destination — not what’s worth it along the way.”</blockquote>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="h-full rounded-[28px] bg-[#EAF2FF] p-8 sm:p-10">
            <Eyebrow n="05">Design goals</Eyebrow>
            {[
              ['5s', 'Answer “what’s near me?” in under five seconds', 'Home leads with Near You and location context.'],
              ['60s', 'Share a discovery in under a minute', 'Six fields; location and photo come first and auto-fill.'],
              ['✦', 'Make hidden gems visible everywhere', 'A badge and a “Discovered by” credit — on cards, pins and details.'],
            ].map(([k, t, d]) => (
              <div key={t} className="mt-6 flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white font-fraunces text-[20px] font-semibold text-[#2F6BFF] ring-1 ring-[#CFE0FF]">{k}</div>
                <div><div className="text-[17px] font-bold leading-snug">{t}</div><p className="mt-1 text-[15px] text-[#3A4760]">{d}</p></div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

/* ------------------------------------ flows ------------------------------------ */
function Flows() {
  const flows = [
    { name: 'Discover', color: '#2F6BFF', steps: ['Open app', 'Near You', 'Place details', 'Read tip + reviews', 'Save ♡', 'Directions'] },
    { name: 'Share', color: '#1F7A5A', steps: ['Tap +', 'Photo', 'Location (auto)', 'Name + category', 'Description + tip', 'Shared ✓'] },
  ]
  return (
    <Section>
      <Reveal><Eyebrow n="06">User flows</Eyebrow><H2>Two loops that feed each other.</H2>
        <p className="mt-4 max-w-[640px] text-[17px] leading-relaxed text-[#3A4760]">Every discovery someone shares becomes something the next explorer finds — the core of the product.</p>
      </Reveal>
      <div className="mt-12 space-y-6">
        {flows.map((f) => (
          <Reveal key={f.name}>
            <div className="rounded-[28px] bg-white p-6 ring-1 ring-[#0B1530]/8 sm:p-8">
              <div className="text-[13px] font-bold uppercase tracking-[0.2em]" style={{ color: f.color }}>Flow · {f.name}</div>
              <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {f.steps.map((s, i) => (
                  <li key={s} className="relative">
                    <div className="flex h-full items-center gap-3 rounded-2xl p-3.5 ring-1" style={{ background: `${f.color}0D`, boxShadow: `inset 0 0 0 1px ${f.color}33` }}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: f.color }}>{i + 1}</span>
                      <span className="text-[14px] font-semibold leading-tight">{s}</span>
                    </div>
                    {i < f.steps.length - 1 && <span className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-[18px] lg:block" style={{ color: f.color }} aria-hidden>→</span>}
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------ exploration ------------------------------------ */
function Exploration() {
  const dirs = [
    { name: 'Field Journal', note: 'Warm, earthy, hand-made. Felt nostalgic but too quiet for night photos and blue water.', bg: '#EFE6D6', swatches: ['#3D3A2E', '#6E8B5E', '#C8A46B', '#F4ECDD'], font: 'Fraunces', sample: 'A notebook of places', chosen: false },
    { name: 'Night Explorer', note: 'Dark and neon. Dramatic, but it fought with daylight photography and felt like a game.', bg: '#11162A', swatches: ['#0B0F1E', '#7C5CFF', '#22D3EE', '#E9ECF5'], font: 'Inter', sample: 'Go out tonight', chosen: false, dark: true },
    { name: 'Morpho', note: 'Luminous blue (sky, water, the morpho butterfly) on warm sand paper. Calm, trustworthy, lets photos lead.', bg: '#F7F2EA', swatches: ['#0B1530', '#2F6BFF', '#8EC5FF', '#F7F2EA'], font: 'Fraunces', sample: 'Found along the way', chosen: true },
  ]
  return (
    <Section>
      <Reveal><Eyebrow n="07">Design exploration</Eyebrow><H2>Three visual directions. One felt like discovery.</H2></Reveal>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {dirs.map((d, i) => (
          <Reveal key={d.name} delay={i * 100}>
            <div className={`relative h-full rounded-[28px] p-6 ring-1 ${d.chosen ? 'ring-2 ring-[#2F6BFF]' : 'ring-[#0B1530]/8'} bg-white`}>
              {d.chosen && <span className="absolute -top-3 right-6"><Tag tone="ink">Chosen</Tag></span>}
              <div className="flex h-[190px] flex-col justify-between rounded-[20px] p-5" style={{ background: d.bg }}>
                <div className="flex gap-1.5">{d.swatches.map((c) => <span key={c} className="h-8 w-8 rounded-full ring-2 ring-white/60" style={{ background: c }} />)}</div>
                <div className={`text-[28px] leading-tight ${d.dark ? 'text-white' : 'text-[#0B1530]'}`} style={{ fontFamily: d.font, fontWeight: 600 }}>{d.sample}</div>
              </div>
              <div className="mt-5 text-[20px] font-bold">{d.name}</div>
              <p className="mt-2 text-[15px] leading-relaxed text-[#3A4760]">{d.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------ wireframes ------------------------------------ */
function Wireframes() {
  return (
    <div className="bg-white">
      <Section>
        <Reveal><Eyebrow n="08">Wireframes</Eyebrow><H2>Structure first: what matters, in what order.</H2></Reveal>
        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {WIREFRAMES.map((w, i) => (
            <Reveal key={w.title} delay={i * 90}>
              <div className="flex flex-col items-center">
                {w.frame}
                <div className="mt-5 w-full max-w-[240px]">
                  <div className="text-[17px] font-bold">{w.title}</div>
                  <ol className="mt-2 space-y-1.5">
                    {w.notes.map((n, k) => (
                      <li key={n} className="flex gap-2 text-[14px] leading-snug text-[#3A4760]">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-[11px] font-bold text-white">{k + 1}</span>{n}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </div>
  )
}

/* ------------------------------------ hi-fi showcase ------------------------------------ */
function HiFi() {
  const screens: { id: ScreenId; place?: string; title: string; text: string }[] = [
    { id: 'home', title: 'Home', text: 'Location, one search, then Near You and Hidden Gems — photography leads.' },
    { id: 'explore', title: 'Explore', text: 'Distance, rating and category filters, plus a one-tap “only hidden gems” switch.' },
    { id: 'map', place: 'ridge', title: 'Map', text: 'Butterfly pins mark community discoveries; the preview sheet keeps context.' },
    { id: 'place', place: 'dunes', title: 'Place details', text: 'Big photo, Quick Tip above the description, and credit to the explorer.' },
    { id: 'add', title: 'Add a discovery', text: 'Photo → auto location → name → tip. Public-access check built in.' },
    { id: 'success', title: 'Shared', text: 'A moment of delight — and proof the spot is now discoverable nearby.' },
  ]
  const s = (id: ScreenId, place = 'ridge'): AppState => id === 'success'
    ? { ...staticState('success'), shared: [{ ...PLACES[1], id: 'new-sunset' }] }
    : staticState(id, place)
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#EAF2FF] to-[#F7F2EA]">
      <Section>
        <Reveal><Eyebrow n="09">High-fidelity concepts</Eyebrow><H2>Photography first. <em className="text-[#2F6BFF]">Tips</em> always in reach.</H2></Reveal>
        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {screens.map((sc, i) => (
            <Reveal key={sc.id} delay={(i % 3) * 100}>
              <div className="flex flex-col items-center text-center">
                <div inert><Phone scale={0.82} label={`${sc.title} screen`}><AppScreen s={s(sc.id, sc.place)} /></Phone></div>
                <div className="mt-5 text-[18px] font-bold">{sc.title}</div>
                <p className="mt-1 max-w-[290px] text-[15px] leading-snug text-[#3A4760]">{sc.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-12 text-center text-[13px] text-[#8A97AD]">All places, names, ratings and reviews in these mockups are sample content.</p>
      </Section>
    </div>
  )
}

/* ------------------------------------ interactive map ------------------------------------ */
function MapExplorer() {
  const [filter, setFilter] = useState<Category | 'gems' | 'all'>('all')
  const [sel, setSel] = useState<string>('ridge')
  const shown = useMemo(() => PLACES.filter((p) => filter === 'all' ? true : filter === 'gems' ? p.hidden : p.categories.includes(filter)), [filter])
  const p = PLACES.find((x) => x.id === sel)!
  return (
    <Section>
      <Reveal><Eyebrow n="10">Interactive map</Eyebrow><H2>Pins that tell you <em className="text-[#2F6BFF]">why</em> to go.</H2>
        <p className="mt-4 max-w-[640px] text-[17px] leading-relaxed text-[#3A4760]">Filter the concept map and select a pin. Butterfly-shaped pins are community discoveries.</p>
      </Reveal>
      <div className="mt-8 flex flex-wrap gap-2" role="toolbar" aria-label="Filter places">
        {(['all', 'gems', ...CATEGORIES] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
            className={`rounded-full px-4 py-2 text-[14px] font-semibold transition ${filter === f ? 'bg-[#0B1530] text-white' : 'bg-white text-[#0B1530] ring-1 ring-[#0B1530]/15 hover:ring-[#2F6BFF]'}`}>
            {f === 'all' ? 'All' : f === 'gems' ? '✦ Hidden gems' : f}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-[28px] ring-1 ring-[#0B1530]/10">
          <MapView places={shown} selected={sel} onSelect={setSel} className="block aspect-[10/7] w-full" />
        </div>
        <div className="flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-[#0B1530]/10" aria-live="polite">
          <Scene kind={p.scene} className="block aspect-[16/10] w-full" />
          <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap gap-1.5">
              {p.hidden && <Tag>✦ Hidden gem</Tag>}
              {p.categories.map((c) => <span key={c} className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-white" style={{ background: CAT_COLOR[c] }}>{c}</span>)}
            </div>
            <div className="mt-3 font-fraunces text-[28px] font-semibold leading-tight">{p.name}</div>
            <div className="mt-1 text-[15px] text-[#5B6B85]">★ {p.rating.toFixed(1)} · {p.miles} mi {p.by && <>· by @{p.by}</>}</div>
            <div className="mt-4 rounded-2xl bg-[#F2F7FF] p-4 ring-1 ring-[#CFE0FF]">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#2F6BFF]">Quick tip</div>
              <p className="mt-1 text-[15px] leading-snug">{p.tip}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
        {shown.map((x) => <button key={x.id} type="button" onClick={() => setSel(x.id)} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${sel === x.id ? 'bg-[#2F6BFF] text-white' : 'bg-white ring-1 ring-[#0B1530]/15'}`}>{x.name}</button>)}
      </div>
    </Section>
  )
}

/* ------------------------------------ prototype ------------------------------------ */
function Prototype() {
  const [s, setS] = useState<AppState>({ screen: 'home', placeId: 'ridge', saved: [], shared: [] })
  const go = (screen: ScreenId, placeId?: string) => setS((x) => ({ ...x, screen, placeId: placeId ?? x.placeId }))
  const toggleSave = (id: string) => setS((x) => ({ ...x, saved: x.saved.includes(id) ? x.saved.filter((i) => i !== id) : [...x.saved, id] }))
  const share = () => setS((x) => x.shared.length ? { ...x, screen: 'success' } : ({
    ...x, screen: 'success',
    shared: [{ ...PLACES[1], id: 'new-sunset', name: 'Sunset Rock (yours)', reviews: 0, rating: 5, miles: 0.3, by: 'sai' }],
  }))
  // completed tasks stay checked once achieved
  const [done, setDone] = useState<number[]>([])
  useEffect(() => {
    const now = [s.screen === 'place', s.saved.length > 0, s.screen === 'map' && s.saved.length > 0, s.shared.length > 0]
    setDone((d) => { const n = now.flatMap((v, i) => (v && !d.includes(i) ? [i] : [])); return n.length ? [...d, ...n] : d })
  }, [s])
  const tasks: [string, boolean][] = ['Open a hidden gem from Home', 'Save it with ♡', 'Find it on the Map', 'Share a discovery with +'].map((t, i) => [t, done.includes(i)])
  return (
    <div id="prototype" className="scroll-mt-16 bg-[#0B1530] text-white">
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <Reveal>
            <div className="flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.22em] text-[#8EC5FF]"><span className="font-fraunces text-[15px] normal-case tracking-normal text-white/40">11</span><span className="h-px w-8 bg-[#8EC5FF]/50" />Interactive prototype</div>
            <h2 className="mt-4 font-fraunces text-[clamp(34px,4.6vw,56px)] font-semibold leading-[1.04]">Tap through it yourself.</h2>
            <p className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-white/75">A working React prototype of the core loop. Try these:</p>
            <ul className="mt-6 space-y-3">
              {tasks.map(([t, done]) => (
                <li key={t} className="flex items-center gap-3 text-[16px]">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold ${done ? 'bg-[#2F6BFF] text-white' : 'ring-1 ring-white/30 text-white/50'}`}>{done ? '✓' : ''}</span>
                  <span className={done ? 'text-white' : 'text-white/80'}>{t}</span>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => { setS({ screen: 'home', placeId: 'ridge', saved: [], shared: [] }); setDone([]) }} className="mt-8 rounded-full px-5 py-2.5 text-[14px] font-semibold ring-1 ring-white/30 hover:bg-white/10">Reset prototype</button>
          </Reveal>
          <div className="mx-auto">
            <Phone scale={1} className="hidden sm:block" label="Interactive Butterfly prototype"><AppScreen s={s} go={go} toggleSave={toggleSave} share={share} /></Phone>
            <Phone scale={0.86} className="sm:hidden" label="Interactive Butterfly prototype"><AppScreen s={s} go={go} toggleSave={toggleSave} share={share} /></Phone>
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ------------------------------------ design system ------------------------------------ */
function DesignSystem() {
  const colors = [
    ['Ink', '#0B1530', 'Text, primary buttons'], ['Morpho', '#2F6BFF', 'Brand, hidden gems, links'], ['Sky', '#8EC5FF', 'Gradients, highlights'],
    ['Mist', '#EAF2FF', 'Tip cards, chips'], ['Sand', '#F7F2EA', 'App background'], ['Sun', '#FFB547', 'Ratings only'],
  ]
  return (
    <Section>
      <Reveal><Eyebrow n="12">Design system</Eyebrow><H2>Small, calm, and built for photos.</H2></Reveal>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="h-full rounded-[28px] bg-white p-6 ring-1 ring-[#0B1530]/8 sm:p-8">
            <div className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#5B6B85]">Color</div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {colors.map(([n, h, u]) => (
                <div key={n} className="overflow-hidden rounded-2xl ring-1 ring-[#0B1530]/8">
                  <div className="h-16" style={{ background: h }} />
                  <div className="p-3"><div className="text-[14px] font-bold">{n} <span className="font-mono text-[12px] font-normal text-[#5B6B85]">{h}</span></div><div className="text-[13px] text-[#5B6B85]">{u}</div></div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="h-full rounded-[28px] bg-white p-6 ring-1 ring-[#0B1530]/8 sm:p-8">
            <div className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#5B6B85]">Type</div>
            <div className="mt-4 font-fraunces text-[44px] font-semibold leading-none">Fraunces</div>
            <p className="mt-1 text-[14px] text-[#5B6B85]">Headlines — a travel-magazine voice</p>
            <div className="mt-5 text-[30px] font-semibold leading-none">Inter</div>
            <p className="mt-1 text-[14px] text-[#5B6B85]">Interface — legible at small sizes</p>
            <div className="mt-6 text-[13px] font-bold uppercase tracking-[0.18em] text-[#5B6B85]">Components</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#0B1530] px-4 py-2 text-[13px] font-semibold text-white">Primary</span>
              <span className="rounded-full px-4 py-2 text-[13px] font-semibold ring-1 ring-[#E3E8F0]">Secondary</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2F6BFF] px-2.5 py-1 text-[12px] font-semibold text-white"><ButterflyMark size={12} className="[&_path]:fill-white [&_rect]:fill-white" /> Hidden gem</span>
              <span className="rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[12px] font-semibold text-[#2F6BFF]">Scenic</span>
            </div>
            <p className="mt-6 text-[13px] leading-snug text-[#5B6B85]">Targets: 4.5:1 text contrast, 44 pt touch targets, labels on every icon button.</p>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

/* ------------------------------------ decisions ------------------------------------ */
function Decisions() {
  const items = [
    { t: 'Hidden Gem is a badge, not a category', d: 'A hidden café is still Coffee. Making “hidden” a badge keeps filters clean and puts the core idea on every card, pin and page.', v: <span className="inline-flex items-center gap-1 rounded-full bg-[#2F6BFF] px-3 py-1.5 text-[13px] font-semibold text-white"><ButterflyMark size={14} className="[&_path]:fill-white [&_rect]:fill-white" /> Hidden gem</span> },
    { t: 'The Quick Tip is required', d: 'Born from the dunes: nobody mentioned the wind. Every discovery must answer “what should people know before going?”', v: <div className="rounded-xl bg-[#F2F7FF] p-3 text-left ring-1 ring-[#CFE0FF]"><div className="text-[10px] font-bold tracking-[0.16em] text-[#2F6BFF]">QUICK TIP</div><div className="text-[13px]">Bring sunglasses — sand blows on windy days.</div></div> },
    { t: 'No address needed — drop a pin', d: 'Spots along a trail have no street address. Location auto-fills from GPS and the pin can be dragged.', v: <svg width="120" height="70" viewBox="0 0 120 70"><path d="M5 60 C 30 30 60 55 115 15" stroke="#1F7A5A" strokeWidth="3" strokeDasharray="2 7" fill="none" strokeLinecap="round" /><path d="M66 38 c-9 -11 -9 -23 0 -24 c9 1 9 13 0 24z" fill="#2F6BFF" /></svg> },
    { t: 'Photo is mandatory', d: 'From Acadia: the problem was a lack of real photos. A discovery without a photo is just a rumor.', v: <Scene kind="coast" className="h-[70px] w-[120px] rounded-xl" /> },
    { t: '“Publicly accessible” check', d: 'Sharing hidden places has a responsibility side. One checkbox discourages posting private property.', v: <span className="inline-flex items-center gap-2 text-[13px]"><span className="flex h-5 w-5 items-center justify-center rounded bg-[#2F6BFF] text-[11px] text-white">✓</span>Publicly accessible</span> },
    { t: 'Directions hand off to native maps', d: 'Routing is a solved problem. Butterfly opens Apple or Google Maps — and stays focused on discovery.', v: <span className="rounded-full bg-[#0B1530] px-4 py-2 text-[13px] font-semibold text-white">Directions ↗</span> },
  ]
  return (
    <Section>
      <Reveal><Eyebrow n="13">Key design decisions</Eyebrow><H2>Every choice traces back to a real moment.</H2></Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={(i % 3) * 90}>
            <div className="flex h-full flex-col rounded-[24px] bg-white p-6 ring-1 ring-[#0B1530]/8">
              <div className="flex h-[96px] items-center justify-center rounded-2xl bg-[#F7F2EA]">{it.v}</div>
              <div className="mt-5 text-[18px] font-bold leading-snug">{it.t}</div>
              <p className="mt-2 text-[15px] leading-relaxed text-[#3A4760]">{it.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------ validation & reflection ------------------------------------ */
function Validation() {
  return (
    <div className="bg-white">
      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <Reveal>
            <Eyebrow n="14">Validation plan</Eyebrow>
            <H2>What I’ll test next.</H2>
            <p className="mt-4 rounded-2xl bg-[#FFF3DC] p-4 text-[15px] leading-snug text-[#6B4A00] ring-1 ring-[#F5D9A3]">No usability testing has been conducted yet. These are planned tasks and the targets I’ll measure against.</p>
            <table className="mt-6 w-full text-left text-[15px]">
              <thead><tr className="text-[12px] uppercase tracking-wider text-[#5B6B85]"><th className="pb-2 font-bold">Task (5 participants)</th><th className="pb-2 font-bold">Target</th></tr></thead>
              <tbody className="divide-y divide-[#0B1530]/8">
                {[['Find a hidden gem within 2 miles', '5 / 5 succeed'], ['Save it and find it again', 'Under 20 s'], ['Share a discovery', 'Under 60 s'], ['Explain what a “hidden gem” is', 'No help needed']].map(([a, b]) => (
                  <tr key={a}><td className="py-3 pr-4">{a}</td><td className="py-3 font-semibold text-[#1F4FE0]">{b}</td></tr>
                ))}
              </tbody>
            </table>
          </Reveal>
          <Reveal delay={120}>
            <Eyebrow n="15">Reflection</Eyebrow>
            <H2>What I learned so far.</H2>
            <ul className="mt-6 space-y-5 text-[16px] leading-relaxed text-[#3A4760]">
              <li><b className="text-[#0B1530]">Start from a real moment.</b> The dunes and Acadia stories gave every feature a reason — and made it easy to cut what didn’t serve them.</li>
              <li><b className="text-[#0B1530]">Remove, don’t add.</b> I deliberately left out followers, chat and AI recommendations to keep the loop of discover → share tight.</li>
              <li><b className="text-[#0B1530]">Next:</b> run the planned tests, replace illustrations with my own trip photos, and build the app (Next.js + Supabase + Mapbox).</li>
            </ul>
          </Reveal>
        </div>
      </Section>
    </div>
  )
}

/* ------------------------------------ footer ------------------------------------ */
function Footer() {
  return (
    <footer className="bg-[#0B1530] text-white">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-16 sm:px-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#8EC5FF]">Next case study</div>
          <div className="mt-2 font-fraunces text-[clamp(36px,5vw,64px)] font-semibold leading-none">Landed</div>
          <p className="mt-2 max-w-[520px] text-[16px] text-white/70">A calm first week for international students — being redesigned to this standard.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="#/cases" className="rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-[#0B1530] hover:bg-[#EAF2FF]">← All case studies</a>
          <a href="#/projects" className="rounded-full px-5 py-3 text-[15px] font-semibold ring-1 ring-white/30 hover:bg-white/10">Projects</a>
          <a href="#/case/landed" className="rounded-full px-5 py-3 text-[15px] font-semibold ring-1 ring-white/30 hover:bg-white/10">Next concept: Landed →</a>
          <a href="#/contact" className="rounded-full bg-[#e8202f] px-5 py-3 text-[15px] font-semibold text-white hover:bg-[#c81624]">LET'S SAVE THE WORLD.</a>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-6 text-center text-[13px] text-white/50">Butterfly is a self-initiated concept. Sample content shown in mockups is fictional. © Sai Abhilash Mandava</div>
    </footer>
  )
}
