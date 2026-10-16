import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { heroWorld } from './Hero'
import { holdById, mapScroll, prefersReducedMotion, rt, setUI, track } from './runtime'
import type { SpecialId } from './world'

const smooth = THREE.MathUtils.smoothstep
const damp = (k: number, dt: number) => 1 - Math.exp(-k * dt)

/** Where the camera sits / looks for each rooftop "hold" (k = progress inside the hold). */
function holdFrame(id: SpecialId, k: number, pos: THREE.Vector3, look: THREE.Vector3) {
  const h = holdById(id)
  const t = h.target
  const s = h.side
  switch (id) {
    case 'hero':
      // low hero angle: the hero stands on the right third, the name sits on the left
      pos.set(t.x - s * 7.5, t.y - 0.6, t.z - 3.2)
      look.set(t.x + s * 1.6, t.y + 0.9, t.z - 6.2)
      break
    case 'project-portal':
    case 'project-commerce':
      // across the avenue: tower + hero on one side, hologram in the middle
      pos.set(-s * 4, t.y + 6, t.z - 30)
      look.set(s * 6, t.y + 4, t.z - 14)
      break
    case 'contact': {
      // the hero overlooks the river and the bridge; camera slowly pulls back behind him
      const e = smooth(k, 0.15, 1)
      pos.set(t.x - 4 - 8 * e, t.y + 2 + 9 * e, t.z + 8 + 20 * e)
      look.set(t.x - 14, t.y + 5 - 2 * e, t.z - 120)
      break
    }
  }
}

export function CameraRig() {
  const { camera } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const v = useMemo(() => ({
    pos: new THREE.Vector3(-4, 110, 230), look: new THREE.Vector3(0, 40, -300),
    fPos: new THREE.Vector3(), fLook: new THREE.Vector3(),
    hPos: new THREE.Vector3(), hLook: new THREE.Vector3(),
    iPos: new THREE.Vector3(), iLook: new THREE.Vector3(),
    fwd: new THREE.Vector3(0, 0, -1), tmp: new THREE.Vector3(),
  }), [])
  const intro = useMemo(() => {
    // the moment the hero swings past the camera
    const pass = track.samples[Math.round(2.9 * 60)].p.clone()
    return {
      pass,
      keys: [
        { t: 0, pos: new THREE.Vector3(-6, 118, 236), look: new THREE.Vector3(0, 50, -400) },
        { t: 2.1, pos: new THREE.Vector3(5, 62, pass.z - 14), look: new THREE.Vector3(0, 50, pass.z - 250) },
        { t: 2.7, pos: new THREE.Vector3(-Math.sign(pass.x || 1) * 7, pass.y - 3, pass.z - 24), look: pass.clone() },
      ],
    }
  }, [])
  const heroHold = holdById('hero')
  const shake = useRef(0)

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20)
    // dev hook: window.__camOverride = { pos:[x,y,z], look:[x,y,z], fov } freezes the camera (used to render backdrops)
    const ov = (window as any).__camOverride
    if (ov) { cam.position.set(ov.pos[0], ov.pos[1], ov.pos[2]); cam.lookAt(ov.look[0], ov.look[1], ov.look[2]); cam.fov = ov.fov ?? 50; cam.updateProjectionMatrix(); return }

    /* -------- 1. advance the story: intro clock OR scroll -------- */
    let holdId: SpecialId | null
    let holdW: number
    let holdK = 0
    if (rt.mode === 'intro') {
      const s = track.samples[Math.min(Math.floor(rt.index), track.samples.length - 1)]
      const rate = s.pose === 'tuck' ? 0.42 : 1 // slow-motion during the flip
      rt.introTime += dt
      rt.index = Math.min(rt.index + dt * 60 * rate, heroHold.i1)
      holdId = 'hero'
      holdW = smooth(rt.index, heroHold.i0 - 75, heroHold.i0 + 12)
      if (rt.index > heroHold.i0 + 22) setUI({ nameVisible: true })
      if (rt.index >= heroHold.i1) {
        rt.mode = 'scroll'
        setUI({ introDone: true, chapter: 'home' })
      }
      // scripted camera weight: 1 during the fly-through, fades into the follow cam
      rt.introCam = 1 - smooth(rt.introTime, 3.1, 4.6)
    } else {
      const m = (rt.map = mapScroll(rt.scroll))
      rt.index += (m.index - rt.index) * damp(prefersReducedMotion ? 30 : 8, dt)
      holdId = m.holdId; holdW = m.holdW; holdK = m.holdK
      rt.introCam = Math.max(0, rt.introCam - dt)
      setUI({ chapter: m.chapter, holdId: m.holdW > 0.6 ? m.holdId : null })
    }

    /* -------- 2. follow camera: behind + above the hero, leading its motion -------- */
    const hp = heroWorld.position
    const sample = heroWorld.sample
    const moving = sample && (sample.pose === 'swing' || sample.pose === 'fly' || sample.pose === 'tuck')
    if (moving) v.fwd.lerp(heroWorld.forward, damp(2.5, dt)).normalize()
    const speed = heroWorld.velocity.length()
    v.fPos.copy(hp).addScaledVector(v.fwd, -9.5 - speed * 0.09)
    v.fPos.y += 2.6
    v.fPos.x = THREE.MathUtils.clamp(v.fPos.x + 2.2, -15, 15)
    v.fLook.copy(hp).addScaledVector(v.fwd, 12).addScaledVector(heroWorld.velocity, 0.12)
    v.fPos.y = Math.max(v.fPos.y, 6)

    /* -------- 3. blend with hold framing and the scripted intro -------- */
    let tPos = v.fPos, tLook = v.fLook
    if (holdId && holdW > 0) {
      holdFrame(holdId, holdK, v.hPos, v.hLook)
      const w = smooth(holdW, 0, 1)
      v.hPos.lerpVectors(v.fPos, v.hPos, w)
      v.hLook.lerpVectors(v.fLook, v.hLook, w)
      tPos = v.hPos; tLook = v.hLook
    }
    if (rt.introCam > 0) {
      const t = rt.introTime
      const K = intro.keys
      let a = K[0], b = K[0], u = 0
      for (let i = 0; i < K.length - 1; i++) if (t >= K[i].t) { a = K[i]; b = K[i + 1]; u = (t - a.t) / (b.t - a.t) }
      if (t >= K[K.length - 1].t) { a = b = K[K.length - 1]; u = 0 }
      const e = THREE.MathUtils.smootherstep(Math.min(u, 1), 0, 1)
      v.iPos.lerpVectors(a.pos, b.pos, e)
      v.iLook.lerpVectors(a.look, b.look, e)
      v.iLook.lerp(hp, smooth(t, 2.2, 2.9)) // turn to watch the hero swing past
      v.iPos.lerp(tPos, 1 - rt.introCam)
      v.iLook.lerp(tLook, 1 - rt.introCam)
      tPos = v.iPos; tLook = v.iLook
    }

    const k = rt.introCam > 0.5 ? 6 : 4.2
    v.pos.lerp(tPos, damp(k, dt))
    v.look.lerp(tLook, damp(k + 2, dt))

    /* -------- 4. cinematic touches: speed FOV + landing shake -------- */
    if (!prefersReducedMotion && sample?.pose === 'land' && sample.k < 0.08) shake.current = 1
    shake.current = Math.max(0, shake.current - dt * 3)
    const sh = shake.current * 0.35
    cam.position.copy(v.pos).add(v.tmp.set(
      Math.sin(state.clock.elapsedTime * 47) * sh, Math.sin(state.clock.elapsedTime * 61) * sh, 0))
    cam.lookAt(v.look)
    const targetFov = 50 + THREE.MathUtils.clamp(speed - 18, 0, 26) * 0.35
    cam.fov += (targetFov - cam.fov) * damp(3, dt)
    cam.updateProjectionMatrix()
  })
  return null
}
