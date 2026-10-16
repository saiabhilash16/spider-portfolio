import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { rt, track } from './runtime'
import { HERO_SCALE, type Pose, type Sample } from './world'

/* ------------------------------------------------------------------------------
 * PROOF-OF-CONCEPT HERO RIG
 * A real joint hierarchy (hips → spine → chest → head / shoulders → elbows,
 * hips → knees) animated in 3D. In production this is replaced by a rigged GLB
 * (Blender / Mixamo) — the same pose logic then drives its animation clips.
 * Original design: charcoal stealth suit, cyan circuit lines, amber visor.
 * ------------------------------------------------------------------------------ */

export const heroWorld = {
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  forward: new THREE.Vector3(0, 0, -1),
  sample: null as Sample | null,
}

type Angles = {
  spineX: number; headX: number
  shRx: number; shRz: number; elR: number
  shLx: number; shLz: number; elL: number
  hipRx: number; hipRz: number; knR: number
  hipLx: number; hipLz: number; knL: number
  drop: number
}
const ZERO: Angles = { spineX: 0, headX: 0, shRx: 0, shRz: 0, elR: 0, shLx: 0, shLz: 0, elL: 0, hipRx: 0, hipRz: 0, knR: 0, hipLx: 0, hipLz: 0, knL: 0, drop: 0 }
const lerpA = (a: Angles, b: Angles, t: number): Angles => {
  const o = { ...a }
  for (const k in a) (o as any)[k] = (a as any)[k] + ((b as any)[k] - (a as any)[k]) * t
  return o
}

/* Right side = +X. Arms/legs hang along -Y. Negative X-rotation swings a limb forward. */
function poseFor(pose: Pose, k: number, s: Sample, time: number): Angles {
  switch (pose) {
    case 'swing': {
      // legs follow the swing: forward when rising, trailing when falling
      const rise = THREE.MathUtils.clamp(s.v.y / 22, -1, 1)
      return { ...ZERO, spineX: 0.1, headX: -0.2,
        shRx: -2.95, shRz: 0.12, elR: -0.08,               // web arm straight up to the anchor
        shLx: 0.5, shLz: -0.75, elL: -0.9,
        hipRx: -0.35 - 0.55 * rise, hipRz: 0.08, knR: 0.5 + 0.4 * Math.max(0, -rise),
        hipLx: -0.15 - 0.75 * rise, hipLz: -0.08, knL: 0.9 }
    }
    case 'fly':
      return { ...ZERO, spineX: -0.15, headX: -0.5,
        shRx: 0.9, shRz: 0.55, elR: -0.3, shLx: 0.9, shLz: -0.55, elL: -0.3,
        hipRx: 0.15, hipRz: 0.12, knR: 0.35, hipLx: -0.45, hipLz: -0.1, knL: 1.3 }
    case 'tuck':
      return { ...ZERO, spineX: 0.7, headX: 0.4,
        shRx: -1.1, shRz: 0.3, elR: -1.7, shLx: -1.1, shLz: -0.3, elL: -1.7,
        hipRx: -2.1, hipRz: 0.1, knR: 2.4, hipLx: -2.1, hipLz: -0.1, knL: 2.4, drop: 0 }
    case 'land': {
      // superhero landing: one knee down, one hand on the roof, then hold
      const crouch: Angles = { ...ZERO, spineX: 0.65, headX: -0.45,
        shRx: -0.55, shRz: 0.35, elR: -0.15, shLx: 0.95, shLz: -0.9, elL: -0.4,
        hipRx: 0.35, hipRz: 0.05, knR: 2.0, hipLx: -1.55, hipLz: -0.1, knL: 2.15, drop: 0.62 }
      return k < 0.6 ? crouch : lerpA(crouch, standPose(time), THREE.MathUtils.smoothstep(k, 0.6, 1))
    }
    case 'stand':
      return standPose(time)
    case 'jump': {
      const crouch: Angles = { ...ZERO, spineX: 0.5, headX: -0.3, shRx: 0.8, shRz: 0.3, shLx: 0.8, shLz: -0.3,
        elR: -0.4, elL: -0.4, hipRx: -1.2, knR: 1.9, hipLx: -1.2, knL: 1.9, drop: 0.5 }
      const reach: Angles = { ...ZERO, shRx: -2.9, shRz: 0.15, shLx: 0.4, shLz: -0.4, hipRx: 0.2, hipLx: -0.3, knL: 0.6 }
      return k < 0.7 ? crouch : lerpA(crouch, reach, (k - 0.7) / 0.3)
    }
  }
}
function standPose(time: number): Angles {
  const b = Math.sin(time * 1.6) * 0.03 // breathing
  return { ...ZERO, spineX: 0.02 + b, headX: -0.05,
    shRx: 0.05, shRz: 0.16, elR: -0.25, shLx: 0.05, shLz: -0.16, elL: -0.25,
    hipRz: 0.06, hipLz: -0.06, knR: 0.05, knL: 0.05 }
}

/* -------------------------------- geometry -------------------------------- *
 * Sculpted from primitives: tapered limbs, muscle volumes, armored panels.
 * Each segment hangs from its joint (pivot at the top, extends along -Y).   */
type M = { suit: THREE.Material; dark: THREE.Material; accent: THREE.Material; plate: THREE.Material }

/** Tapered limb segment with a muscle bulge, a joint cap and a glowing circuit line. */
function Segment({ len, r0, r1, bulge, m, plate = false, line = 1 }: {
  len: number; r0: number; r1: number; bulge: number; m: M; plate?: boolean; line?: number
}) {
  return (
    <>
      <mesh material={m.dark}><sphereGeometry args={[r0 * 1.02, 16, 12]} /></mesh>
      <mesh position={[0, -len / 2, 0]} material={m.suit}>
        <cylinderGeometry args={[r0, r1, len, 18, 1]} />
      </mesh>
      {/* muscle volume */}
      <mesh position={[0, -len * 0.38, 0.005]} scale={[1, 2.6, 0.95]} material={m.suit}>
        <sphereGeometry args={[r0 * bulge, 18, 14]} />
      </mesh>
      {/* armored plate on the front */}
      {plate && (
        <mesh position={[0, -len * 0.42, r0 * 0.78]} rotation-x={0.06} material={m.plate}>
          <boxGeometry args={[r0 * 1.1, len * 0.42, r0 * 0.35]} />
        </mesh>
      )}
      {/* circuit line on the outer side */}
      <mesh position={[line * r0 * 0.98, -len * 0.5, 0]} rotation-z={line * Math.atan2(r0 - r1, len)} material={m.accent}>
        <boxGeometry args={[0.01, len * 0.8, 0.018]} />
      </mesh>
    </>
  )
}

function Hand({ m }: { m: M }) {
  return (
    <group>
      <mesh position={[0, -0.04, 0.005]} material={m.dark}><boxGeometry args={[0.07, 0.08, 0.035]} /></mesh>
      <mesh position={[0, -0.09, 0.012]} rotation-x={0.5} material={m.dark}><boxGeometry args={[0.066, 0.045, 0.032]} /></mesh>
      <mesh position={[0.04, -0.045, 0.02]} rotation-z={-0.5} material={m.dark}><capsuleGeometry args={[0.012, 0.03, 4, 8]} /></mesh>
    </group>
  )
}

export function Hero() {
  const root = useRef<THREE.Group>(null!)
  const body = useRef<THREE.Group>(null!)
  const J = {
    spine: useRef<THREE.Group>(null!), head: useRef<THREE.Group>(null!),
    shR: useRef<THREE.Group>(null!), elR: useRef<THREE.Group>(null!), handR: useRef<THREE.Group>(null!),
    shL: useRef<THREE.Group>(null!), elL: useRef<THREE.Group>(null!),
    hipR: useRef<THREE.Group>(null!), knR: useRef<THREE.Group>(null!),
    hipL: useRef<THREE.Group>(null!), knL: useRef<THREE.Group>(null!),
  }
  const web = useRef<THREE.Mesh>(null!)
  const webGlow = useRef<THREE.Mesh>(null!)
  const rim = useRef<THREE.PointLight>(null!)

  const mats = useMemo(() => ({
    suit: new THREE.MeshStandardMaterial({ color: '#1c2232', roughness: 0.38, metalness: 0.5 }),
    dark: new THREE.MeshStandardMaterial({ color: '#0d1019', roughness: 0.55, metalness: 0.4 }),
    plate: new THREE.MeshStandardMaterial({ color: '#2a3247', roughness: 0.25, metalness: 0.8 }),
    accent: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 2.2, 2.8), toneMapped: false }),
    visor: new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.6, 0.25), toneMapped: false }),
    web: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.6, 3), toneMapped: false }),
    webGlow: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 0.8, 1.1), transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
  }), [])

  const cur = useRef<Angles>({ ...ZERO })
  const q = useMemo(() => new THREE.Quaternion(), [])
  const tmp = useMemo(() => ({
    up: new THREE.Vector3(), fwd: new THREE.Vector3(), right: new THREE.Vector3(),
    m: new THREE.Matrix4(), qt: new THREE.Quaternion(), flip: new THREE.Quaternion(),
    hand: new THREE.Vector3(), dir: new THREE.Vector3(), mid: new THREE.Vector3(),
    p: new THREE.Vector3(), v: new THREE.Vector3(), Y: new THREE.Vector3(0, 1, 0),
  }), [])

  useFrame((state, dtRaw) => {
    if (!root.current) return
    const dt = Math.min(dtRaw, 1 / 20)
    const S = track.samples
    const fi = THREE.MathUtils.clamp(rt.index, 0, S.length - 1)
    const i0 = Math.floor(fi), i1 = Math.min(i0 + 1, S.length - 1), f = fi - i0
    const a = S[i0], b = S[i1]
    const s = f < 0.5 ? a : b

    tmp.p.lerpVectors(a.p, b.p, f)
    tmp.v.lerpVectors(a.v, b.v, f)
    heroWorld.position.copy(tmp.p)
    heroWorld.velocity.copy(tmp.v)
    heroWorld.sample = s

    /* ---------- orientation: up follows the rope while swinging, velocity while flying ---------- */
    const { up, fwd, right } = tmp
    fwd.lerpVectors(a.face, b.face, f).normalize()
    heroWorld.forward.copy(fwd)
    if (s.pose === 'swing' && s.anchor) {
      up.subVectors(s.anchor, tmp.p).normalize()
    } else if (s.pose === 'fly') {
      tmp.dir.copy(tmp.v).normalize()
      up.copy(tmp.Y).lerp(tmp.dir, 0.55).normalize()
    } else {
      up.copy(tmp.Y)
    }
    const f2 = fwd.clone().addScaledVector(up, -fwd.dot(up))
    if (f2.lengthSq() < 1e-4) f2.set(0, 0, -1)
    f2.normalize()
    right.crossVectors(up, f2).normalize()
    tmp.m.makeBasis(right, up, f2)
    tmp.qt.setFromRotationMatrix(tmp.m)
    if (s.pose === 'tuck') {
      // front flip around the hero's own right axis
      tmp.flip.setFromAxisAngle(right, s.k * Math.PI * 2)
      tmp.qt.premultiply(tmp.flip)
      q.copy(tmp.qt)
    } else {
      q.slerp(tmp.qt, 1 - Math.exp(-12 * dt))
    }
    root.current.position.copy(tmp.p)
    root.current.quaternion.copy(q)

    /* ---------- joints: blend toward the target pose ---------- */
    const target = poseFor(s.pose, s.k, s, state.clock.elapsedTime)
    cur.current = lerpA(cur.current, target, 1 - Math.exp(-(s.pose === 'tuck' ? 18 : 10) * dt))
    const A = cur.current
    body.current.position.y = -A.drop
    J.spine.current.rotation.x = A.spineX
    J.head.current.rotation.x = A.headX
    J.shR.current.rotation.set(A.shRx, 0, A.shRz)
    J.elR.current.rotation.x = A.elR
    J.shL.current.rotation.set(A.shLx, 0, A.shLz)
    J.elL.current.rotation.x = A.elL
    J.hipR.current.rotation.set(A.hipRx, 0, A.hipRz)
    J.knR.current.rotation.x = A.knR
    J.hipL.current.rotation.set(A.hipLx, 0, A.hipLz)
    J.knL.current.rotation.x = A.knL

    /* ---------- web line: shoots from the wrist to the anchor ---------- */
    const attached = s.pose === 'swing' && s.anchor
    web.current.visible = webGlow.current.visible = !!attached
    if (attached) {
      J.handR.current.getWorldPosition(tmp.hand)
      const shoot = THREE.MathUtils.clamp((s.t - s.attachT) / 0.14, 0, 1)
      const end = tmp.dir.copy(s.anchor!).sub(tmp.hand).multiplyScalar(shoot).add(tmp.hand)
      const len = end.distanceTo(tmp.hand)
      tmp.mid.addVectors(end, tmp.hand).multiplyScalar(0.5)
      for (const m of [web.current, webGlow.current]) {
        m.position.copy(tmp.mid)
        m.quaternion.setFromUnitVectors(tmp.Y, end.clone().sub(tmp.hand).normalize())
        m.scale.set(1, Math.max(len, 0.001), 1)
      }
    }
    rim.current.position.copy(tmp.p).addScaledVector(fwd, -3).add(tmp.Y.clone().multiplyScalar(4))
  })

  const sc = HERO_SCALE
  const m = mats as unknown as M & { visor: THREE.Material }
  // ?nohero hides the character (used to render clean city backdrops)
  if (typeof location !== 'undefined' && location.search.includes('nohero')) return null
  return (
    <group>
      <group ref={root} scale={sc}>
        <group ref={body}>
          {/* pelvis + belt */}
          <mesh material={m.dark} position={[0, 0.02, 0]} scale={[1.15, 0.8, 0.85]}><sphereGeometry args={[0.13, 18, 14]} /></mesh>
          <mesh material={m.plate} position={[0, 0.07, 0]} rotation-x={Math.PI / 2} scale={[1.05, 0.8, 1]}><torusGeometry args={[0.128, 0.016, 8, 28]} /></mesh>
          <mesh material={m.accent} position={[0, 0.07, 0.112]}><boxGeometry args={[0.04, 0.028, 0.012]} /></mesh>
          <group ref={J.spine}>
            {/* abdomen → chest: V-shaped athletic torso */}
            <mesh material={m.suit} position={[0, 0.17, 0]} scale={[1, 1, 0.78]}><cylinderGeometry args={[0.14, 0.125, 0.2, 20]} /></mesh>
            <mesh material={m.suit} position={[0, 0.37, 0]} scale={[1.32, 1, 0.8]}><sphereGeometry args={[0.165, 24, 18]} /></mesh>
            {/* chest armor plates */}
            <mesh material={m.plate} position={[0.075, 0.4, 0.105]} rotation={[0.15, 0.25, 0]}><boxGeometry args={[0.12, 0.12, 0.03]} /></mesh>
            <mesh material={m.plate} position={[-0.075, 0.4, 0.105]} rotation={[0.15, -0.25, 0]}><boxGeometry args={[0.12, 0.12, 0.03]} /></mesh>
            {/* abs */}
            {[0.24, 0.18, 0.12].map((y) => (
              <mesh key={y} material={m.dark} position={[0, y, 0.1]}><boxGeometry args={[0.11, 0.045, 0.02]} /></mesh>
            ))}
            {/* ORIGINAL emblem: a network node with eight connected links */}
            <group position={[0, 0.41, 0.135]}>
              <mesh material={m.accent}><octahedronGeometry args={[0.026]} /></mesh>
              {[0.5, 1.1, 2.05, 2.65].flatMap((a) => [a, -a]).map((a, k) => (
                <mesh key={k} material={m.accent} position={[Math.sin(a) * 0.045, Math.cos(a) * 0.045, 0]} rotation-z={-a}>
                  <boxGeometry args={[0.006, 0.05, 0.006]} />
                </mesh>
              ))}
            </group>
            {/* back: circuit spine */}
            <mesh material={m.accent} position={[0, 0.3, -0.105]}><boxGeometry args={[0.012, 0.3, 0.01]} /></mesh>
            {/* neck */}
            <mesh material={m.dark} position={[0, 0.56, 0]}><cylinderGeometry args={[0.048, 0.06, 0.09, 14]} /></mesh>
            <group ref={J.head} position={[0, 0.62, 0]}>
              {/* masked head + jaw */}
              <mesh material={m.dark} position={[0, 0.1, 0]} scale={[0.88, 1.06, 0.98]}><sphereGeometry args={[0.112, 24, 18]} /></mesh>
              <mesh material={m.dark} position={[0, 0.035, 0.03]} scale={[0.8, 0.7, 0.85]}><sphereGeometry args={[0.085, 18, 14]} /></mesh>
              {/* hood shell */}
              <mesh material={m.suit} position={[0, 0.115, -0.018]} scale={[0.95, 1, 1.05]}>
                <sphereGeometry args={[0.122, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
              </mesh>
              {/* wraparound amber visor */}
              <mesh material={m.visor} position={[0, 0.112, 0]} rotation={[0.08, Math.PI / 2 - 0.95, 0]}>
                <torusGeometry args={[0.097, 0.014, 8, 24, 1.9]} />
              </mesh>
              {/* cyan forehead line */}
              <mesh material={m.accent} position={[0, 0.2, 0.06]} rotation-x={-0.6}><boxGeometry args={[0.008, 0.07, 0.006]} /></mesh>
            </group>
            {/* ARMS — right arm shoots the web */}
            {([['R', 0.22, 1], ['L', -0.22, -1]] as const).map(([side, x, sgn]) => (
              <group key={side} ref={side === 'R' ? J.shR : J.shL} position={[x, 0.47, 0]}>
                {/* deltoid / shoulder armor */}
                <mesh material={m.plate} position={[sgn * 0.02, 0.01, 0]} scale={[1.1, 0.95, 1]}><sphereGeometry args={[0.072, 18, 14]} /></mesh>
                <Segment len={0.3} r0={0.056} r1={0.045} bulge={0.82} m={m} line={sgn} />
                <group ref={side === 'R' ? J.elR : J.elL} position={[0, -0.3, 0]}>
                  <Segment len={0.27} r0={0.046} r1={0.036} bulge={0.85} m={m} line={sgn} />
                  {/* web-shooter gauntlet */}
                  <mesh material={m.plate} position={[0, -0.2, 0]}><cylinderGeometry args={[0.05, 0.046, 0.09, 16]} /></mesh>
                  <mesh material={m.accent} position={[0, -0.18, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.051, 0.008, 6, 20]} /></mesh>
                  <mesh material={m.accent} position={[0, -0.235, 0.04]}><sphereGeometry args={[0.012, 8, 8]} /></mesh>
                  <group ref={side === 'R' ? J.handR : undefined} position={[0, -0.27, 0]}>
                    <Hand m={m} />
                  </group>
                </group>
              </group>
            ))}
          </group>
          {/* LEGS */}
          {([['R', 0.1, 1], ['L', -0.1, -1]] as const).map(([side, x, sgn]) => (
            <group key={side} ref={side === 'R' ? J.hipR : J.hipL} position={[x, -0.02, 0]}>
              <Segment len={0.44} r0={0.078} r1={0.056} bulge={0.92} m={m} plate line={sgn} />
              <group ref={side === 'R' ? J.knR : J.knL} position={[0, -0.44, 0]}>
                {/* knee guard */}
                <mesh material={m.plate} position={[0, 0, 0.045]} scale={[1, 1.2, 0.6]}><sphereGeometry args={[0.05, 14, 10]} /></mesh>
                <Segment len={0.42} r0={0.058} r1={0.04} bulge={0.95} m={m} line={sgn} />
                {/* boot */}
                <mesh material={m.dark} position={[0, -0.36, 0]}><cylinderGeometry args={[0.045, 0.05, 0.12, 14]} /></mesh>
                <mesh material={m.dark} position={[0, -0.425, 0.045]}><boxGeometry args={[0.085, 0.055, 0.19]} /></mesh>
                <mesh material={m.accent} position={[0, -0.45, 0.14]}><boxGeometry args={[0.07, 0.008, 0.01]} /></mesh>
              </group>
            </group>
          ))}
        </group>
      </group>
      {/* web line (unit-height cylinder, stretched each frame) */}
      <mesh ref={web} material={mats.web}>
        <cylinderGeometry args={[0.045, 0.045, 1, 6]} />
      </mesh>
      <mesh ref={webGlow} material={mats.webGlow}>
        <cylinderGeometry args={[0.22, 0.22, 1, 8]} />
      </mesh>
      <pointLight ref={rim} color="#22D3EE" intensity={70} distance={14} decay={2} />
    </group>
  )
}
