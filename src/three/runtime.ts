import { useSyncExternalStore } from 'react'
import { anchorsFrom, buildCity, buildTrack, type Hold, type SpecialId } from './world'

/* One shared world, built once. */
export const isLowDetail =
  typeof window !== 'undefined' && (window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4)
export const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const city = buildCity(isLowDetail)
export const buildings = city.buildings
export const track = buildTrack(anchorsFrom(buildings))
export const holdById = (id: SpecialId) => track.holds.find((h) => h.id === id)!

/* ---------------- Scroll map: scroll distance → position on the hero's path ----------------
 * The path is a list of "segments": MOVE (hero swings) and HOLD (hero stands on a rooftop
 * while content is shown). Holds get extra scroll distance so the camera "slows down".   */
type Seg =
  | { kind: 'move'; i0: number; i1: number; len: number; from: Hold; to: Hold }
  | { kind: 'hold'; hold: Hold; len: number }

const SCREENS_PER_SECOND = 0.42
const segs: Seg[] = []
track.holds.forEach((h, n) => {
  segs.push({ kind: 'hold', hold: h, len: h.id === 'hero' ? 0.9 : h.id === 'contact' ? 1.8 : 1.6 })
  const next = track.holds[n + 1]
  if (next) {
    const secs = (next.i0 - h.i1) / 60
    segs.push({ kind: 'move', i0: h.i1, i1: next.i0, len: secs * SCREENS_PER_SECOND, from: h, to: next })
  }
})
export const totalScreens = segs.reduce((a, s) => a + s.len, 0)

export type Chapter = 'intro' | 'home' | 'about' | 'projects' | 'cases' | 'education' | 'contact'

export type MapResult = {
  index: number           // float sample index
  holdId: SpecialId | null
  holdW: number           // 0..1 how strongly the camera should frame that hold
  holdK: number           // 0..1 progress inside the hold (used by contact pull-back)
  chapter: Chapter
  moveK: number           // 0..1 progress inside the current move segment
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function mapScroll(progress: number): MapResult {
  let u = Math.min(Math.max(progress, 0), 0.99999) * totalScreens
  for (const s of segs) {
    if (u <= s.len) {
      const k = u / s.len
      if (s.kind === 'hold') {
        const h = s.hold
        const index = h.id === 'hero' ? h.i1 : h.i0 + (h.i1 - h.i0) * Math.min(1, k / 0.35)
        const chapter: Chapter = h.id === 'hero' ? 'home' : h.id === 'contact' ? 'contact' : 'projects'
        return { index, holdId: h.id, holdW: 1, holdK: k, chapter, moveK: 0 }
      }
      const index = s.i0 + (s.i1 - s.i0) * k
      let holdId: SpecialId | null = null
      let holdW = 0
      if (k < 0.18) { holdId = s.from.id; holdW = 1 - smooth(0, 0.18, k) }
      else if (k > 0.78) { holdId = s.to.id; holdW = smooth(0.78, 1, k) }
      let chapter: Chapter = 'projects'
      if (s.from.id === 'hero') chapter = k < 0.85 ? 'about' : 'projects'
      if (s.from.id === 'project-commerce') chapter = k < 0.8 ? 'cases' : 'education'
      return { index, holdId, holdW, holdK: 0, chapter, moveK: k }
    }
    u -= s.len
  }
  const last = track.holds[track.holds.length - 1]
  return { index: last.i1, holdId: last.id, holdW: 1, holdK: 1, chapter: 'contact', moveK: 0 }
}

/** Scroll progress (0..1) where each chapter begins — used by the navigation. */
export function chapterProgress(chapter: 'home' | 'about' | 'projects' | 'cases' | 'contact') {
  let u = 0
  for (const s of segs) {
    if (chapter === 'home' && s.kind === 'hold' && s.hold.id === 'hero') return 0
    if (chapter === 'about' && s.kind === 'move' && s.from.id === 'hero') return (u + s.len * 0.25) / totalScreens
    if (chapter === 'projects' && s.kind === 'hold' && s.hold.id === 'project-portal') return (u + s.len * 0.4) / totalScreens
    if (chapter === 'cases' && s.kind === 'move' && s.from.id === 'project-commerce') return (u + s.len * 0.12) / totalScreens
    if (chapter === 'contact' && s.kind === 'hold' && s.hold.id === 'contact') return (u + s.len * 0.6) / totalScreens
    u += s.len
  }
  return 0
}

/* ---------------- Mutable per-frame state (read inside useFrame, no re-renders) ---------------- */
export const rt = {
  mode: (prefersReducedMotion ? 'scroll' : 'intro') as 'intro' | 'scroll',
  introTime: 0,
  scroll: 0,            // smoothed scroll progress 0..1
  map: mapScroll(0),
  index: 0,             // float sample index currently shown
  introCam: prefersReducedMotion ? 0 : 1,   // 1 = scripted intro camera, 0 = follow camera
}

/* ---------------- Tiny UI store (React re-renders only on change) ---------------- */
type UI = { chapter: Chapter; holdId: SpecialId | null; introDone: boolean; nameVisible: boolean }
let ui: UI = { chapter: 'intro', holdId: null, introDone: prefersReducedMotion, nameVisible: prefersReducedMotion }
const listeners = new Set<() => void>()
export function setUI(patch: Partial<UI>) {
  let changed = false
  for (const k in patch) if ((ui as any)[k] !== (patch as any)[k]) changed = true
  if (!changed) return
  ui = { ...ui, ...patch }
  listeners.forEach((l) => l())
}
export function useUI() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => ui,
  )
}

// handy for debugging in the browser console: window.__poc
if (typeof window !== 'undefined') (window as any).__poc = { rt, track, totalScreens, chapterProgress, ui: () => ui }
