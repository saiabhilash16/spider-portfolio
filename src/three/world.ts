import * as THREE from 'three'

/* ------------------------------------------------------------------ *
 *  WORLD = the city layout + the hero's pre-simulated swing path.
 *  The avenue runs along -Z. Scroll position picks a point on the path.
 * ------------------------------------------------------------------ */

export const ROW1_INNER = 22 // x of the building faces that line the avenue
export const AVENUE_HALF = 16
export const CITY_START = 330
export const CITY_END = -1260
export const HERO_SCALE = 2.2
export const HIPS_HEIGHT = 0.9 * HERO_SCALE // hip height above the feet when standing

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Building = {
  x: number; z: number; w: number; d: number; h: number
  seed: number; accent: [number, number, number]; row: number; side: number
}

export type SpecialId = 'hero' | 'project-portal' | 'project-commerce' | 'contact'
type Special = { id: SpecialId; side: number; z: number; h: number; accent: [number, number, number] }

const C = (hex: string): [number, number, number] => {
  const c = new THREE.Color(hex)
  return [c.r, c.g, c.b]
}

export const SPECIALS: Special[] = [
  { id: 'hero', side: 1, z: 20, h: 64, accent: C('#22D3EE') },
  { id: 'project-portal', side: -1, z: -260, h: 118, accent: C('#22D3EE') },
  { id: 'project-commerce', side: 1, z: -500, h: 108, accent: C('#F59E0B') },
  { id: 'contact', side: -1, z: -1060, h: 84, accent: C('#F59E0B') },
]
const CROSS_STREETS = [150, -110, -380, -620, -840, -1180]
const SPECIAL_DEPTH = 26

export type WaterTower = { x: number; y: number; z: number; r: number }
export type Spire = { x: number; y: number; z: number; h: number; r: number; blink: boolean }

/* New York-inspired landmarks (stylized, original): stacked setbacks + spires */
const LANDMARKS: { x: number; z: number; tiers: [number, number][]; spire: number; accent: string }[] = [
  // Art-Deco crown tower
  { x: 150, z: -430, tiers: [[30, 160], [24, 192], [18, 214], [12, 230], [7, 240]], spire: 46, accent: '#F5C46B' },
  // classic stepped tower with a mast
  { x: -140, z: -720, tiers: [[38, 180], [30, 226], [22, 254], [14, 270], [8, 280]], spire: 60, accent: '#E9F1FF' },
  // glass supertall downtown
  { x: -150, z: -1170, tiers: [[34, 250], [28, 300], [22, 338], [16, 362]], spire: 70, accent: '#22D3EE' },
]

export function buildCity(lowDetail: boolean) {
  const rnd = mulberry32(1337)
  const buildings: Building[] = []
  const waterTowers: WaterTower[] = []
  const spires: Spire[] = []
  const inCross = (z0: number, z1: number) => CROSS_STREETS.some((c) => z0 > c - 10 && z1 < c + 10)
  const NONE: [number, number, number] = [0, 0, 0]

  for (const side of [-1, 1]) {
    const rows = lowDetail ? 2 : 4
    for (let row = 0; row < rows; row++) {
      const specials = row === 0 ? SPECIALS.filter((s) => s.side === side).sort((a, b) => b.z - a.z) : []
      let z = CITY_START
      while (z > CITY_END) {
        const next = specials[0]
        if (next && z - 30 < next.z + SPECIAL_DEPTH / 2) {
          const w = 24
          buildings.push({
            x: side * (ROW1_INNER + w / 2), z: next.z, w, d: SPECIAL_DEPTH, h: next.h,
            seed: rnd(), accent: next.accent, row, side,
          })
          z = next.z - SPECIAL_DEPTH / 2 - 2
          specials.shift()
          continue
        }
        const d = 14 + rnd() * 14
        const z0 = z, z1 = z - d
        if (inCross(z0, z1)) { z -= 6; continue }
        const inner = row === 0 ? ROW1_INNER : ROW1_INNER + 30 + (row - 1) * 34 + rnd() * 6
        const w = row === 0 ? 16 + rnd() * 10 : 18 + rnd() * 14
        let h = row === 0 ? 46 + rnd() * 70 : 70 + rnd() * (row * 50 + 60)
        const waterfront = z1 < -1085 // low-rise near the river so the finale has a view
        if (waterfront) h = Math.min(h * 0.45, 52)
        const lit = rnd()
        const accent: [number, number, number] =
          lit > 0.88 ? C('#22D3EE') : lit > 0.76 ? C('#F59E0B') : NONE
        const x = side * (inner + w / 2), zc = (z0 + z1) / 2
        buildings.push({ x, z: zc, w, d, h, seed: rnd(), accent, row, side })

        // NYC "wedding cake" setbacks on taller buildings (row 7 = decorative, no web anchors)
        if (!waterfront && h > 82 && rnd() < 0.65) {
          const h2 = h + 8 + rnd() * 24
          buildings.push({ x: x + side * w * 0.08, z: zc, w: w * 0.72, d: d * 0.72, h: h2, seed: rnd(), accent: rnd() > 0.7 ? C('#F5C46B') : NONE, row: 7, side })
          if (h2 > 140 && rnd() < 0.5) {
            buildings.push({ x: x + side * w * 0.12, z: zc, w: w * 0.45, d: d * 0.45, h: h2 + 10 + rnd() * 18, seed: rnd(), accent: NONE, row: 7, side })
          }
        } else if (h < 110 && rnd() < 0.32) {
          // classic wooden rooftop water tower
          waterTowers.push({ x: x - side * w * 0.2 + (rnd() - 0.5) * 4, y: h, z: zc + (rnd() - 0.5) * d * 0.4, r: 1.6 + rnd() * 0.9 })
        }
        z = z1 - (1.5 + rnd() * 2)
      }
    }
  }
  if (!lowDetail) {
    for (const L of LANDMARKS) {
      L.tiers.forEach(([w, h], i) => {
        const last = i === L.tiers.length - 1
        buildings.push({ x: L.x, z: L.z, w, d: w, h, seed: 0.4 + i * 0.1, accent: last || i === L.tiers.length - 2 ? C(L.accent) : NONE, row: 7, side: 0 })
      })
      const top = L.tiers[L.tiers.length - 1][1]
      spires.push({ x: L.x, y: top, z: L.z, h: L.spire, r: 1.6, blink: true })
    }
  }
  // skyline wall behind the starting point
  for (let i = 0; i < 14; i++) {
    buildings.push({ x: -130 + i * 20, z: CITY_START + 60 + rnd() * 30, w: 18, d: 18, h: 100 + rnd() * 140, seed: rnd(), accent: NONE, row: 5, side: 0 })
  }
  return { buildings, waterTowers, spires }
}

/* ------------------------- Anchors (web attach points) ------------------------- */
export function anchorsFrom(buildings: Building[]) {
  const out: THREE.Vector3[] = []
  for (const b of buildings) {
    if (b.row !== 0) continue
    const x = b.side * ROW1_INNER
    out.push(new THREE.Vector3(x, b.h, b.z + b.d * 0.35))
    out.push(new THREE.Vector3(x, b.h, b.z - b.d * 0.35))
  }
  return out
}

/* ------------------------------ Hero path samples ------------------------------ */
export type Pose = 'swing' | 'fly' | 'tuck' | 'land' | 'stand' | 'jump'
export type Sample = {
  p: THREE.Vector3        // hip position
  v: THREE.Vector3        // velocity
  face: THREE.Vector3     // horizontal facing direction
  anchor: THREE.Vector3 | null
  attachT: number         // sim time when the current web attached
  t: number               // sim time (seconds)
  pose: Pose
  k: number               // 0..1 progress inside land/stand/jump/tuck
}

export type Hold = { id: SpecialId; i0: number; i1: number; target: THREE.Vector3; side: number }

const G = 34
const DT = 1 / 60

export function roofTarget(id: SpecialId) {
  const s = SPECIALS.find((x) => x.id === id)!
  return {
    target: new THREE.Vector3(s.side * (ROW1_INNER + 4), s.h + HIPS_HEIGHT, s.z),
    side: s.side,
  }
}

export function buildTrack(anchors: THREE.Vector3[]) {
  const samples: Sample[] = []
  const holds: Hold[] = []
  let t = 0
  const push = (s: Omit<Sample, 't'>) => {
    samples.push({ ...s, p: s.p.clone(), v: s.v.clone(), face: s.face.clone(), t })
    t += DT
  }
  const hFace = (v: THREE.Vector3, fallback = new THREE.Vector3(0, 0, -1)) => {
    const f = new THREE.Vector3(v.x, 0, v.z)
    return f.lengthSq() > 1e-4 ? f.normalize() : fallback.clone()
  }

  /** Physics: point mass + rope constraint, choosing anchors ahead on alternating sides. */
  function swingUntil(p: THREE.Vector3, v: THREE.Vector3, stopZ: number, flipOnFlight = -1) {
    let anchor = null as THREE.Vector3 | null
    let L = 0, attachT = 0, flightT = 0, flights = 0, lastSide = 0
    const d = new THREE.Vector3()

    const pick = () => {
      let best = null as THREE.Vector3 | null
      let score = -Infinity
      for (const pass of [0, 1]) {
        for (const a of anchors) {
          const dz = p.z - a.z
          if (dz < 16 || dz > 75 || a.y < p.y + 8) continue
          const side = Math.sign(a.x)
          if (pass === 0 && side === lastSide) continue
          const s = a.y * 0.6 - Math.abs(dz - 42) * 1.2
          if (s > score) { score = s; best = a }
        }
        if (best) break
      }
      return best
    }

    let guard = 0
    while (p.z > stopZ && guard++ < 6000) {
      if (anchor) {
        v.y -= G * DT
        v.z -= 9 * DT // "pumping" keeps momentum going forward
        p.addScaledVector(v, DT)
        d.subVectors(p, anchor)
        const len = d.length()
        if (len > L) {
          d.multiplyScalar(1 / len)
          p.copy(anchor).addScaledVector(d, L)
          const vr = v.dot(d)
          if (vr > 0) v.addScaledVector(d, -vr)
        }
        const held = t - attachT
        if ((p.z < anchor.z - 4 && v.y > 3 && held > 0.55) || held > 2.6) {
          anchor = null
          flightT = 0
          flights++
        }
      } else {
        v.y -= G * DT
        p.addScaledVector(v, DT)
        flightT += DT
        const flipping = flights === flipOnFlight
        const canAttach = flipping ? flightT > 0.9 : flightT > 0.28
        if ((canAttach && v.y < -2) || p.y < 16) {
          const a = pick()
          if (a) {
            anchor = a
            L = Math.min(p.distanceTo(a), 70)
            attachT = t
            lastSide = Math.sign(a.x)
          }
        }
        if (p.y < 9) { p.y = 9; v.y = Math.max(v.y, 4) }
      }
      // keep the hero inside the avenue
      if (Math.abs(p.x) > 13) { p.x = Math.sign(p.x) * 13; if (v.x * p.x > 0) v.x *= -0.2 }
      const hs = Math.hypot(v.x, v.z)
      if (hs > 46) { v.x *= 46 / hs; v.z *= 46 / hs }

      const flipping = !anchor && flights === flipOnFlight
      push({
        p, v, face: hFace(v), anchor, attachT,
        pose: anchor ? 'swing' : flipping ? 'tuck' : 'fly',
        k: flipping ? Math.min(1, flightT / 0.9) : 0,
      })
    }
  }

  /** Smooth arc onto a rooftop, then a superhero landing and a stand-up (the "hold"). */
  function landOn(id: SpecialId, p: THREE.Vector3, v: THREE.Vector3, standFace: THREE.Vector3, flip = false) {
    const { target, side } = roofTarget(id)
    const P0 = p.clone()
    const dist = P0.distanceTo(target)
    const T = THREE.MathUtils.clamp(dist / 30, 0.9, 2.2)
    const P1 = P0.clone().addScaledVector(v, T / 3)
    const P2 = target.clone().add(new THREE.Vector3(0, 16, 0)).lerp(P1, 0.2)
    const curve = new THREE.CubicBezierCurve3(P0, P1, P2, target)
    const n = Math.round(T / DT)
    const prev = P0.clone()
    for (let i = 1; i <= n; i++) {
      const q = curve.getPoint(i / n)
      const vel = q.clone().sub(prev).multiplyScalar(1 / DT)
      prev.copy(q)
      const u = i / n
      const flipping = flip && u > 0.12 && u < 0.62 // dramatic front flip mid-air, before the landing
      push({ p: q, v: vel, face: hFace(vel), anchor: null, attachT: 0, pose: flipping ? 'tuck' : 'fly', k: flipping ? (u - 0.12) / 0.5 : 0 })
    }
    const i0 = samples.length
    const face = standFace.clone().normalize()
    const zero = new THREE.Vector3()
    for (let i = 0; i < 40; i++) push({ p: target, v: zero, face, anchor: null, attachT: 0, pose: 'land', k: i / 39 })
    for (let i = 0; i < 40; i++) push({ p: target, v: zero, face, anchor: null, attachT: 0, pose: 'stand', k: i / 39 })
    holds.push({ id, i0, i1: samples.length - 1, target: target.clone(), side })
    p.copy(target)
    v.set(0, 0, 0)
  }

  function jumpFrom(p: THREE.Vector3, v: THREE.Vector3, side: number) {
    const face = new THREE.Vector3(-side * 0.5, 0, -1).normalize()
    for (let i = 0; i < 18; i++) push({ p, v: new THREE.Vector3(), face, anchor: null, attachT: 0, pose: 'jump', k: i / 17 })
    v.set(-side * 9, 20, -26)
  }

  const p = new THREE.Vector3(2, 52, CITY_START - 70)
  const v = new THREE.Vector3(0, -2, -34)

  // INTRO: swing in, front-flip off the last web, land on the hero rooftop
  swingUntil(p, v, SPECIALS[0].z + 80)
  landOn('hero', p, v, new THREE.Vector3(-1, 0, 0.35), true)
  // → Project 1
  jumpFrom(p, v, 1)
  swingUntil(p, v, SPECIALS[1].z + 75)
  landOn('project-portal', p, v, new THREE.Vector3(1, 0, -0.6))
  // → Project 2
  jumpFrom(p, v, -1)
  swingUntil(p, v, SPECIALS[2].z + 75)
  landOn('project-commerce', p, v, new THREE.Vector3(-1, 0, -0.6))
  // → through the case-study district → contact rooftop
  jumpFrom(p, v, 1)
  swingUntil(p, v, SPECIALS[3].z + 80)
  landOn('contact', p, v, new THREE.Vector3(0.25, 0, -1))

  return { samples, holds }
}

/* --------------------------- Case-study destinations --------------------------- */
const SIGN_Z = [-655, -715, -775, -885, -945, -1005]
export const CASE_SIGNS = SIGN_Z.map((z, i) => {
  const side = i % 2 === 0 ? 1 : -1
  return { index: i, side, position: new THREE.Vector3(side * (ROW1_INNER - 0.6), 34 + (i % 3) * 6, z) }
})
