import { lazy, Suspense, useEffect, useRef, useState } from 'react'

/* Routes
 *   #/                 the story: café → mask/swing → above NYC (name) → eye → multiverse → work → LET'S SAVE THE WORLD.
 *   #/projects         story → world A (software projects)
 *   #/cases            story → world B (UX case studies)
 *   #/skills           story → world C (skills & technologies)
 *   #/contact          story → final scene (LET'S SAVE THE WORLD.)
 *   #/work             all work as a plain list (footer link only)
 *   #/project/:id      project detail
 *   #/case/butterfly   full Butterfly case study
 *   #/case/:id         concept overview (other five)
 * Archived experiments (not linked anywhere): #/city (old 3D block city), #/noir, #/intro-v1 */
const Story = lazy(() => import('./story/Story').then((m) => ({ default: m.Story })))
const WorkPage = lazy(() => import('./site/WorkPage').then((m) => ({ default: m.WorkPage })))
const ProjectPage = lazy(() => import('./site/DetailPages').then((m) => ({ default: m.ProjectPage })))
const ConceptCaseStudy = lazy(() => import('./cases/concepts/ConceptCaseStudy').then((m) => ({ default: m.ConceptCaseStudy })))
const ButterflyPage = lazy(() => import('./cases/butterfly/ButterflyPage').then((m) => ({ default: m.ButterflyPage })))
const OldCity = lazy(() => import('./App'))
const Home = lazy(() => import('./home/Home').then((m) => ({ default: m.Home })))
const CinematicIntro = lazy(() => import('./cinematic/CinematicIntro').then((m) => ({ default: m.CinematicIntro })))

const NAME = 'Sai Abhilash Mandava'
const PROJECTS = ['portal', 'commerce']
const CONCEPTS = ['butterfly', 'landed', 'spotfinder', 'preppilot', 'splitnest', 'pause']

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const on = () => setHash(window.location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

type Route =
  | { page: 'intro'; section: 'top' | 'projects' | 'cases' | 'skills' | 'contact' } | { page: 'work'; section: 'top' }
  | { page: 'project'; id: string } | { page: 'case'; id: string }
  | { page: 'city' } | { page: 'noir' } | { page: 'intro-v1' } | { page: 'missing' }

function parse(hash: string): Route {
  const h = hash.replace(/\/+$/, '')
  if (h === '' || h === '#') return { page: 'intro', section: 'top' }
  if (h === '#/work') return { page: 'work', section: 'top' }
  if (h === '#/projects') return { page: 'intro', section: 'projects' }
  if (h === '#/cases') return { page: 'intro', section: 'cases' }
  if (h === '#/skills') return { page: 'intro', section: 'skills' }
  if (h === '#/contact') return { page: 'intro', section: 'contact' }
  if (h.startsWith('#/project/') && PROJECTS.includes(h.slice(10))) return { page: 'project', id: h.slice(10) }
  if (h.startsWith('#/case/') && CONCEPTS.includes(h.slice(7))) return { page: 'case', id: h.slice(7) }
  if (h === '#/city') return { page: 'city' }
  if (h === '#/noir') return { page: 'noir' }
  if (h === '#/intro-v1') return { page: 'intro-v1' }
  return { page: 'missing' }
}

const TITLES: Record<string, string> = {
  portal: 'AI-Powered Enterprise Service Portal', commerce: 'E-Commerce Customer Experience Platform',
  butterfly: 'Butterfly', landed: 'Landed', spotfinder: 'SpotFinder', preppilot: 'PrepPilot', splitnest: 'SplitNest', pause: 'Pause',
}

export default function Root() {
  const hash = useHash()
  const route = parse(hash)
  // a page "key": changing sections inside Work does not remount it (it glides instead)
  const pageKey = route.page === 'work' ? 'work' : route.page === 'project' || route.page === 'case' ? `${route.page}:${route.id}` : route.page

  useEffect(() => {
    document.documentElement.style.overflow = ''
    document.title =
      route.page === 'intro' ? (route.section === 'top' ? `${NAME} — Portfolio` : `${{ projects: 'Software Projects', cases: 'UX Case Studies', skills: 'Skills & Technologies', contact: 'Contact' }[route.section]} — ${NAME}`)
      : route.page === 'work' ? `All Work — ${NAME}`
      : route.page === 'project' ? `${TITLES[route.id]} — Project · ${NAME}`
      : route.page === 'case' ? `${TITLES[route.id]} — Concept Case Study · ${NAME}`
      : `${NAME} — Portfolio`
  }, [hash]) // eslint-disable-line react-hooks/exhaustive-deps

  // In-page anchors (href="#section") must scroll, not change the route.
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const href = a.getAttribute('href')!
      if (href.startsWith('#/') || href === '#') return
      const el = document.getElementById(decodeURIComponent(href.slice(1)))
      if (!el) return
      e.preventDefault()
      el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
    }
    document.addEventListener('click', on)
    return () => document.removeEventListener('click', on)
  }, [])

  const fallback = <div className="min-h-screen bg-black" />
  let page
  switch (route.page) {
    case 'intro': page = <Story section={route.section} />; break
    case 'work': page = <WorkPage section={route.section} />; break
    case 'project': page = <ProjectPage id={route.id} />; break
    case 'case': page = route.id === 'butterfly' ? <ButterflyPage /> : <ConceptCaseStudy id={route.id} />; break
    case 'city': page = <OldCity />; break
    case 'noir': page = <Home />; break
    case 'intro-v1': page = <CinematicIntro />; break
    default: page = <NotFound />
  }
  return (
    <>
      <a href="#main-skip" onClick={(e) => { e.preventDefault(); const h = document.querySelector('h1') as HTMLElement | null; if (h) { if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus() } }} className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-white focus:px-3 focus:py-2 focus:text-black">Skip to content</a>
      <Suspense key={pageKey} fallback={fallback}>{page}</Suspense>
      <RouteWipe k={hash} />
      <Announcer text={typeof document !== 'undefined' ? document.title : ''} k={hash} />
    </>
  )
}

/** Red/blue glitch wipe played on every page change (skipped for reduced motion and on first load). */
function RouteWipe({ k }: { k: string }) {
  const first = useRef(true)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setN((x) => x + 1)
  }, [k])
  if (!n) return null
  return (
    <div key={n} className="route-wipe pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      <span className="rw-a" /><span className="rw-b" /><span className="rw-c" />
    </div>
  )
}

/** Screen readers hear the new page title after a route change. */
function Announcer({ text, k }: { text: string; k: string }) {
  const [msg, setMsg] = useState('')
  useEffect(() => { const t = setTimeout(() => setMsg(document.title), 120); return () => clearTimeout(t) }, [k, text])
  return <div className="sr-only" aria-live="polite">{msg}</div>
}

function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-center text-white">
      <div>
        <div className="font-mono text-[11px] tracking-[0.4em] text-white/50">404 · LOST IN THE MULTIVERSE</div>
        <h1 tabIndex={-1} className="t1-display t1-chroma mt-4 text-[clamp(56px,10vw,140px)] leading-none">PAGE NOT FOUND</h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-[12px] font-semibold tracking-[0.2em]">
          <a href="#/" className="border border-white/40 px-5 py-3 hover:border-[#e8202f]">HOME</a>
          <a href="#/work" className="border border-white/40 px-5 py-3 hover:border-[#2f6bff]">WORK</a>
        </div>
      </div>
    </main>
  )
}
