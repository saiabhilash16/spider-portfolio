import { useEffect, useRef, useState } from 'react'

/* =====================================================================================
 *  PLAYBACK MODES — one shared timeline: the story's scroll position.
 *   MOVIE   PLAY drives the scroll position automatically (scroll / wheel / touch input is
 *           held while it plays), pausing at every project, case study and skill long enough
 *           to read. Every scene keeps reading the same scroll position, so the animation,
 *           panels and portals stay in sync.
 *   EXPLORE the visitor's own scrolling drives the same timeline, forward and backward.
 *  Switching keeps the current position. Nothing plays until PLAY is pressed.
 * ===================================================================================== */

export type Mode = 'idle' | 'movie' | 'explore'
type Seg = { y0: number; y1: number; dur: number; kind: 'move' | 'dwell'; label?: string }

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const ease = (u: number) => (u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)

/** the movie's itinerary, measured from the current layout (pixels) */
function buildTimeline(): Seg[] | null {
  const mv = (window as any).__mv
  const fin = document.querySelector<HTMLElement>('[data-scene-marker="final"]')
  if (!mv || mv.start() == null || !fin) return null
  const s0 = mv.start() as number, s1 = mv.end() as number
  const at = (p: number) => s0 + p * (s1 - s0)
  const H = innerHeight, red = reduced()
  const segs: Seg[] = []
  let y = 0
  const move = (to: number, base: number) => {
    const d = Math.abs(to - y) / H
    segs.push({ y0: y, y1: to, kind: 'move', dur: red ? .6 : Math.min(6.5, Math.max(base, d * .55)) }); y = to
  }
  const dwell = (to: number, dur: number, label?: string) => { segs.push({ y0: y, y1: to, kind: 'dwell', dur, label }); y = to }
  // New York: the city, the name, the lens
  move(s0 * .5, 6); dwell(s0 * .62, 3.5, 'name'); move(s0, 5)
  // the fall through the portals
  move(at(.15), 10)
  for (const r of mv.SHOT_RANGES as { key: string; holdStart: number; holdEnd: number; landing: boolean }[]) {
    move(at(r.holdStart), 2.6)
    const read = r.key === 'X' || r.key === 'XX' ? 1.2 : r.landing ? (r.key[0] === 'A' ? 8.5 : 7.5) : r.key === 'Call' ? 4.5 : r.key[0] === 'C' && r.key.length === 2 ? 3.6 : 2.8
    dwell(at(r.holdEnd), read, r.key)
  }
  const finTop = fin.getBoundingClientRect().top + scrollY
  move(finTop, 3); dwell(finTop + 1, 6, 'contact')
  return segs
}

function yAt(segs: Seg[], t: number) {
  let acc = 0
  for (const s of segs) {
    if (t <= acc + s.dur) { const u = s.dur > 0 ? (t - acc) / s.dur : 1; return s.y0 + (s.y1 - s.y0) * (s.kind === 'move' ? ease(u) : u) }
    acc += s.dur
  }
  return segs.length ? segs[segs.length - 1].y1 : 0
}
/** the movie time that shows the current scroll position (so switching modes never jumps) */
function timeAt(segs: Seg[], y: number) {
  let acc = 0, best = 0, bd = Infinity
  for (const s of segs) {
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, yy = s.y0 + (s.y1 - s.y0) * (s.kind === 'move' ? ease(u) : u), d = Math.abs(yy - y)
      if (d < bd) { bd = d; best = acc + u * s.dur }
    }
    acc += s.dur
  }
  return best
}
const total = (segs: Seg[]) => segs.reduce((a, s) => a + s.dur, 0)
const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

export function MovieMode({ onMode }: { onMode?: (m: Mode) => void }) {
  const [mode, setModeRaw] = useState<Mode>('idle')
  const [playing, setPlaying] = useState(false)
  const [, force] = useState(0)
  const [atTop, setAtTop] = useState(true)
  const segs = useRef<Seg[] | null>(null)
  const t = useRef(0), T = useRef(1)
  const bar = useRef<HTMLDivElement>(null), clock = useRef<HTMLSpanElement>(null)
  const playingRef = useRef(false), modeRef = useRef<Mode>('idle')

  const setMode = (m: Mode) => { modeRef.current = m; setModeRaw(m); onMode?.(m); document.documentElement.dataset.storyMode = m }
  const setPlay = (p: boolean) => { playingRef.current = p; setPlaying(p) }

  const ensure = () => { const s = buildTimeline(); if (s) { segs.current = s; T.current = total(s) } return !!s }
  const play = (fromStart = false) => {
    if (!ensure()) return
    t.current = fromStart ? 0 : timeAt(segs.current!, scrollY)
    if (t.current >= T.current - .05) t.current = 0
    setMode('movie'); setPlay(true)
  }
  const explore = () => { setPlay(false); setMode('explore') }

  // the playback loop: writes the scroll position (the shared timeline)
  useEffect(() => {
    let raf = 0, last = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(.25, (now - last) / 1000); last = now
      ;(window as any).__movie = { t: t.current, T: T.current, mode: modeRef.current, playing: playingRef.current }
      if (modeRef.current !== 'movie' || !segs.current) return
      if (playingRef.current) {
        t.current = Math.min(T.current, t.current + dt)
        if (t.current >= T.current) setPlay(false)
      }
      const y = yAt(segs.current, t.current)
      if (Math.abs(scrollY - y) > .5) window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
      if (bar.current) bar.current.style.width = `${(t.current / T.current) * 100}%`
      if (clock.current) clock.current.textContent = `${fmt(t.current)} / ${fmt(T.current)}`
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // while the movie is on, the visitor's scroll input does not move the timeline
  useEffect(() => {
    if (mode !== 'movie') return
    const block = (e: Event) => { e.preventDefault() }
    const keys = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.('input, textarea')) return
      if (e.key === ' ') { e.preventDefault(); setPlay(!playingRef.current); return }
      if (e.key === 'Escape') { explore(); return }
      if (['PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) e.preventDefault()
    }
    addEventListener('wheel', block, { passive: false }); addEventListener('touchmove', block, { passive: false }); addEventListener('keydown', keys)
    // following a menu link or opening a page ends the movie where it is
    const hash = () => explore()
    addEventListener('hashchange', hash)
    return () => { removeEventListener('wheel', block); removeEventListener('touchmove', block); removeEventListener('keydown', keys); removeEventListener('hashchange', hash) }
  }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // the PLAY / EXPLORE choice sits on the opening screen
  useEffect(() => {
    const on = () => setAtTop(scrollY < innerHeight * .35)
    on(); addEventListener('scroll', on, { passive: true }); return () => removeEventListener('scroll', on)
  }, [])
  useEffect(() => { const r = () => { if (modeRef.current === 'movie') { const p = t.current / T.current; ensure(); t.current = p * T.current; force((x) => x + 1) } }; addEventListener('resize', r); return () => removeEventListener('resize', r) }, [])
  useEffect(() => () => { delete document.documentElement.dataset.storyMode }, [])

  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!segs.current) return
    const r = e.currentTarget.getBoundingClientRect(); t.current = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * T.current
  }
  const seekKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') { t.current = Math.min(T.current, t.current + 5); e.preventDefault() }
    if (e.key === 'ArrowLeft') { t.current = Math.max(0, t.current - 5); e.preventDefault() }
  }

  const btn = 'pointer-events-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 border border-white/40 bg-black/55 px-4 text-[11px] font-semibold tracking-[0.2em] text-white backdrop-blur-sm transition hover:border-[#e8202f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

  return (
    <>
    {/* back to the movie from wherever you are */}
    {mode !== 'movie' && !atTop && (
      <button type="button" className={`${btn} fixed right-4 top-[72px] z-[45] min-h-[40px] px-3 text-[10px] sm:right-10 sm:top-[84px]`} onClick={() => play(false)} aria-label="Play the movie from here">
        <span aria-hidden>▶</span> PLAY FROM HERE
      </button>
    )}
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] pb-[max(12px,env(safe-area-inset-bottom))]">
      {/* opening choice */}
      {mode !== 'movie' && atTop && (
        <div className="mx-auto mb-[72px] flex w-fit flex-wrap justify-center gap-3 px-4 sm:mb-20" role="group" aria-label="How do you want to watch?">
          <button type="button" className={`${btn} border-[#e8202f] bg-[#e8202f]/20 px-6 text-[12px]`} onClick={() => play(false)}>
            <span aria-hidden>▶</span> PLAY THE MOVIE
          </button>
          <button type="button" className={`${btn} px-6 text-[12px]`} onClick={() => { explore(); window.scrollTo({ top: innerHeight * .9, behavior: reduced() ? 'auto' : 'smooth' }) }}>
            EXPLORE BY SCROLLING <span aria-hidden>↓</span>
          </button>
        </div>
      )}
      {/* movie controls */}
      {mode === 'movie' && (
        <div className="mx-auto flex w-[min(760px,calc(100%-24px))] items-center gap-2 border border-white/15 bg-black/70 p-2 backdrop-blur-md sm:gap-3" role="group" aria-label="Movie controls">
          <button type="button" className={btn} onClick={() => setPlay(!playing)} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <span aria-hidden className="text-[14px]">❚❚</span> : <span aria-hidden className="text-[14px]">▶</span>}
          </button>
          <button type="button" className={btn} onClick={() => { t.current = 0; setPlay(true) }} aria-label="Replay from the beginning"><span aria-hidden className="text-[16px]">↺</span></button>
          <div className="pointer-events-auto relative h-[44px] flex-1 cursor-pointer" role="slider" tabIndex={0} aria-label="Movie progress" aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={Math.round(t.current / T.current * 100)} onPointerDown={seek} onKeyDown={seekKey}>
            <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-white/20" />
            <div ref={bar} className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-gradient-to-r from-[#e8202f] to-[#2f6bff]" style={{ width: 0 }} />
          </div>
          <span ref={clock} className="hidden w-[84px] text-right font-mono text-[10px] tracking-[0.1em] text-white/70 sm:inline" aria-hidden />
          <button type="button" className={btn} onClick={explore} aria-label="Exit movie mode and explore by scrolling">
            <span className="hidden sm:inline">EXPLORE</span><span aria-hidden className="text-[14px]">✕</span>
          </button>
        </div>
      )}
    </div>
    </>
  )
}
