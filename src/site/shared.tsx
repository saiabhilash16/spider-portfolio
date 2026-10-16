import { useEffect, useState, type ReactNode } from 'react'
import { profile } from '../data/content'

/* Shared pieces for the cinematic site pages (Work, Project, Concept). */

export const RED = '#e8202f'
export const BLUE = '#2f6bff'

/** Asset URL that also works in the single-file preview (window.__slots data URIs). */
export const asset = (file: string) =>
  (window as any).__slots?.[file] ?? (import.meta.env.VITE_FLAT === '1' ? `${import.meta.env.BASE_URL}${file}` : `${import.meta.env.BASE_URL}assets/tribute/scene1/${file}`)

export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function useHashPath() {
  const [h, setH] = useState(location.hash)
  useEffect(() => { const on = () => setH(location.hash); addEventListener('hashchange', on); return () => removeEventListener('hashchange', on) }, [])
  return h
}

const LINKS = [
  { href: '#/projects', label: 'PROJECTS', match: ['#/projects', '#/project/'] },
  { href: '#/cases', label: 'UX CASE STUDIES', match: ['#/cases', '#/case/'] },
  { href: '#/skills', label: 'SKILLS', match: ['#/skills'] },
  { href: '#/contact', label: 'CONTACT', match: ['#/contact'] },
]

/** Top navigation used on every page except the Scene 1 intro (which has its own minimal header). */
export function SiteNav({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const h = useHashPath()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [h])
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [open])
  const active = (m: string[]) => m.some((x) => (x.endsWith('/') ? h.startsWith(x) : h === x))
  const fg = tone === 'dark' ? 'text-white' : 'text-[#0B1530]'
  return (
    <header className={`fixed inset-x-0 top-0 z-50 ${fg}`}>
      <div className={`pointer-events-none absolute inset-0 h-24 ${tone === 'dark' ? 'bg-gradient-to-b from-black/85 to-transparent' : ''}`} />
      <div className="relative mx-auto flex max-w-[1500px] items-center justify-between px-5 pt-5 sm:px-10 sm:pt-6">
        <a href="#/" className="t1-display flex items-center gap-2 text-[15px] tracking-[0.2em]" aria-label="Home — cinematic intro">
          <span className="h-2.5 w-2.5 rotate-45 bg-[#e8202f] shadow-[0_0_12px_#e8202f]" />SAI · MANDAVA
        </a>
        <nav aria-label="Main" className="hidden items-center gap-1 text-[12px] font-semibold tracking-[0.16em] md:flex">
          <a href="#/" className="px-3 py-2 opacity-70 hover:opacity-100">HOME</a>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} aria-current={active(l.match) ? 'page' : undefined}
              className={`relative px-3 py-2 transition hover:text-[#ff4a5a] ${active(l.match) ? `${tone === 'dark' ? 'text-white' : ''} after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:bg-gradient-to-r after:from-[#e8202f] after:to-[#2f6bff]` : ''}`}>{l.label}</a>
          ))}
        </nav>
        <button type="button" className={`border px-4 py-2 text-[12px] font-semibold tracking-[0.18em] md:hidden ${tone === 'dark' ? 'border-white/40' : 'border-current'}`} aria-expanded={open} aria-controls="mnav" onClick={() => setOpen((o) => !o)}>
          {open ? 'CLOSE' : 'MENU'}
        </button>
      </div>
      {open && (
        <nav id="mnav" aria-label="Main" className="fixed inset-0 top-0 -z-10 flex flex-col justify-center gap-2 bg-black bg-[radial-gradient(70%_50%_at_0%_100%,rgba(232,32,47,.3),transparent_70%),radial-gradient(60%_40%_at_100%_0%,rgba(47,107,255,.3),transparent_70%)] px-8">
          {[{ href: '#/', label: 'HOME', match: [] as string[] }, ...LINKS].map((l, i) => (
            <a key={l.href} href={l.href} aria-current={active(l.match) ? 'page' : undefined} className="t1-display flex items-baseline gap-4 text-[13vw] leading-[1.02] text-white">
              <span className="font-mono text-[12px] tracking-[0.3em] text-[#2f6bff]">0{i}</span>{l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

export function Tag({ children, tone = 'red' }: { children: ReactNode; tone?: 'red' | 'blue' | 'white' }) {
  const c = tone === 'red' ? 'border-[#e8202f] text-[#ff5a68]' : tone === 'blue' ? 'border-[#2f6bff] text-[#7aa2ff]' : 'border-white/50 text-white/80'
  return <span className={`inline-block border px-2 py-[3px] font-mono text-[10px] tracking-[0.25em] ${c}`}>{children}</span>
}

/** Big display title, split into characters so GSAP can reveal them. */
export function Title({ text, className = '', as: As = 'h2', id }: { text: string; className?: string; as?: 'h1' | 'h2' | 'h3'; id?: string }) {
  return (
    <As id={id} tabIndex={-1} className={`t1-display leading-[0.86] outline-none ${className}`} aria-label={text}>
      {text.split(' ').map((w, wi) => (
        <span key={wi} className="inline-block overflow-hidden whitespace-nowrap pb-[0.06em] align-bottom" aria-hidden>
          {[...w].map((c, i) => <span key={i} className="rv-ch inline-block">{c}</span>)}
          {' '}
        </span>
      ))}
    </As>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-8 text-center text-[11px] leading-relaxed text-white/40 sm:px-10">
      <p>© {new Date().getFullYear()} {profile.name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())} · Built with React, GSAP and WebGL.</p>
      <a href="#/work" className="mt-3 inline-block border border-white/25 px-4 py-2 font-mono text-[11px] tracking-[0.3em] text-white/70 hover:border-white hover:text-white">VIEW ALL WORK</a>
      <p className="mt-3">Unofficial fan project. Spider-Man and related characters © Marvel. Not affiliated with or endorsed by Marvel or Sony.</p>
    </footer>
  )
}

/** Full-bleed city plate: the Scene 1 skyline, black-and-white, halftone, with red/blue light. */
export function CityPlate({ className = '', focus = '50% 55%', strength = 0.55 }: { className?: string; focus?: string; strength?: number }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <img src={asset('skyline.jpg')} alt="" className="plate-img absolute inset-0 h-full w-full object-cover" style={{ objectPosition: focus, opacity: strength, filter: 'grayscale(1) contrast(1.25) brightness(.8)' }} />
      <div className="halftone absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_15%_100%,rgba(232,32,47,.35),transparent_70%),radial-gradient(50%_50%_at_95%_10%,rgba(47,107,255,.3),transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
    </div>
  )
}
