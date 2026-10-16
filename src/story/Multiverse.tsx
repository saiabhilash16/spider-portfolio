import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { caseStudies, projects } from '../data/content'
import { SKILL_UNIVERSE } from '../data/skills'
import { asset } from '../site/shared'
import { PROJECT_ART } from '../site/Art'
import { Phone } from '../cases/common/Phone'
import { AppScreen, staticState } from '../cases/butterfly/Screens'
import { CONCEPT_SCREENS } from '../cases/concepts/screens'
import { STORY_ASSETS } from './scenes'
import { CHARACTER, type ClipMap } from './character.config'
import LANDROOT from './land_root.json'
import { cloneCharacter } from './characterAsset'

gsap.registerPlugin(ScrollTrigger)

/* =====================================================================================
 *  SCENES 5–8 — ONE CONTINUOUS THREE.JS JOURNEY (scroll-driven, reversible)
 *   5 · FALL     — purple/magenta space, orange dimensional portals, city fragments, particles
 *   6 · WORLD A  — SOFTWARE PROJECTS: futuristic New York, holographic screens (2 projects)
 *   7 · WORLD B  — UX CASE STUDIES: colourful interface universe (6 concept case studies)
 *   8 · WORLD C  — SKILLS & TECHNOLOGIES: holographic constellations (from content.ts)
 *   → exit portal opens onto New York at night → the final scene (LET'S SAVE THE WORLD.)
 *  Gateways (orange portals) separate the worlds. Spider-Man's own movement (fall / swing) needs
 *  frame sequences; until they exist the camera travels alone. No stand-in figure is drawn.
 * ===================================================================================== */

const reduced = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const mobile = () => typeof window !== 'undefined' && innerWidth < 768
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const M = mobile()
export const FALL_END = 0.15
const SCREENS = 26
const FALL_FROM = 14, FALL_TO = -128
const DIM_PORTALS = [-22, -52, -82, -112]
const DIM_COLORS: [string, string][] = [['#6d28d9', '#ff2fb3'], ['#1d4ed8', '#22d3ee'], ['#9d174d', '#fb923c'], ['#4c1d95', '#a78bfa']]

/* ------------------------------- content of the three worlds ------------------------------- */
export type WorldKey = 'A' | 'B' | 'C'
export const WORLD_META: Record<WorldKey, { name: string; sub: string; z: number; label: string; nebula: [string, string]; marker: string }> = {
  A: { name: 'SOFTWARE PROJECTS', sub: '2 engineering projects · futuristic New York', z: -146, label: 'WORLD A', nebula: ['#04102a', '#1e6bff'], marker: 'projects' },
  B: { name: 'UX CASE STUDIES', sub: '6 concept case studies · an interface universe', z: -252, label: 'WORLD B', nebula: ['#3b0764', '#ff4fa3'], marker: 'cases' },
  C: { name: 'SKILLS & TECHNOLOGIES', sub: 'From my resume · no ratings, just the tools I use', z: -446, label: 'WORLD C', nebula: ['#021a1f', '#14b8a6'], marker: 'skills' },
}
const EXIT_Z = -545
const PROJ = projects.map((p, i) => ({ ...p, pos: V(i ? 3.4 : -3.4, i ? .3 : .6, -174 - i * 32) }))
const CASES = caseStudies.map((c, i) => ({ ...c, n: String(i + 1).padStart(2, '0'), pos: V(i % 2 ? 3.3 : -3.3, Math.sin(i * 1.3) * .9, -284 - i * 25) }))
const HUB = V(0, 0, -505)
const CONST = SKILL_UNIVERSE.map((c, i) => { const a = Math.PI / 2 - i * (Math.PI * 2 / SKILL_UNIVERSE.length); return { ...c, center: V(Math.cos(a) * 8.6, Math.sin(a) * 5.6, HUB.z) } })

/* ------------------------------- camera shots ------------------------------- */
type Focus = { w: WorldKey | 'X' | null; i: number; card?: boolean; travel?: boolean }
type Shot = { pos: THREE.Vector3; look: THREE.Vector3; move: number; hold: number; focus: Focus; nebula: [string, string]; key: string }
const SHOTS: Shot[] = (() => {
  const s: Shot[] = [{ pos: V(0, 0, FALL_TO), look: V(0, 0, FALL_TO - 12), move: 0, hold: 0, focus: { w: null, i: -1 }, nebula: DIM_COLORS[3], key: 'fall' }]
  const title = (k: WorldKey) => s.push({ pos: V(0, 0, WORLD_META[k].z + 10), look: V(0, .4, WORLD_META[k].z - 30), move: .8, hold: 1, focus: { w: k, i: -1, card: true }, nebula: s[s.length - 1].nebula, key: k })
  title('A')
  PROJ.forEach((p, i) => s.push({ pos: p.pos.clone().add(V((i ? -1 : 1) * (M ? 3.6 : 2.4), -1.4, M ? 13.5 : 9.4)), look: p.pos.clone().add(V((i ? -1 : 1) * (M ? 1.7 : 0), -1.9, 0)), move: 1, hold: 1.3, focus: { w: 'A', i }, nebula: WORLD_META.A.nebula, key: `A${i}` }))
  title('B')
  CASES.forEach((c, i) => s.push({ pos: c.pos.clone().add(V((i % 2 ? -1 : 1) * (M ? 3 : 2), -1.2, M ? 12 : 8.6)), look: c.pos.clone().add(V((i % 2 ? -1 : 1) * (M ? 1.5 : 0), -1.7, 0)), move: .9, hold: 1.1, focus: { w: 'B', i }, nebula: WORLD_META.B.nebula, key: `B${i}` }))
  title('C')
  s.push({ pos: V(0, 0, -476), look: HUB, move: 1, hold: 1, focus: { w: 'C', i: -1 }, nebula: WORLD_META.C.nebula, key: 'C' + 'all' })
  CONST.forEach((c, i) => s.push({ pos: V(0, 0, -476).lerp(c.center, .32), look: c.center, move: .6, hold: .9, focus: { w: 'C', i }, nebula: WORLD_META.C.nebula, key: `C${i}` }))
  s.push({ pos: V(0, 0, EXIT_Z + 13), look: V(0, 0, EXIT_Z - 10), move: 1, hold: .7, focus: { w: 'X', i: -1 }, nebula: ['#0b1020', '#e8202f'], key: 'X' })
  s.push({ pos: V(0, 0, EXIT_Z + 1.2), look: V(0, 0, EXIT_Z - 10), move: 1, hold: .25, focus: { w: 'X', i: -1 }, nebula: ['#0b1020', '#e8202f'], key: 'XX' })
  return s
})()
const W_TOTAL = SHOTS.reduce((a, s) => a + s.move + s.hold, 0)
const ease = (f: number) => f * f * (3 - 2 * f)
/** scroll progress where a shot's hold begins (+ a little, so the focus is settled) */
export function shotProgress(key: string) {
  let acc = 0
  for (const s of SHOTS) { if (s.key === key) return FALL_END + (acc + s.move + s.hold * .62) / W_TOTAL * (1 - FALL_END); acc += s.move + s.hold }
  return FALL_END
}
/** every shot in order, with the scroll progress where its hold starts and ends (used by Movie Mode) */
export const SHOT_RANGES: { key: string; holdStart: number; holdEnd: number; landing: boolean }[] = (() => {
  let acc = 0; const out: { key: string; holdStart: number; holdEnd: number; landing: boolean }[] = []
  const P = (x: number) => FALL_END + x / W_TOTAL * (1 - FALL_END)
  for (const s of SHOTS) { if (s.key !== 'fall') out.push({ key: s.key, holdStart: P(acc + s.move), holdEnd: P(acc + s.move + s.hold * .95), landing: /^[AB]\d$/.test(s.key) }); acc += s.move + s.hold }
  return out
})()
/** scroll progress part-way (0..1) through the travel INTO a shot — used by the tests */
export function moveProgress(key: string, m: number) {
  let acc = 0
  for (const s of SHOTS) { if (s.key === key) return FALL_END + (acc + s.move * m) / W_TOTAL * (1 - FALL_END); acc += s.move + s.hold }
  return FALL_END
}
const worldStartProgress = (k: WorldKey) => { let acc = 0; for (const s of SHOTS) { if (s.key === k) return FALL_END + acc / W_TOTAL * (1 - FALL_END); acc += s.move + s.hold } return 0 }

/** camera position, look target, roll, focus and nebula colours for a scroll progress p */
function rig(p: number) {
  const pos = new THREE.Vector3(), look = new THREE.Vector3()
  let roll = 0, focus: Focus = { w: null, i: -1 }, dim = 0, nebula: [string, string] = DIM_COLORS[0], K = 0, MV = 0, HD = 0
  if (p < FALL_END) {
    const f = p / FALL_END
    const z = THREE.MathUtils.lerp(FALL_FROM, FALL_TO, f * f * (3 - 2 * f) * .35 + f * .65)
    pos.set(Math.sin(f * 7) * 1.6 * (1 - f), Math.cos(f * 5) * 1.1 * (1 - f), z)
    look.set(Math.sin(f * 7 + .6) * 1.2 * (1 - f), Math.cos(f * 5 + .6) * .8 * (1 - f), z - 12)
    roll = reduced ? 0 : (Math.sin(f * Math.PI) * 2.6 + f * Math.PI * 2 * (1 - f)) * (1 - f)    // tumbling, then levelling out
    dim = DIM_PORTALS.filter((dz) => z < dz).length
    nebula = DIM_COLORS[Math.min(dim, 3)]
  } else {
    let t = (p - FALL_END) / (1 - FALL_END) * W_TOTAL
    let k = 1
    for (; k < SHOTS.length; k++) { const s = SHOTS[k]; if (t < s.move + s.hold || k === SHOTS.length - 1) break; t -= s.move + s.hold }
    const a = SHOTS[k - 1], b = SHOTS[k]
    const m = b.move > 0 ? Math.min(1, t / b.move) : 1, e = ease(m)
    pos.lerpVectors(a.pos, b.pos, e); look.lerpVectors(a.look, b.look, e)
    K = k; MV = m; HD = m >= 1 ? (t - b.move) / Math.max(b.hold, .001) : 0
    if (m >= 1) { const h = (t - b.move) / Math.max(b.hold, .001); pos.x += Math.sin(h * Math.PI) * .25; pos.y += Math.sin(h * Math.PI * .5) * .08 }  // gentle drift while holding
    focus = m > .35 ? b.focus : a.focus
    nebula = e > .5 ? b.nebula : a.nebula
    dim = 4
  }
  return { pos, look, roll, focus, dim, nebula, k: K, m: MV, hold: HD }
}

/* =====================================================================================
 *  SWING PATH — where Spider-Man goes (Phase 2A). Pure geometry, shared by every character.
 *  For every camera shot k there is a LEG: one or more pendulum SWINGS (constant web length,
 *  real circular arcs around an anchor) that end at a PERCH, where he hangs from a web while
 *  the visitor reads that project / case study / skill category.
 *   · World A anchors snap to real skyscraper facades (and the holographic display frames)
 *   · World B anchors are floating interface islands / the case-study portal rings
 *   · World C anchors are constellation nodes
 * ===================================================================================== */
const UP = V(0, 1, 0)
type Building = { c: THREE.Vector3; w: number; h: number; d: number }
const BUILDINGS: Building[] = (() => {
  const list: Building[] = []
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  for (const side of [-1, 1]) for (let k = 0; k < 20; k++) {
    const w = 2.5 + rnd() * 3, d = 2.5 + rnd() * 3, hgt = 10 + rnd() * 34
    list.push({ c: V(side * (7.5 + rnd() * 13), -14 + hgt / 2, -150 - k * 4.6 - rnd() * 2), w, h: hgt, d })
  }
  return list
})()
const BUILDING_MATRICES = BUILDINGS.map((b) => new THREE.Matrix4().compose(b.c, new THREE.Quaternion(), V(b.w, b.h, b.d)))

export type AnchorKind = 'building' | 'display' | 'ring' | 'island' | 'node' | 'float'
type Hop = { from: THREE.Vector3; to: THREE.Vector3; anchor: THREE.Vector3; kind: AnchorKind }
type Leg = { hops: Hop[]; perch: THREE.Vector3; perchAnchor: THREE.Vector3; perchKind: AnchorKind; face: THREE.Vector3; dir: THREE.Vector3 }

const worldOf = (z: number): 'A' | 'B' | 'C' | '' => (z < -436 ? 'C' : z < -240 ? 'B' : z < -140 ? 'A' : '')
/** anchor for a swing from P to Q: on the perpendicular bisector (so the web length is constant), lifted above the chord */
function anchorFor(P: THREE.Vector3, Q: THREE.Vector3, side: number): { a: THREE.Vector3; kind: AnchorKind } {
  const mid = P.clone().add(Q).multiplyScalar(.5), L = P.distanceTo(Q)
  const dir = Q.clone().sub(P).normalize()
  const upP = UP.clone().sub(dir.clone().multiplyScalar(UP.dot(dir))).normalize()
  const lat = dir.clone().cross(upP).normalize()
  let h = .55 * L + 2.5
  const a = mid.clone().addScaledVector(upP, h)
  if (worldOf(mid.z) === 'A') {
    // snap to the inner facade of the nearest skyscraper on this side
    const cands = BUILDINGS.filter((b) => Math.sign(b.c.x) === side && Math.abs(b.c.z - mid.z) < b.d / 2 + 2.5)
    const b = cands.sort((x, y) => Math.abs(x.c.x) - Math.abs(y.c.x))[0]
    if (b && Math.abs(lat.x) > .3) {
      const faceX = b.c.x - side * b.w / 2
      const top = b.c.y + b.h / 2 - .6
      if (a.y > top) { h = Math.max(.3 * L, h - (a.y - top)); a.copy(mid).addScaledVector(upP, h) }
      a.addScaledVector(lat, (faceX - a.x) / lat.x)
      return { a, kind: 'building' }
    }
  }
  a.addScaledVector(lat, side * 2.2)
  return { a, kind: worldOf(mid.z) === 'C' ? 'node' : 'float' }
}

/** where he stands while an item is on screen: a free area of the held shot (right of the display, above the panel) */
function standSpot(s: Shot) {
  const asp = typeof window !== 'undefined' ? innerWidth / innerHeight : 1.6
  const fov = (M ? 72 : 58) * Math.PI / 180, t = Math.tan(fov / 2), D = M ? 8.5 : 7.4
  const nx = M ? .45 : .55, ny = M ? .58 : -.02
  const f = s.look.clone().sub(s.pos).normalize(), r = f.clone().cross(UP).normalize(), u = r.clone().cross(f)
  return s.pos.clone().addScaledVector(f, D).addScaledVector(r, nx * D * t * asp).addScaledVector(u, ny * D * t)
}
const PERCHES: { key: string; q: THREE.Vector3; a: THREE.Vector3; kind: AnchorKind; face: THREE.Vector3 }[] = SHOTS.slice(1).map((s) => {
  const gate = (k: WorldKey) => ({ q: V(0, .6, WORLD_META[k].z + 2.8), a: V(0, 4.7, WORLD_META[k].z), kind: 'ring' as AnchorKind, face: V(0, 0, WORLD_META[k].z - 10) })
  if (s.key === 'A' || s.key === 'B' || s.key === 'C') return { key: s.key, ...gate(s.key as WorldKey) }
  if (s.key[0] === 'A') {
    const i = +s.key[1], p = PROJ[i]
    return { key: s.key, q: standSpot(s), a: p.pos.clone().add(V(3.9, 2.45, 0)), kind: 'display', face: p.pos.clone() }
  }
  if (s.key[0] === 'B') {
    const i = +s.key[1], c = CASES[i]
    return { key: s.key, q: standSpot(s), a: c.pos.clone().add(V(2.31, 2.76, -.6)), kind: 'ring', face: c.pos.clone() }
  }
  if (s.key === 'Call') return { key: s.key, q: V(M ? 1.2 : 2.2, M ? -.3 : -1.3, -482.5), a: V(0, 4.4, HUB.z), kind: 'ring', face: HUB.clone() }
  if (s.key[0] === 'C') {
    const c = CONST[+s.key[1]], cam = s.pos
    const toCam = cam.clone().sub(c.center).normalize()
    return { key: s.key, q: c.center.clone().addScaledVector(toCam, M ? 6.8 : 5.6).add(V(M ? 1.2 : 2.2, M ? 1.6 : .9, 0)), a: c.center.clone(), kind: 'node', face: c.center.clone() }
  }
  if (s.key === 'X') return { key: s.key, q: V(0, .8, EXIT_Z + 3.2), a: V(0, 5.3, EXIT_Z), kind: 'ring', face: V(0, 0, EXIT_Z - 10) }
  return { key: s.key, q: V(0, .3, EXIT_Z - 4), a: V(0, 5.3, EXIT_Z), kind: 'ring', face: V(0, 0, EXIT_Z - 20) }   // XX: through the portal
})
/* ---------- LANDING (approved Blender landing, root motion from land_root.json) ----------
 * At every project and case study he releases the web, flies, touches down on a floating city
 * fragment beside the display, absorbs into a crouch, rises and turns to look at the item.
 * Blender axes → three: (x, y, z) → (x, z, −y). His front is −Z in three (+Y in Blender). */
type LFrame = { p: number[]; q: number[]; hips: number[] }
const LR = LANDROOT as unknown as { fps: number; frames: LFrame[]; ev: { rel: number; td: number; look: number; up: number; roof: number; end: number } }
const B2T = (a: number[]) => V(a[0], a[2], -a[1])
const B2Tq = (q: number[]) => new THREE.Quaternion(q[1], q[3], -q[2], q[0]).normalize()
const L_END = LR.frames.length - 1
const L_HIPS_END = B2T(LR.frames[L_END].hips)
const L_FEET = LR.frames[L_END].hips[2] - LR.ev.roof              // hips height above the surface when standing
const LAND_FROM = .7                                                // share of a leg's travel spent swinging; the rest is release + flight
export const isLandingKey = (key: string) => /^[AB]\d$/.test(key)
function landSample(t: number, out: { hips: THREE.Vector3; q: THREE.Quaternion }) {
  const f = THREE.MathUtils.clamp(t * LR.fps, 0, L_END), i = Math.min(L_END - 1, Math.floor(f)), k = f - i
  out.hips.copy(B2T(LR.frames[i].hips)).lerp(B2T(LR.frames[i + 1].hips), k)
  out.q.copy(B2Tq(LR.frames[i].q)).slerp(B2Tq(LR.frames[i + 1].q), k)
  return out
}
type Landing = { stand: THREE.Vector3; heading: THREE.Quaternion; release: THREE.Vector3; face: THREE.Vector3; feetY: number; td: THREE.Vector3 }
function makeLanding(stand: THREE.Vector3, from: THREE.Vector3, face: THREE.Vector3): Landing {
  const d = stand.clone().sub(from).setY(0); if (d.lengthSq() < 1e-6) d.set(0, 0, -1); d.normalize()
  const heading = new THREE.Quaternion().setFromUnitVectors(V(0, 0, -1), d)
  const rel = B2T(LR.frames[Math.round(LR.ev.rel * LR.fps)].hips).sub(L_HIPS_END).applyQuaternion(heading).add(stand)
  const td = B2T(LR.frames[Math.round(LR.ev.td * LR.fps)].hips).sub(L_HIPS_END).applyQuaternion(heading).add(stand)
  return { stand, heading, release: rel, face, feetY: stand.y - L_FEET, td }
}
/** where the character is when the fall ends (in front of the camera) */
const FALL_END_CHAR = V(0, -1.1, FALL_TO - 6.5)
const LANDINGS: (Landing | null)[] = PERCHES.map((pc, idx) => isLandingKey(pc.key) ? makeLanding(pc.q, idx === 0 ? FALL_END_CHAR : PERCHES[idx - 1].q, pc.face) : null)
const LEGS: Leg[] = PERCHES.map((pc, idx) => {
  const start = idx === 0 ? FALL_END_CHAR : PERCHES[idx - 1].q
  const end = LANDINGS[idx]?.release ?? pc.q
  const dist = start.distanceTo(end)
  const n = Math.max(1, Math.ceil(dist / 15))
  const pts: THREE.Vector3[] = [start]
  for (let j = 1; j < n; j++) pts.push(start.clone().lerp(end, j / n).add(V((j % 2 ? 1 : -1) * 1.4, 1.2 * Math.sin(j * 1.7), 0)))
  pts.push(end)
  const hops: Hop[] = []
  for (let j = 0; j < n; j++) { const { a, kind } = anchorFor(pts[j], pts[j + 1], (idx + j) % 2 ? 1 : -1); hops.push({ from: pts[j], to: pts[j + 1], anchor: a, kind }) }
  // the last swing of a leg uses the destination itself when it is close enough (display frame / ring / node)
  const dir = end.clone().sub(start).setY(0)
  if (dir.lengthSq() < 1e-4) dir.set(0, 0, -1)
  return { hops, perch: end, perchAnchor: pc.a, perchKind: pc.kind, face: pc.face, dir: dir.normalize() }
})
/** every anchor point (for drawing web-hit markers and floating anchor objects) */
const ANCHORS: { p: THREE.Vector3; kind: AnchorKind }[] = [...LEGS.flatMap((l) => l.hops.map((h) => ({ p: h.anchor, kind: h.kind }))), ...LEGS.map((l) => ({ p: l.perchAnchor, kind: l.perchKind }))]

const swingEase = (t: number) => (1 - Math.cos(Math.PI * t)) / 2   // pendulum: slow at the ends, fastest at the bottom
const _q = new THREE.Quaternion(), _u0 = new THREE.Vector3(), _u1 = new THREE.Vector3()
function arcPoint(h: Hop, t: number, out: THREE.Vector3) {
  _u0.copy(h.from).sub(h.anchor); _u1.copy(h.to).sub(h.anchor)
  const r0 = _u0.length(), r1 = _u1.length()
  _q.setFromUnitVectors(_u0.clone().normalize(), _u1.clone().normalize())
  const q = new THREE.Quaternion().slerp(_q, t)
  return out.copy(_u0).normalize().applyQuaternion(q).multiplyScalar(THREE.MathUtils.lerp(r0, r1, t)).add(h.anchor)
}
export type CharState = { pos: THREE.Vector3; anchor: THREE.Vector3 | null; web: number; mode: 'fall' | 'swing' | 'perch' | 'land'; clipT: number; up: THREE.Vector3; fwd: THREE.Vector3; legDir: THREE.Vector3; leg: number; rot?: THREE.Quaternion; takeoff?: number }
/** the character's state for a rig result */
function charAt(r: ReturnType<typeof rig>, fallF: number, camPos: THREE.Vector3, camFwd: THREE.Vector3, t: number): CharState {
  if (r.k === 0) {
    const pos = camPos.clone().addScaledVector(camFwd, 6.5).add(V(0, -1.1, 0))
    return { pos, anchor: null, web: 0, mode: 'fall', clipT: fallF, up: V(Math.sin(t * .6), Math.cos(t * .6), 0), fwd: V(0, 1, 0), legDir: V(0, 0, -1), leg: -1 }
  }
  const leg = LEGS[r.k - 1]
  const L = LANDINGS[r.k - 1]
  const prevLanded = r.k >= 2 && !!LANDINGS[r.k - 2]
  if (L && r.m >= LAND_FROM || L && r.m >= 1) {
    // release → flight → touchdown (travel), then crouch → rise → look (hold)
    const lt = r.m < 1 ? THREE.MathUtils.lerp(LR.ev.rel, LR.ev.td, (r.m - LAND_FROM) / (1 - LAND_FROM)) : THREE.MathUtils.lerp(LR.ev.td, LR.ev.end, Math.min(1, r.hold / .6))
    const s = landSample(lt, { hips: new THREE.Vector3(), q: new THREE.Quaternion() })
    const pos = s.hips.sub(L_HIPS_END).applyQuaternion(L.heading).add(L.stand)
    // after touchdown, turn the whole body (pivoting on the feet) to face the item
    const want = L.face.clone().sub(L.stand).setY(0).normalize()
    const now = V(0, 0, -1).applyQuaternion(L.heading)
    const turn = new THREE.Quaternion().setFromUnitVectors(now, want)
    const tw = THREE.MathUtils.smoothstep(lt, LR.ev.look - .4, LR.ev.end - .3) * .75
    const rot = new THREE.Quaternion().slerp(turn, tw).multiply(L.heading).multiply(s.q)
    return { pos, anchor: null, web: 0, mode: 'land', clipT: lt, up: UP.clone(), fwd: want, legDir: leg.dir, leg: r.k - 1, rot }
  }
  const mm = L ? r.m / LAND_FROM : r.m
  if (mm < 1) {
    const n = leg.hops.length
    const hi = Math.min(n - 1, Math.floor(mm * n)), th = mm * n - hi
    const h = leg.hops[hi]
    const e = swingEase(th)
    const pos = arcPoint(h, e, new THREE.Vector3())
    const ahead = arcPoint(h, Math.min(1, e + .02), new THREE.Vector3())
    const fwd = ahead.sub(pos); if (fwd.lengthSq() < 1e-6) fwd.copy(leg.dir); fwd.normalize()
    return { pos, anchor: h.anchor, web: THREE.MathUtils.smoothstep(th, 0, .1), mode: 'swing', clipT: th, up: h.anchor.clone().sub(pos).normalize(), fwd, legDir: leg.dir, leg: r.k - 1, takeoff: prevLanded && hi === 0 ? 1 - THREE.MathUtils.smoothstep(th, 0, .25) : 0 }
  }
  // perch: hanging from a web beside the item, gently swaying, facing it
  const sway = Math.sin(t * 1.1) * .12
  const pos = leg.perch.clone().add(V(sway, Math.sin(t * .9) * .05, 0))
  const fwd = leg.face.clone().sub(pos).setY(0).normalize()
  return { pos, anchor: leg.perchAnchor, web: 1, mode: 'perch', clipT: r.hold, up: leg.perchAnchor.clone().sub(pos).normalize(), fwd, legDir: leg.dir, leg: r.k - 1 }
}

/* ------------------------------- shaders ------------------------------- */
const NOISE = /* glsl */ `
float hash(vec3 p){ p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
  return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= .5; } return v; }
`
const nebulaMat = () => new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { uTime: { value: 0 }, uA: { value: new THREE.Color('#6d28d9') }, uB: { value: new THREE.Color('#ff2fb3') } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `${NOISE}
    uniform float uTime; uniform vec3 uA, uB; varying vec3 vDir;
    void main(){
      vec3 d = vDir;
      float n = fbm(d * 2.4 + vec3(0., 0., uTime * .03));
      float m = fbm(d * 5.5 - vec3(uTime * .02, 0., 0.) + n * 1.7);
      vec3 c = mix(vec3(.02, .0, .06), uA * .75, smoothstep(.25, .75, n));
      c = mix(c, uB, smoothstep(.55, .85, m) * .85);
      c += vec3(.25, .45, 1.) * pow(smoothstep(.6, .9, m * n * 1.6), 3.) * .8;     // electric-blue filaments
      float star = step(.997, fract(sin(dot(floor(d * 380.), vec3(12.9898, 78.233, 37.719))) * 43758.5453));
      c += star * .9;
      gl_FragColor = vec4(c, 1.);
    }`,
})
const discMat = (a: string, b: string, label: THREE.Texture | null) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide,
  uniforms: { uTime: { value: 0 }, uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) }, tLabel: { value: label }, uHasLabel: { value: label ? 1 : 0 }, uOpen: { value: 0 }, uNear: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `${NOISE}
    uniform float uTime, uHasLabel, uOpen, uNear; uniform vec3 uA, uB; uniform sampler2D tLabel; varying vec2 vUv;
    void main(){
      vec2 p = vUv - .5; float r = length(p) * 2., a = atan(p.y, p.x);
      float sw = fbm(vec3(cos(a) * 1.5 + r * 2.5, sin(a) * 1.5 - uTime * .35, r * 3. - uTime * .9));
      vec3 c = mix(uA * .35, uB, smoothstep(.3, .8, sw)) * (1.35 - r * .55);
      c += vec3(1., .55, .18) * smoothstep(.82, .98, r) * 1.4;                     // inner rim glow
      c *= .65 + .35 * uOpen;
      if (uHasLabel > .5){ vec4 l = texture2D(tLabel, vUv); c = mix(c, l.rgb, l.a * (.25 + .75 * uOpen)); }
      float alpha = smoothstep(1., .97, r) * (1. - uNear);
      gl_FragColor = vec4(c, alpha);
    }`,
})
const fragmentMat = (map: THREE.Texture, rect: THREE.Vector4) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map }, uRect: { value: rect } },
  vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform sampler2D map; uniform vec4 uRect; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main(){
      vec3 c = texture2D(map, uRect.xy + vUv * uRect.zw).rgb;
      float l = dot(c, vec3(.3, .59, .11));
      vec2 g = fract(gl_FragCoord.xy / 5.) - .5;                                    // comic halftone
      float dots = smoothstep(.36 * sqrt(l) + .05, .36 * sqrt(l) - .05, length(g));
      vec3 ink = mix(vec3(.08, .02, .16), vec3(.95, .75, 1.), dots);
      c = mix(c, ink, .45) * vec3(.85, .7, 1.2);
      float rim = pow(1. - max(dot(vN, vV), 0.), 2.5);
      c += mix(vec3(1., .5, .15), vec3(.7, .3, 1.), step(0., vN.y)) * rim * 1.4;
      gl_FragColor = vec4(c, 1.);
    }`,
})

type LabelSpec = { n: string; kind: string; title: string }
function labelTexture(w: LabelSpec) {
  const c = document.createElement('canvas'); c.width = c.height = 1024
  const g = c.getContext('2d')!
  g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.85)'
  g.font = '600 34px monospace'; g.fillText(`${w.n} · ${w.kind}`, 512, 360)
  g.fillStyle = '#fff'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 24
  const words = w.title.toUpperCase().split(' '); const lines: string[] = []; let cur = ''
  g.font = '120px Anton, Impact, sans-serif'
  for (const word of words) { const t = cur ? `${cur} ${word}` : word; if (g.measureText(t).width > 760 && cur) { lines.push(cur); cur = word } else cur = t }
  lines.push(cur)
  const size = lines.length > 2 ? 92 : 120
  g.font = `${size}px Anton, Impact, sans-serif`
  lines.forEach((l, i) => g.fillText(l, 512, 470 + i * size * 1.02 + (lines.length === 1 ? 40 : 0)))
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}

/* ------------------------------- world A · futuristic New York ------------------------------- */
const cityMat = () => new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: `varying vec3 vW; varying vec3 vN; varying vec2 vB;
    void main(){
      mat4 m = modelMatrix;
      #ifdef USE_INSTANCING
        m = modelMatrix * instanceMatrix;
      #endif
      vec4 w = m * vec4(position, 1.); vW = w.xyz; vN = normalize(mat3(m) * normal); vB = m[3].xz;
      gl_Position = projectionMatrix * viewMatrix * w;
    }`,
  fragmentShader: `uniform float uTime; varying vec3 vW; varying vec3 vN; varying vec2 vB;
    float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
    void main(){
      vec3 c = vec3(.02, .035, .07);
      if (abs(vN.y) < .5){
        float u = abs(vN.x) > .5 ? vW.z : vW.x;
        vec2 g = vec2(u * 2.2, vW.y * 1.5); vec2 cell = floor(g), f = fract(g);
        float win = step(.22, f.x) * step(f.x, .78) * step(.18, f.y) * step(f.y, .72);
        float r = h(cell + vB * 7.);
        vec3 wc = r > .93 ? vec3(1., .72, .4) : r > .55 ? vec3(.35, .8, 1.) : vec3(.0);
        c += win * wc * (.75 + .25 * sin(uTime * .7 + r * 30.)) * 1.3;
        c += vec3(.1, .45, 1.) * smoothstep(.0, -1.5, vW.y + 4.) * .08;
      } else c += vec3(.15, .6, 1.) * .35;                       // glowing rooftops
      float fog = smoothstep(10., 70., length(vW - cameraPosition));
      gl_FragColor = vec4(mix(c, vec3(.02, .05, .14), fog * .8), 1.);
    }`,
})
const gridMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#38bdf8') } },
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform float uTime; uniform vec3 uColor; varying vec3 vW;
    void main(){
      vec2 g = abs(fract(vW.xz / 2.) - .5);
      float l = 1. - smoothstep(0., .03, min(g.x, g.y));
      float pulse = .5 + .5 * sin(vW.z * .3 + uTime * 2.);
      float fade = 1. - smoothstep(8., 55., length(vW.xz - cameraPosition.xz));
      gl_FragColor = vec4(uColor * (1.2 + pulse), l * fade * .55);
    }`,
})
const holoMat = (color: string) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uOn: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `uniform float uTime, uOn; uniform vec3 uColor; varying vec2 vUv;
    void main(){
      vec2 e = min(vUv, 1. - vUv);
      float border = 1. - smoothstep(0., .012, min(e.x, e.y));
      float corner = step(min(e.x, e.y), .012) * step(max(e.x, e.y), .08);
      float scan = .5 + .5 * sin(vUv.y * 260. - uTime * 6.);
      float fill = .06 + .05 * scan;
      gl_FragColor = vec4(uColor * (border * 1.8 + corner * 2. + fill), (border * .9 + corner + fill) * uOn);
    }`,
})
function CityA() {
  const buildings = BUILDING_MATRICES
  const mat = useMemo(cityMat, [])
  const inst = useRef<THREE.InstancedMesh>(null)
  const grid = useMemo(gridMat, [])
  const panels = useMemo(() => [-3, -1, 1, 3, 5].map((k, i) => ({ pos: V(i % 2 ? 6 : -6, 3 + (i % 3) * 2.5, -160 - i * 14), rot: (i % 2 ? -1 : 1) * .5, mat: holoMat(i % 2 ? '#22d3ee' : '#60a5fa'), size: [2.6 + (k % 2), 1.6] as [number, number] })), [])
  useLayoutEffect(() => { buildings.forEach((m, i) => inst.current?.setMatrixAt(i, m)); if (inst.current) inst.current.instanceMatrix.needsUpdate = true }, [buildings])
  useFrame((s) => { mat.uniforms.uTime.value = s.clock.elapsedTime; grid.uniforms.uTime.value = s.clock.elapsedTime; panels.forEach((p) => { p.mat.uniforms.uTime.value = s.clock.elapsedTime }) })
  return (
    <group>
      <instancedMesh ref={inst} args={[undefined, undefined, buildings.length]} material={mat} frustumCulled={false}><boxGeometry args={[1, 1, 1]} /></instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -13.9, -195]} material={grid}><planeGeometry args={[80, 110]} /></mesh>
      {panels.map((p, i) => <mesh key={i} position={p.pos} rotation={[0, p.rot, 0]} material={p.mat}><planeGeometry args={p.size} /></mesh>)}
    </group>
  )
}
function ProjectStation({ i, near }: { i: number; near: boolean }) {
  const p = PROJ[i]
  const Art = PROJECT_ART[p.id]
  const frame = useMemo(() => holoMat(p.accent), [p.accent])
  const beam = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(p.accent).multiplyScalar(1.6), transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false }), [p.accent])
  useFrame((s) => { frame.uniforms.uTime.value = s.clock.elapsedTime })
  return (
    <group position={p.pos} rotation={[0, i ? -.22 : .22, 0]}>
      <mesh material={frame} position={[0, 0, -.05]}><planeGeometry args={[7.8, 4.9]} /></mesh>
      <mesh material={beam} position={[0, -9, -.2]}><cylinderGeometry args={[.06, 1.6, 9.6, 24, 1, true]} /></mesh>
      {near && Art && (
        <Html transform distanceFactor={4} zIndexRange={[4, 0]} position={[0, 0, 0]} style={{ width: 720, pointerEvents: 'none' }}>
          <div style={{ opacity: .96 }}><Art /></div>
        </Html>
      )}
    </group>
  )
}

/* ------------------------------- world B · interface universe ------------------------------- */
const uiShapeMat = (color: string, aspect: number, kind: number) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide,
  uniforms: { uColor: { value: new THREE.Color(color) }, uAspect: { value: aspect }, uKind: { value: kind } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `uniform vec3 uColor; uniform float uAspect, uKind; varying vec2 vUv;
    float box(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
    void main(){
      vec2 p = (vUv - .5) * vec2(uAspect, 1.);
      float d = box(p, vec2(uAspect * .5, .5) - .02, uKind > 1.5 ? .5 : .14);
      float a = 1. - smoothstep(0., .015, d);
      vec3 c = uColor;
      if (uKind < .5){                                   // card: header bar + text lines
        float bar = step(.28, p.y) * .25;
        float lines = step(abs(fract((p.y + .5) * 6.) - .5), .12) * step(p.y, .18) * step(abs(p.x), uAspect * .38) * .35;
        c = mix(c, vec3(1.), bar + lines);
      } else if (uKind > 1.5){                           // toggle: knob
        float knob = 1. - smoothstep(.34, .36, length(p - vec2(uAspect * .5 - .5, 0.)));
        c = mix(c, vec3(1.), knob);
      }
      float edge = 1. - smoothstep(0., .03, abs(d + .02));
      gl_FragColor = vec4(c * (1. + edge * .8), a * .9);
    }`,
})
function UniverseB() {
  const shapes = useMemo(() => {
    const cols = [...caseStudies.map((c) => c.accent), '#ffffff', '#ffd166']
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    return Array.from({ length: reduced ? 22 : 48 }, (_, i) => {
      const kind = i % 3, a = rnd() * Math.PI * 2, r = 6 + rnd() * 12
      const aspect = kind === 0 ? 1.3 + rnd() * .6 : kind === 1 ? 1 : 2.2
      const size = kind === 0 ? 1.6 + rnd() * 1.8 : kind === 1 ? .6 + rnd() * .6 : .8 + rnd() * .5
      return { pos: V(Math.cos(a) * r, Math.sin(a) * r * .7, -262 - rnd() * 150), rot: V(rnd() - .5, rnd() - .5, rnd() - .5), spin: (rnd() - .5) * .25, aspect, size, mat: uiShapeMat(cols[i % cols.length], aspect, kind) }
    })
  }, [])
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame((s) => { const t = s.clock.elapsedTime; shapes.forEach((sh, i) => { const m = refs.current[i]; if (m) { m.rotation.set(sh.rot.x + Math.sin(t * .3 + i) * .2, sh.rot.y + t * sh.spin, sh.rot.z); m.position.y = sh.pos.y + Math.sin(t * .6 + i) * .3 } }) })
  return <group>{shapes.map((sh, i) => <mesh key={i} ref={(el) => { refs.current[i] = el }} position={sh.pos} material={sh.mat}><planeGeometry args={[sh.size * sh.aspect, sh.size]} /></mesh>)}</group>
}
function CaseDestination({ i, near, label }: { i: number; near: boolean; label: THREE.Texture | null }) {
  const c = CASES[i]
  const disc = useMemo(() => discMat('#1c0838', c.accent, label), [c.accent, label])
  useFrame((s) => { disc.uniforms.uTime.value = s.clock.elapsedTime; disc.uniforms.uOpen.value = near ? 1 : .55 })
  const Screen = c.id === 'butterfly' ? () => <AppScreen s={staticState('home')} /> : CONCEPT_SCREENS[c.id]?.[0]
  return (
    <group position={c.pos}>
      <mesh material={disc} position={[0, 0, -.6]} onClick={() => { location.hash = `#/case/${c.id}` }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}><circleGeometry args={[3.5, 96]} /></mesh>
      <mesh position={[0, 0, -.6]}><torusGeometry args={[3.6, .07, 16, 160]} /><meshBasicMaterial color={new THREE.Color(c.accent).multiplyScalar(2.2)} toneMapped={false} /></mesh>
      <mesh position={[0, 0, -.6]}><torusGeometry args={[3.85, .025, 8, 160]} /><meshBasicMaterial color={[2.2, .7, .12]} toneMapped={false} /></mesh>
      {near && Screen && (
        <Html transform distanceFactor={4} zIndexRange={[4, 0]} position={[i % 2 ? -.4 : .4, 0, 0]} rotation={[0, i % 2 ? .18 : -.18, 0]} style={{ pointerEvents: 'none' }}>
          <Phone scale={.62}><Screen /></Phone>
        </Html>
      )}
    </group>
  )
}

/* ------------------------------- world C · skill constellations ------------------------------- */
function SkillsC({ focus, show }: { focus: number; show: boolean }) {
  const data = useMemo(() => CONST.map((c) => {
    const n = c.items.length
    const stars = c.items.map((_, j) => { const a = j * (Math.PI * 2 / n) + .4, r = n > 6 ? 1.9 + (j % 2) * 1.2 : 1.5 + (j % 2) * .7; return V(Math.cos(a) * r, Math.sin(a) * r * .8, (j % 3 - 1) * .4) })
    const seg: number[] = []
    stars.forEach((s, j) => { seg.push(0, 0, 0, s.x, s.y, s.z); const nx = stars[(j + 1) % n]; if (n > 2) seg.push(s.x, s.y, s.z, nx.x, nx.y, nx.z) })
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3))
    return { ...c, stars, lines: g, lineMat: new THREE.LineBasicMaterial({ color: c.color, transparent: true, opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false }) }
  }), [])
  const rings = useRef<THREE.Group>(null)
  const tick = useRef(0)
  useFrame((s, dt) => {
    if (rings.current) rings.current.rotation.z += dt * .05
    // constellation labels never sit on top of the skill panel text
    if (++tick.current % 4 === 0) {
      const panel = document.querySelector<HTMLElement>('[data-mv-panel]')
      const pr = panel && +getComputedStyle(panel.parentElement!).opacity > .05 ? panel.getBoundingClientRect() : null
      document.querySelectorAll<HTMLElement>('.mv-clabel').forEach((el) => {
        const r = el.getBoundingClientRect()
        el.style.visibility = pr && r.bottom > pr.top + 24 && r.right > pr.left && r.left < pr.right ? 'hidden' : 'visible'
      })
    }
    data.forEach((c, i) => { c.lineMat.opacity += (((focus < 0 || focus === i) ? .55 : .14) - c.lineMat.opacity) * .1 })
  })
  return (
    <group>
      <group ref={rings} position={HUB}>
        {[3.2, 4.4, 11.5].map((r, k) => <mesh key={k}><torusGeometry args={[r, k === 2 ? .02 : .012, 8, 200]} /><meshBasicMaterial color={k === 2 ? [.3, 1.6, 1.5] : [.2, .9, 1]} toneMapped={false} transparent opacity={.6} /></mesh>)}
      </group>
      {data.map((c, i) => (
        <group key={c.id} position={c.center}>
          <lineSegments geometry={c.lines} material={c.lineMat} />
          <mesh><sphereGeometry args={[.22, 16, 16]} /><meshBasicMaterial color={new THREE.Color(c.color).multiplyScalar(2.4)} toneMapped={false} /></mesh>
          {c.stars.map((s, j) => <mesh key={j} position={s}><sphereGeometry args={[.11, 12, 12]} /><meshBasicMaterial color={new THREE.Color(c.color).multiplyScalar(focus < 0 || focus === i ? 2.2 : .8)} toneMapped={false} /></mesh>)}
          {show && (
            <Html center zIndexRange={[4, 0]} position={[0, -.62, 0]} style={{ pointerEvents: 'none' }}>
              <div className="mv-clabel whitespace-nowrap font-mono text-[10px] font-semibold tracking-[0.18em] transition-opacity" style={{ color: c.color, opacity: focus === i && !mobile() ? 0 : focus < 0 || focus === i ? 1 : .35, textShadow: '0 0 12px rgba(0,0,0,.9)' }}>{c.name.toUpperCase()}</div>
            </Html>
          )}
          {show && !mobile() && focus === i && c.items.map((it, j) => (
            <Html key={it.name} center zIndexRange={[4, 0]} position={[c.stars[j].x, c.stars[j].y + .32, c.stars[j].z]} style={{ pointerEvents: 'none' }}>
              <div className="mv-clabel whitespace-nowrap rounded-sm bg-black/55 px-1.5 py-[1px] text-[11px] font-semibold text-white">{it.name}</div>
            </Html>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ------------------------------- exit · New York ------------------------------- */
const exitMat = (sky: THREE.Texture) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide,
  uniforms: { tSky: { value: sky }, uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `uniform sampler2D tSky; uniform float uTime; varying vec2 vUv;
    void main(){
      vec2 p = vUv - .5; float r = length(p) * 2.;
      vec2 su = vec2(.5 + p.x * .56, .58 + p.y * .56);
      vec3 c = texture2D(tSky, su).rgb;
      float l = dot(c, vec3(.3, .59, .11));
      c = mix(vec3(l) * vec3(.9, .95, 1.05), c, .25) * .9;
      c += vec3(.9, .1, .15) * smoothstep(.3, 1., -p.x * 2.) * .25 + vec3(.15, .3, 1.) * smoothstep(.3, 1., p.x * 2.) * .22;
      c += vec3(1., .5, .15) * smoothstep(.85, .99, r) * 1.6;
      gl_FragColor = vec4(c, smoothstep(1., .97, r));
    }`,
})


/* ------------------------------- the character (Phase 2A: real model or preview-only test model) ------------------------------- */
export type CharAsset = { scene: THREE.Group; clips: THREE.AnimationClip[]; map: ClipMap; test: boolean }
const RIM: Record<string, string> = { '': '#a78bfa', A: '#38bdf8', B: '#ff4fa3', C: '#2dd4bf' }
function Character({ asset, state }: { asset: CharAsset; state: React.MutableRefObject<CharState | null> }) {
  const root = useRef<THREE.Group>(null)
  const rim = useRef<THREE.PointLight>(null)
  const { model, mixer, act, hand, hips, web, s } = useMemo(() => {
    const model = asset.scene
    // exported from Blender in metres (≈1.8 m tall) — the same units as the scene and the landing track
    const s = 1
    model.scale.setScalar(s)
    model.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.frustumCulled = false; m.castShadow = false } })
    const mixer = new THREE.AnimationMixer(model)
    const pick = (name: string) => asset.clips.find((c) => c.name === name)
    const mk = (name: string) => { const c = pick(name); return c ? mixer.clipAction(c) : null }
    // approved Blender animations: Swing (web swing), Land (release → touchdown → crouch → rise → look), FallBackward (mocap)
    const act = { swing: mk('Swing'), land: mk('Land'), fall: mk('FallBackward') }
    Object.values(act).forEach((a) => { if (a) { a.play(); a.paused = true; a.setEffectiveWeight(0) } })
    let hand: THREE.Object3D | null = null, hips: THREE.Object3D | null = null
    model.traverse((o) => { if (!hand && CHARACTER.handBone.test(o.name)) hand = o; if (!hips && /Hips$/.test(o.name)) hips = o })
    const webMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.7), toneMapped: false, transparent: true, opacity: .95 })
    const web = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1, 6, 1, true), webMat)
    return { model, mixer, act, hand: hand as THREE.Object3D | null, hips: hips as THREE.Object3D | null, web, s }
  }, [asset])
  const m4 = useMemo(() => new THREE.Matrix4(), []), hp = useMemo(() => new THREE.Vector3(), [])
  const qPrev = useRef<THREE.Quaternion | null>(null)
  // Swing clip: shoot at .55 s, web attaches .75 s, release 3.22 s (approved swing test timing)
  const SW_A = .62, SW_B = 3.2
  useFrame(() => {
    const cs = state.current, g = root.current
    if (!cs || !g) return
    g.position.copy(cs.pos)
    // orientation. His front is −Z: build a basis with +Y = body up and −Z = facing.
    let q: THREE.Quaternion
    if (cs.rot) q = cs.rot.clone()
    else {
      const y = cs.up.clone().normalize()
      const f = (cs.mode === 'fall' ? V(0, 0, 1) : cs.fwd.clone())               // falling backward: he faces the camera, his back to the portal
      const z = f.sub(y.clone().multiplyScalar(f.dot(y))).negate(); if (z.lengthSq() < 1e-6) z.set(0, 0, 1); z.normalize()
      const x = y.clone().cross(z).normalize()
      q = new THREE.Quaternion().setFromRotationMatrix(m4.makeBasis(x, y, z))
    }
    // soften pose-to-pose switches (swing → release, takeoff)
    if (qPrev.current && qPrev.current.angleTo(q) < 1.2) q = qPrev.current.clone().slerp(q, .35)
    qPrev.current = q.clone(); g.quaternion.copy(q)
    // scrub the clips by scroll
    const tk = cs.takeoff ?? 0
    const w = { swing: cs.mode === 'swing' || cs.mode === 'perch' ? 1 - tk : 0, land: cs.mode === 'land' ? 1 : tk, fall: cs.mode === 'fall' ? 1 : 0 }
    ;(Object.keys(act) as (keyof typeof act)[]).forEach((k) => act[k]?.setEffectiveWeight(w[k]))
    if (act.swing) act.swing.time = cs.mode === 'perch' ? 1.25 + Math.sin(cs.clipT * Math.PI) * .05 : THREE.MathUtils.lerp(SW_A, SW_B, cs.clipT)
    if (act.land) act.land.time = cs.mode === 'land' ? cs.clipT : act.land.getClip().duration * .999
    if (act.fall) act.fall.time = (cs.clipT * 2.2 % 1) * act.fall.getClip().duration * .999
    mixer.update(0)
    // keep the hips on the path point (root motion comes from the path / the landing track)
    model.position.set(0, 0, 0); g.updateMatrixWorld(true)
    if (hips) { hips.getWorldPosition(hp); g.worldToLocal(hp); model.position.copy(hp).negate(); g.updateMatrixWorld(true) }
    ;(window as any).__charView = { pos: g.position, hand, web, model, mode: cs.mode }
    if (cs.anchor && cs.web > 0) {
      if (hand) hand.getWorldPosition(hp); else hp.copy(cs.pos)
      const end = hp.clone().lerp(cs.anchor, cs.web)
      const mid = hp.clone().add(end).multiplyScalar(.5), len = hp.distanceTo(end)
      web.visible = len > .05
      web.position.copy(mid); web.scale.set(1, len, 1)
      web.quaternion.setFromUnitVectors(UP, end.clone().sub(hp).normalize())
    } else web.visible = false
    if (rim.current) rim.current.color.set(RIM[worldOf(cs.pos.z)])
    void s
  })
  return (
    <>
      <group ref={root}>
        <primitive object={model} />
        <pointLight ref={rim} position={[-1.5, 1.2, 1.8]} intensity={14} distance={8} />
        <pointLight position={[1.6, .6, -2.2]} intensity={11} distance={7} color="#ffd9b0" />
        <pointLight position={[-1.4, 1.6, -1.8]} intensity={7} distance={6} color="#dfe6ff" />
      </group>
      <primitive object={web} />
    </>
  )
}
/** the floating city fragments he lands on (same material as the fall's fragments) */
function LandingFragments({ sky }: { sky: THREE.Texture }) {
  const items = useMemo(() => LANDINGS.map((L, i) => {
    if (!L) return null
    const d = V(0, 0, -1).applyQuaternion(L.heading)
    const c = L.td.clone().lerp(L.stand, .5); c.y = L.feetY - .22
    const len = L.td.distanceTo(L.stand) + 1.7
    return { c, yaw: Math.atan2(-d.x, -d.z), len, mat: fragmentMat(sky, new THREE.Vector4(.1 + (i % 5) * .13, .3, .2, .16)) }
  }), [sky])
  return <>{items.map((it, i) => it && <mesh key={i} position={it.c} rotation={[0, it.yaw, 0]} material={it.mat}><boxGeometry args={[1.7, .36, it.len]} /></mesh>)}</>
}
/** web-hit markers + floating anchor objects (only drawn when a character is present) */
function Anchors({ active }: { active: React.MutableRefObject<THREE.Vector3 | null> }) {
  const splat = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d')!
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64)
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(32, 32); g.lineTo(32 + Math.cos(a) * 28, 32 + Math.sin(a) * 28); g.stroke() }
    return new THREE.CanvasTexture(c)
  }, [])
  const refs = useRef<(THREE.Sprite | null)[]>([])
  useFrame(() => { ANCHORS.forEach((a, i) => { const s = refs.current[i]; if (s) { const on = active.current?.equals(a.p); (s.material as THREE.SpriteMaterial).opacity = on ? 1 : .25; s.scale.setScalar(on ? .9 : .5) } }) })
  return (
    <group>
      {ANCHORS.map((a, i) => (
        <group key={i} position={a.p}>
          <sprite ref={(el) => { refs.current[i] = el }}><spriteMaterial map={splat} transparent depthWrite={false} toneMapped={false} /></sprite>
          {a.kind === 'float' && worldOf(a.p.z) === 'B' && <mesh rotation={[0, 0, .2]}><planeGeometry args={[1.8, 1.1]} /><meshBasicMaterial color={[1.4, .5, 1.1]} transparent opacity={.55} toneMapped={false} side={THREE.DoubleSide} /></mesh>}
          {(a.kind === 'node' || (a.kind === 'float' && worldOf(a.p.z) !== 'B')) && <mesh><icosahedronGeometry args={[.28, 0]} /><meshBasicMaterial color={[.4, 1.8, 1.7]} wireframe toneMapped={false} /></mesh>}
        </group>
      ))}
    </group>
  )
}

/* ------------------------------- the 3D journey ------------------------------- */
type Fall = { frames: HTMLImageElement[]; preview: boolean }
function World3D({ progress, onFocus, fall, character }: { progress: React.MutableRefObject<number>; onFocus: (f: Focus) => void; fall: Fall; character: CharAsset | null }) {
  const charState = useRef<CharState | null>(null)
  const activeAnchor = useRef<THREE.Vector3 | null>(null)
  const { camera, gl } = useThree()
  const nebula = useMemo(nebulaMat, [])
  const sky = useMemo(() => { const t = new THREE.TextureLoader().load(asset('skyline.jpg')); t.colorSpace = THREE.SRGBColorSpace; return t }, [])
  const exit = useMemo(() => exitMat(sky), [sky])
  const [labels, setLabels] = useState<{ gates: THREE.Texture[]; cases: THREE.Texture[]; exit: THREE.Texture } | null>(null)
  useEffect(() => {
    document.fonts.load('120px Anton').catch(() => null).finally(() => setLabels({
      gates: (['A', 'B', 'C'] as WorldKey[]).map((k) => labelTexture({ n: 'ENTER', kind: 'PORTAL', title: '' })),
      cases: CASES.map((c) => labelTexture({ n: c.n, kind: 'CONCEPT', title: c.title })),
      exit: labelTexture({ n: 'EXIT', kind: 'RETURN', title: 'NEW YORK' }),
    }))
  }, [])
  const [near, setNear] = useState<{ w: string; i: number }>({ w: '', i: -1 })

  const LEN = -EXIT_Z + 30
  const count = reduced ? 700 : mobile() ? 1600 : 3600
  const points = useMemo(() => {
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3)
    const pal = [new THREE.Color('#5b8cff'), new THREE.Color('#ff3fbf'), new THREE.Color('#ffffff'), new THREE.Color('#8b5cf6')]
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, r = 2.5 + Math.pow(Math.random(), .6) * 26
      pos.set([Math.cos(a) * r, Math.sin(a) * r, 20 - Math.random() * LEN], i * 3)
      const c = pal[i % 4]; col.set([c.r, c.g, c.b], i * 3)
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g
  }, [count, LEN])
  const trails = useMemo(() => {
    const n = reduced ? 40 : 220, pos = new Float32Array(n * 6)
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, r = 3 + Math.random() * 18, z = 10 - Math.random() * LEN, L = 4 + Math.random() * 14
      pos.set([Math.cos(a) * r, Math.sin(a) * r, z, Math.cos(a) * r, Math.sin(a) * r, z - L], i * 6) }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return g
  }, [LEN])
  const trailMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#7aa2ff', transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false }), [])
  const frags = useMemo(() => Array.from({ length: reduced ? 14 : 30 }, (_, i) => {
    const a = i * 2.39996, r = 6 + (i % 5) * 3.2
    // floating city fragments: through the fall, and drifting in the gaps between worlds
    const z = i < 22 ? 6 - i * 6 : [-240, -244, -430, -436, -248, -425, -238, -440][i - 22] ?? -240
    return {
      pos: V(Math.cos(a) * r, Math.sin(a) * r * .8, z),
      rot: new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3), spin: (Math.random() - .5) * .3,
      size: [1.2 + Math.random() * 3.2, .8 + Math.random() * 2.4, .25 + Math.random() * .5] as [number, number, number],
      mat: fragmentMat(sky, new THREE.Vector4(Math.random() * .7, .25 + Math.random() * .4, .15 + Math.random() * .2, .12 + Math.random() * .2)),
    }
  }), [sky])
  const dimDiscs = useMemo(() => DIM_PORTALS.map((_, i) => discMat(DIM_COLORS[i][0], DIM_COLORS[i][1], null)), [])
  const gateDiscs = useMemo(() => labels ? (['A', 'B', 'C'] as WorldKey[]).map((k, i) => discMat(WORLD_META[k].nebula[0], WORLD_META[k].nebula[1], labels.gates[i])) : null, [labels])
  const fallTex = useMemo(() => {
    if (fall.frames.length) { const t = new THREE.Texture(fall.frames[0]); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t }
    if (!fall.preview) return null
    const c = document.createElement('canvas'); c.width = 512; c.height = 512; const g = c.getContext('2d')!
    g.setLineDash([16, 10]); g.lineWidth = 6; g.strokeStyle = '#ff3b4f'; g.strokeRect(10, 10, 492, 492)
    g.fillStyle = '#ff3b4f'; g.textAlign = 'center'; g.font = '700 30px monospace'; g.fillText('SLOT · fall/0001….webp', 256, 240)
    g.fillStyle = '#fff'; g.font = '20px monospace'; g.fillText('Spider-Man falling backward', 256, 280); g.fillText('(preview only)', 256, 310)
    return new THREE.CanvasTexture(c)
  }, [fall])
  const fallRef = useRef<THREE.Mesh>(null)
  const sphere = useRef<THREE.Mesh>(null)
  const fragRefs = useRef<(THREE.Mesh | null)[]>([])
  const cur = useRef(0), roll = useRef(0), lastFocus = useRef(''), lastFrame = useRef(-1)
  const ca = useMemo(() => new THREE.Vector2(.0006, .0006), [])
  const prevPos = useRef(V(0, 0, FALL_FROM))
  const nA = useMemo(() => new THREE.Color(), []), nB = useMemo(() => new THREE.Color(), [])
  const gateZ = (['A', 'B', 'C'] as WorldKey[]).map((k) => WORLD_META[k].z)

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime, k = Math.min(dt, .25)
    cur.current += (progress.current - cur.current) * (1 - Math.exp(-(reduced ? 12 : 4.5) * k))
    const r = rig(cur.current)
    if (character) {
      // Spider-Man leads: work out where he is, then let the camera follow him between the framed shots
      const fwd = r.look.clone().sub(r.pos).normalize()
      const cs = charAt(r, THREE.MathUtils.clamp(cur.current / FALL_END, 0, 1), r.pos, fwd, t)
      charState.current = cs; activeAnchor.current = cs.anchor; (window as any).__char = cs
      if (cs.mode === 'swing' || (cs.mode === 'land' && r.m < 1)) {
        const w = THREE.MathUtils.smoothstep(r.m, 0, .22) * (1 - THREE.MathUtils.smoothstep(r.m, .78, 1))
        const lat = cs.legDir.clone().cross(UP).normalize()
        const follow = cs.pos.clone().addScaledVector(cs.legDir, -(M ? 8 : 6.5)).addScaledVector(UP, 1.1).addScaledVector(lat, 1.2)
        const followLook = cs.pos.clone().addScaledVector(cs.legDir, 5).addScaledVector(UP, -1.6)   // keep him in the upper half, clear of the info panel
        r.pos.lerp(follow, w); r.look.lerp(followLook, w)
      }
    }
    camera.position.copy(r.pos); camera.up.set(0, 1, 0); camera.lookAt(r.look)
    roll.current += (r.roll - roll.current) * (1 - Math.exp(-6 * k)); camera.rotateZ(roll.current)
    nebula.uniforms.uTime.value = t
    sphere.current?.position.copy(camera.position)
    ;(nebula.uniforms.uA.value as THREE.Color).lerp(nA.set(r.nebula[0]), 1 - Math.exp(-2 * k))
    ;(nebula.uniforms.uB.value as THREE.Color).lerp(nB.set(r.nebula[1]), 1 - Math.exp(-2 * k))
    const speed = r.pos.distanceTo(prevPos.current) / Math.max(dt, .001); prevPos.current.copy(r.pos)
    trailMat.opacity = Math.min(.75, .12 + speed * .02)
    const nearGate = [...DIM_PORTALS, ...gateZ, EXIT_Z].some((z) => Math.abs(r.pos.z - z) < 2.4)
    ca.setScalar(reduced ? .0005 : Math.min(.012, .0006 + speed * .00006 + (nearGate ? .008 : 0)))   // RGB split spikes through portals
    frags.forEach((f, i) => { const m = fragRefs.current[i]; if (m) { m.rotation.x = f.rot.x + t * f.spin; m.rotation.y = f.rot.y + t * f.spin * .7 } })
    dimDiscs.forEach((m, i) => { m.uniforms.uTime.value = t; m.uniforms.uOpen.value = 1; m.uniforms.uNear.value = THREE.MathUtils.smoothstep(6, 1.2, Math.abs(r.pos.z - DIM_PORTALS[i])) })
    gateDiscs?.forEach((m, i) => { m.uniforms.uTime.value = t; m.uniforms.uOpen.value = 1; m.uniforms.uNear.value = THREE.MathUtils.smoothstep(6, 1.2, Math.abs(r.pos.z - gateZ[i])) })
    exit.uniforms.uTime.value = t
    const travel = !!character && r.k > 0 && r.m < .9
    const key = `${r.focus.w}:${r.focus.i}:${r.focus.card ? 1 : 0}:${travel ? 1 : 0}`
    if (key !== lastFocus.current) { lastFocus.current = key; onFocus({ ...r.focus, travel }) }
    // which world's heavy HTML previews are mounted (only the nearby one)
    const z = r.pos.z
    const w = z < -436 ? 'C' : z < -240 ? 'B' : z < -136 ? 'A' : ''
    const ni = w === 'A' ? PROJ.reduce((b, p, i) => Math.abs(p.pos.z - z) < Math.abs(PROJ[b].pos.z - z) ? i : b, 0)
      : w === 'B' ? CASES.reduce((b, c, i) => Math.abs(c.pos.z - z) < Math.abs(CASES[b].pos.z - z) ? i : b, 0) : r.focus.i
    if (w !== near.w || ni !== near.i) setNear({ w, i: ni })
    // Spider-Man's fall (frame sequence) — stays in front of the camera, scrubbed by scroll
    if (fallRef.current) {
      const f = THREE.MathUtils.clamp(cur.current / FALL_END, 0, 1)
      const fwd = new THREE.Vector3(); camera.getWorldDirection(fwd)
      fallRef.current.position.copy(camera.position).addScaledVector(fwd, 7)
      fallRef.current.quaternion.copy(camera.quaternion)
      fallRef.current.visible = cur.current < FALL_END * 1.02
      const fr = fall.frames
      if (fr.length > 1 && fallTex) { const kk = Math.min(fr.length - 1, Math.floor(f * (fr.length - 1))); if (kk !== lastFrame.current) { lastFrame.current = kk; fallTex.image = fr[kk]; fallTex.needsUpdate = true } }
    }
    gl.toneMappingExposure = 1
  }, -1)

  const Gate = ({ z, i }: { z: number; i: number }) => (
    <group position={[0, 0, z]}>
      {gateDiscs && <mesh material={gateDiscs[i]}><circleGeometry args={[4.6, 96]} /></mesh>}
      <mesh><torusGeometry args={[4.7, .1, 16, 160]} /><meshBasicMaterial color={[2.4, .75, .12]} toneMapped={false} /></mesh>
      <mesh><torusGeometry args={[5.05, .03, 8, 160]} /><meshBasicMaterial color={new THREE.Color(WORLD_META[(['A', 'B', 'C'] as WorldKey[])[i]].nebula[1]).multiplyScalar(2)} toneMapped={false} /></mesh>
    </group>
  )

  return (
    <>
      <mesh ref={sphere} material={nebula} frustumCulled={false}><sphereGeometry args={[400, 48, 32]} /></mesh>
      <points geometry={points}><pointsMaterial size={mobile() ? .09 : .07} vertexColors transparent opacity={.9} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation /></points>
      <lineSegments geometry={trails} material={trailMat} />
      {frags.map((f, i) => <mesh key={i} ref={(el) => { fragRefs.current[i] = el }} position={f.pos} rotation={f.rot} material={f.mat}><boxGeometry args={f.size} /></mesh>)}
      {DIM_PORTALS.map((z, i) => (
        <group key={z} position={[Math.sin(i * 2.1) * .8, Math.cos(i * 1.4) * .6, z]}>
          <mesh material={dimDiscs[i]}><circleGeometry args={[4.6, 96]} /></mesh>
          <mesh><torusGeometry args={[4.7, .09, 16, 160]} /><meshBasicMaterial color={[2.4, .75, .12]} toneMapped={false} /></mesh>
        </group>
      ))}
      {gateZ.map((z, i) => <Gate key={z} z={z} i={i} />)}

      {/* WORLD A */}
      <CityA />
      {PROJ.map((_, i) => <ProjectStation key={i} i={i} near={near.w === 'A' && near.i === i} />)}
      {/* WORLD B */}
      <UniverseB />
      {CASES.map((_, i) => <CaseDestination key={i} i={i} near={near.w === 'B' && Math.abs(near.i - i) <= 0} label={labels?.cases[i] ?? null} />)}
      {/* WORLD C */}
      <SkillsC focus={near.w === 'C' ? near.i : -1} show={near.w === 'C'} />
      {/* EXIT → New York */}
      <group position={[0, 0, EXIT_Z]}>
        <mesh material={exit}><circleGeometry args={[5.2, 96]} /></mesh>
        <mesh><torusGeometry args={[5.3, .1, 16, 160]} /><meshBasicMaterial color={[2.4, .75, .12]} toneMapped={false} /></mesh>
      </group>

      {character && <><Character asset={character} state={charState} /><LandingFragments sky={sky} /><Anchors active={activeAnchor} /><hemisphereLight args={['#c7d2fe', '#1e1b4b', 1.1]} /><directionalLight position={[3, 6, 4]} intensity={1.4} /></>}
      {fallTex && !character && <mesh ref={fallRef} renderOrder={10}><planeGeometry args={[3.2, 3.2]} /><meshBasicMaterial map={fallTex} transparent depthTest={false} toneMapped={false} /></mesh>}
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={mobile() ? .8 : 1.05} luminanceThreshold={.62} luminanceSmoothing={.2} />
        <ChromaticAberration offset={ca} radialModulation={false} modulationOffset={0} blendFunction={BlendFunction.NORMAL} />
        <Noise opacity={.06} premultiply blendFunction={BlendFunction.SCREEN} />
        <Vignette eskil={false} offset={.25} darkness={.75} />
      </EffectComposer>
    </>
  )
}

/* ------------------------------- jump API (navigation, skip, back-to-world) ------------------------------- */
export const multiverseNav: { jump: (key: string, smooth?: boolean) => boolean } = { jump: () => false }
const LAST_KEY = 'mv-last-world-item'

/* ------------------------------- the scene ------------------------------- */
export function Multiverse({ preview = false }: { preview?: boolean }) {
  const track = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const st = useRef<ScrollTrigger | null>(null)
  const [active, setActive] = useState(false)
  const [focus, setFocus] = useState<Focus>({ w: null, i: -1 })
  const [fall, setFall] = useState<Fall>({ frames: [], preview })
  const [list, setList] = useState(false)
  const [character, setCharacter] = useState<CharAsset | null>(null)

  // Spider-Man model
  useEffect(() => {
    let dead = false
    ;(async () => {
      // the animated Spider-Man (approved Blender animations + mocap fall), shared with the NYC opening
      if (!(CHARACTER.enabledForVisitors || (preview && CHARACTER.showInPreview))) return
      const g = await cloneCharacter()
      if (!g || dead) return
      setCharacter({ scene: g.scene, clips: g.clips, map: CHARACTER.clips, test: false })
    })()
    return () => { dead = true }
  }, [preview])

  useEffect(() => {
    let dead = false
    const load = (src: string) => new Promise<HTMLImageElement | null>((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src })
    const dir = `${STORY_ASSETS}multiverse/fall/`
    load(`${dir}0001.webp`).then(async (f1) => {
      if (!f1 || dead) return
      const rest = await Promise.all(Array.from({ length: 95 }, (_, k) => load(`${dir}${String(k + 2).padStart(4, '0')}.webp`)))
      if (!dead) setFall({ frames: [f1, ...rest.filter((x): x is HTMLImageElement => !!x)], preview })
    })
    return () => { dead = true }
  }, [preview])

  useLayoutEffect(() => {
    st.current = ScrollTrigger.create({
      trigger: track.current, start: 'top top', end: 'bottom bottom',
      onToggle: (s) => setActive(s.isActive),
      onUpdate: (s) => { progress.current = s.progress },
    })
    multiverseNav.jump = (key, smooth = false) => {
      const s = st.current; if (!s) return false
      const p = key in WORLD_META ? shotProgress(key) : shotProgress(key)
      scrollTo({ top: s.start + p * (s.end - s.start), behavior: smooth && !reduced ? 'smooth' : 'auto' })
      return true
    }
    ;(window as any).__mv = { shotProgress, moveProgress, SHOT_RANGES, start: () => st.current?.start, end: () => st.current?.end }   // used by the automated tests
    return () => { st.current?.kill(); multiverseNav.jump = () => false }
  }, [])

  const go = (key: string) => multiverseNav.jump(key, Math.abs(shotProgress(key) - progress.current) < .08)
  // remember where we were and make the browser's Back button return to this world (not the top of the story)
  const remember = (key: string) => { try { sessionStorage.setItem(LAST_KEY, key); history.replaceState(history.state, '', key[0] === 'A' ? '#/projects' : '#/cases') } catch { /* private mode / sandboxed frame */ } }
  const W = focus.w && focus.w !== 'X' ? focus.w : null
  const showPanel = !!W && !focus.card && !focus.travel

  return (
    <>
      <div className="mv fixed inset-0 z-[16] bg-black" style={{ visibility: active ? 'visible' : 'hidden' }}>
        <Canvas frameloop={active ? 'always' : 'never'} dpr={[1, mobile() ? 1.5 : 1.75]} camera={{ fov: mobile() ? 72 : 58, near: .1, far: 900, position: [0, 0, FALL_FROM] }} gl={{ antialias: false, powerPreference: 'high-performance' }} aria-label="Falling through the multiverse into three worlds: software projects, UX case studies and skills" role="img">
          <World3D progress={progress} onFocus={setFocus} fall={fall} character={character} />
        </Canvas>
        <div className="halftone pointer-events-none absolute inset-0 opacity-25" aria-hidden />

        {/* world title cards */}
        {(['A', 'B', 'C'] as WorldKey[]).map((k) => {
          const on = focus.w === k && focus.card
          return (
            <div key={k} className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-6 text-center transition-opacity duration-700" style={{ opacity: on ? 1 : 0 }} aria-hidden={!on}>
              <div>
                <div className="font-mono text-[11px] tracking-[0.5em] text-white/70">SCENE {k === 'A' ? '06' : k === 'B' ? '07' : '08'}</div>
                <div className="t1-display t1-chroma-strong mt-6 text-[clamp(52px,10vw,170px)] leading-[0.86] text-white">{WORLD_META[k].name.split(' ').slice(0, -1).join(' ')}<br />{WORLD_META[k].name.split(' ').slice(-1)}</div>
                <div className="mt-8 font-mono text-[11px] tracking-[0.3em] text-white/60">{WORLD_META[k].sub.toUpperCase()}</div>
              </div>
            </div>
          )
        })}

        {/* focused item panel */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-16 sm:px-10 sm:pb-16" style={{ opacity: showPanel ? 1 : 0, transition: 'opacity .45s', pointerEvents: showPanel ? 'auto' : 'none' }}>
          <div data-mv-panel className="mx-auto max-w-[1200px] bg-gradient-to-t from-black/85 via-black/60 to-transparent pt-10">
            {W === 'A' && focus.i >= 0 && <ProjectPanel i={focus.i} onEnter={() => remember(`A${focus.i}`)} />}
            {W === 'B' && focus.i >= 0 && <CasePanel i={focus.i} onEnter={() => remember(`B${focus.i}`)} />}
            {W === 'C' && <SkillPanel i={focus.i} onList={() => setList(true)} />}
            {/* travel controls inside the current world */}
            {W && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="mr-2 flex gap-1" role="group" aria-label="Worlds">
                  {(['A', 'B', 'C'] as WorldKey[]).map((k) => (
                    <button key={k} type="button" onClick={() => go(k === 'C' ? 'Call' : `${k}0`)} aria-current={W === k ? 'true' : undefined}
                      className={`border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.2em] ${W === k ? 'border-white bg-white text-black' : 'border-white/30 text-white/80 hover:border-white'}`}>{k === 'A' ? 'PROJECTS' : k === 'B' ? 'UX' : 'SKILLS'}</button>
                  ))}
                </div>
                <nav aria-label={`Items in ${WORLD_META[W].name.toLowerCase()}`} className="flex flex-1 gap-1.5">
                  {(W === 'A' ? PROJ : W === 'B' ? CASES : CONST).map((x, i) => {
                    const color = 'accent' in x ? (x as { accent: string }).accent : (x as { color: string }).color
                    const name = 'title' in x ? (x as { title: string }).title : (x as { name: string }).name
                    return (
                      <button key={i} type="button" onClick={() => go(`${W}${i}`)} aria-current={focus.i === i ? 'true' : undefined} title={name}
                        className="h-1.5 min-w-5 flex-1 transition" style={{ background: focus.i === i ? color : 'rgba(255,255,255,.22)' }}><span className="sr-only">{name}</span></button>
                    )
                  })}
                </nav>
              </div>
            )}
          </div>
        </div>

        {list && <SkillsList onClose={() => setList(false)} />}
        {preview && (
          <details open={innerWidth >= 768} className="pointer-events-auto absolute left-4 top-20 z-10 max-w-[min(340px,calc(100vw-32px))] border border-[#e8202f]/60 bg-black/80 p-3 font-mono text-[10px] leading-relaxed text-white/80 sm:left-8">
            <summary className="cursor-pointer text-[#ff4a5a]">SCENES 05–08 · PREVIEW{character && !character.test ? ' · Spider-Man (rest pose, no animations yet)' : ''}</summary>
            {character?.test && <div className="text-[#ffb547]">· TEST CHARACTER — {CHARACTER.test.license}. Not Spider-Man; never shown to visitors.</div>}
            {character && !character.test && <>
              <div className="text-[#7CFFB2]">· {CHARACTER.file.split('/').pop()} loaded — your textured Spider-Man{CHARACTER.enabledForVisitors ? '' : ' (visitors: off)'}</div>
              <div className="mt-1 text-[#ffb547]">· POSE: static rest pose (A-pose). He is carried along the Phase 2A swing paths; this is NOT swinging animation.</div>
              <div className="mt-1 text-white/60">Missing animations:</div>
              {CHARACTER.needed.filter((n) => !character.clips.some((c) => n.clip.split(' / ').some((x) => c.name === x))).map((n) => <div key={n.clip}>· <span className="text-white">{n.clip}</span> — {n.use}</div>)}
            </>}
            {!fall.frames.length && !character && <div>· multiverse/fall/ — Spider-Man falling backward (missing). Visitors: the camera falls alone.</div>}
            {!character && <div>· Spider-Man: hidden until real animation clips exist (swing, hang, fall, web shoot, release, land). The camera travels alone.</div>}
          </details>
        )}
      </div>
      <div ref={track} data-scene-marker="multiverse" className="relative" style={{ height: `${(SCREENS + 1) * 100}vh` }} aria-hidden>
        {(['A', 'B', 'C'] as WorldKey[]).map((k) => <div key={k} data-scene-marker={WORLD_META[k].marker} className="absolute inset-x-0" style={{ top: `${worldStartProgress(k) * SCREENS * 100}vh` }} />)}
      </div>
    </>
  )
}

/* ------------------------------- overlay panels ------------------------------- */
function Btn({ href, color, children, onClick }: { href: string; color: string; children: React.ReactNode; onClick?: () => void }) {
  return <a href={href} onClick={onClick} className="inline-flex items-center whitespace-nowrap border px-5 py-3 text-[12px] font-semibold tracking-[0.2em] text-white transition hover:bg-white/10" style={{ borderColor: color, boxShadow: `0 0 30px -8px ${color}` }}>{children}</a>
}
function ProjectPanel({ i, onEnter }: { i: number; onEnter: () => void }) {
  const p = PROJ[i]
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-[720px]">
        <div className="flex items-center gap-3"><span className="font-mono text-[12px]" style={{ color: p.accent }}>{p.index}</span><span className="border px-2 py-[3px] font-mono text-[10px] tracking-[0.25em]" style={{ borderColor: p.accent, color: p.accent }}>SOFTWARE PROJECT</span></div>
        <h3 className="t1-display mt-2 text-[clamp(28px,4vw,58px)] leading-[0.92] text-white">{p.title.toUpperCase()}</h3>
        <p className="mt-2 text-[14px] text-white/80 sm:text-[15px]">{p.tagline}</p>
        <p className="mt-2 hidden font-mono text-[11px] tracking-[0.1em] text-white/55 sm:block">{p.tech.join(' / ')}</p>
        {p.result && <p className="mt-2 text-[13px] text-white/85"><span className="font-semibold text-white">Result:</span> {p.result}</p>}
      </div>
      <Btn href={`#/project/${p.id}`} color={p.accent} onClick={onEnter}>OPEN PROJECT →</Btn>
    </div>
  )
}
function CasePanel({ i, onEnter }: { i: number; onEnter: () => void }) {
  const c = CASES[i]
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-[720px]">
        <div className="flex items-center gap-3"><span className="font-mono text-[12px]" style={{ color: c.accent }}>{c.n} / 06</span><span className="border px-2 py-[3px] font-mono text-[10px] tracking-[0.25em]" style={{ borderColor: c.accent, color: c.accent }}>CONCEPT CASE STUDY</span></div>
        <h3 className="t1-display mt-2 text-[clamp(32px,4.6vw,66px)] leading-[0.92] text-white">{c.title.toUpperCase()}</h3>
        <p className="mt-2 text-[14px] text-white/80 sm:text-[16px]">{c.oneLiner}</p>
        <p className="mt-1 hidden text-[13px] text-white/60 sm:block">Key decision: {c.decision}</p>
      </div>
      <Btn href={`#/case/${c.id}`} color={c.accent} onClick={onEnter}>OPEN CASE STUDY →</Btn>
    </div>
  )
}
function SkillPanel({ i, onList }: { i: number; onList: () => void }) {
  const c = i >= 0 ? CONST[i] : null
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-[820px]">
        <div className="flex items-center gap-3"><span className="font-mono text-[12px]" style={{ color: c?.color ?? '#5eead4' }}>{c ? `${String(i + 1).padStart(2, '0')} / 08` : '08 CATEGORIES'}</span><span className="border border-[#5eead4] px-2 py-[3px] font-mono text-[10px] tracking-[0.25em] text-[#5eead4]">SKILLS & TECHNOLOGIES</span></div>
        <h3 className="t1-display mt-2 text-[clamp(28px,4vw,58px)] leading-[0.92] text-white">{c ? c.name.toUpperCase() : 'THE SKILL UNIVERSE'}</h3>
        {c ? (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${c.name} skills`}>
            {c.items.map((it) => (
              <li key={it.name} className="border border-white/20 bg-black/40 px-2.5 py-1 text-[12px] text-white sm:text-[13px]">
                {it.group && <span className="mr-1 font-mono text-[9px] tracking-[0.15em] text-white/50">{it.group.toUpperCase()} ·</span>}{it.name}
                {it.usedIn.map((u) => <a key={u.href} href={u.href} className="ml-1.5 font-mono text-[10px] underline decoration-dotted" style={{ color: c.color }} title={`Used in ${u.title}`}>used in {u.title.split(' ').slice(0, 2).join(' ')}</a>)}
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-[14px] text-white/75">Eight constellations of the tools I use. Scroll to visit each one — or open the list view.</p>}
      </div>
      <button type="button" onClick={onList} className="inline-flex items-center whitespace-nowrap border border-[#5eead4] px-5 py-3 text-[12px] font-semibold tracking-[0.2em] text-white hover:bg-white/10">LIST VIEW</button>
    </div>
  )
}
function SkillsList({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { ref.current?.focus(); const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [onClose])
  return (
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label="All skills" className="absolute inset-0 z-20 overflow-y-auto bg-black/92 px-5 py-20 outline-none sm:px-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex items-center justify-between"><h3 className="t1-display text-[clamp(36px,5vw,64px)] text-white">SKILLS & TECHNOLOGIES</h3><button type="button" onClick={onClose} className="border border-white/40 px-4 py-2 text-[12px] font-semibold tracking-[0.2em] text-white">CLOSE ✕</button></div>
        <p className="mt-2 text-[13px] text-white/55">From my resume. No ratings or percentages.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {SKILL_UNIVERSE.map((c) => (
            <section key={c.id} className="border-t pt-4" style={{ borderColor: c.color }}>
              <h4 className="font-mono text-[11px] tracking-[0.3em]" style={{ color: c.color }}>{c.name.toUpperCase()}</h4>
              <p className="mt-2 text-[15px] leading-relaxed text-white">{c.items.map((x) => x.name).join(' · ')}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
