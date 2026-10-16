import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SWING from './swing_path.json'
import { cloneCharacter, type LoadedCharacter } from './characterAsset'

gsap.registerPlugin(ScrollTrigger)

/* =====================================================================================
 *  NYC SWING — the opening of the story, layered over the existing city scene.
 *  While the city emerges (first 22 % of the opening scroll), Spider-Man swings into the
 *  skyline with the approved two-web swing (bones + root path exported from Blender),
 *  away from the camera, before the existing rooftop hero shot takes over.
 * ===================================================================================== */

const END = .22                         // share of the opening scroll used by the swing
const reduced = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
type F = { q: number[]; hips: number[] }
const FR = (SWING as unknown as { fps: number; frames: F[] }).frames
const FPS = 24, DUR = (FR.length - 1) / FPS
const B2T = (a: number[]) => new THREE.Vector3(a[0], a[2], -a[1])
const B2Tq = (q: number[]) => new THREE.Quaternion(q[1], q[3], -q[2], q[0]).normalize()
// approved swing test timing (seconds) and web anchors (Blender metres)
const W1 = { shoot: .55, att: .75, rel: 3.225, a: B2T([17, 34, 97]), hand: /RightHand$/ }
const W2 = { shoot: 4.525, att: 4.745, rel: 99, a: B2T([-17, 89.7, 95]), hand: /LeftHand$/ }

function Hero({ c, prog }: { c: LoadedCharacter; prog: React.MutableRefObject<number> }) {
  const g = useRef<THREE.Group>(null)
  const { model, mixer, act, hips, hands, webs } = useMemo(() => {
    const model = c.scene
    model.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.frustumCulled = false })
    const mixer = new THREE.AnimationMixer(model)
    const clip = c.clips.find((x) => x.name === 'Swing')
    const act = clip ? mixer.clipAction(clip) : null; if (act) { act.play(); act.paused = true }
    let hips: THREE.Object3D | null = null; const hands: Record<string, THREE.Object3D> = {}
    model.traverse((o) => { if (!hips && /Hips$/.test(o.name)) hips = o; if (W1.hand.test(o.name) && !hands.R) hands.R = o; if (W2.hand.test(o.name) && !hands.L) hands.L = o })
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.5, 1.5, 1.6), toneMapped: false })
    const webs = [0, 1].map(() => new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1, 6, 1, true), mat))
    return { model, mixer, act, hips: hips as THREE.Object3D | null, hands, webs }
  }, [c])
  const cur = useRef(0), hp = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    cur.current += (prog.current - cur.current) * (1 - Math.exp(-(reduced ? 20 : 8) * Math.min(dt, .1)))
    const t = Math.min(DUR, cur.current * DUR)
    const f = Math.min(FR.length - 1.001, t * FPS), i = Math.floor(f), k = f - i
    const grp = g.current!; if (!grp) return
    grp.position.copy(B2T(FR[i].hips)).lerp(B2T(FR[i + 1].hips), k)
    grp.quaternion.copy(B2Tq(FR[i].q)).slerp(B2Tq(FR[i + 1].q), k)
    if (act) act.time = t
    mixer.update(0)
    model.position.set(0, 0, 0); grp.updateMatrixWorld(true)
    if (hips) { hips.getWorldPosition(hp); grp.worldToLocal(hp); model.position.copy(hp).negate(); grp.updateMatrixWorld(true) }
    // webs: shoot out to the anchor, stay taut through the swing, let go at release
    ;[W1, W2].forEach((w, n) => {
      const web = webs[n], hand = hands[n ? 'L' : 'R']
      const on = t >= w.shoot && t < w.rel && hand
      web.visible = !!on; if (!on) return
      hand!.getWorldPosition(hp)
      const end = hp.clone().lerp(w.a, Math.min(1, (t - w.shoot) / (w.att - w.shoot)))
      web.position.copy(hp).add(end).multiplyScalar(.5); web.scale.set(1, hp.distanceTo(end), 1)
      web.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(hp).normalize())
    })
  })
  return (
    <>
      <group ref={g}>
        <primitive object={model} />
        <pointLight position={[-1.6, 1.4, 2]} intensity={40} distance={10} color="#dfe6ff" />
        <pointLight position={[1.8, .5, -2]} intensity={26} distance={9} color="#ff9b7a" />
      </group>
      {webs.map((w, i) => <primitive key={i} object={w} />)}
    </>
  )
}

export function NYCSwing() {
  const [c, setC] = useState<LoadedCharacter | null>(null)
  const [on, setOn] = useState(true)
  const prog = useRef(0)
  const wrap = useRef<HTMLDivElement>(null)
  useEffect(() => { let dead = false; cloneCharacter().then((x) => { if (!dead) setC(x) }); return () => { dead = true } }, [])
  useLayoutEffect(() => {
    const track = document.querySelector('[data-scene-marker="rooftop"]')
    if (!track) return
    const st = ScrollTrigger.create({
      trigger: track, start: 'top top', end: 'bottom bottom',
      onUpdate: (s) => {
        prog.current = Math.min(1, s.progress / END)
        setOn(s.progress < END + .02)
        // he swings off into the city: fade over the last stretch
        if (wrap.current) wrap.current.style.opacity = String(1 - THREE.MathUtils.smoothstep(prog.current, .82, 1))
      },
    })
    return () => st.kill()
  }, [c])
  if (!c) return null
  return (
    <div ref={wrap} className="pointer-events-none fixed inset-0 z-[6]" style={{ visibility: on ? 'visible' : 'hidden' }} aria-hidden>
      <Canvas frameloop={on ? 'always' : 'never'} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 50, near: .1, far: 500, position: [1.2, 79.5, 7.5] }} onCreated={({ camera }) => camera.lookAt(0, 73, -55)}>
        <hemisphereLight args={["#dfe6ff", "#2a1830", 2.4]} /><ambientLight intensity={.5} />
        <directionalLight position={[-4, 8, 6]} intensity={2.6} color="#eef2ff" />
        <Hero c={c} prog={prog} />
      </Canvas>
    </div>
  )
}
