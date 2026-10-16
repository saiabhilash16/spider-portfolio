import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { caseStudies } from '../data/content'
import { anchors } from './anchors'
import { holdById, rt } from './runtime'
import { CASE_SIGNS, type SpecialId } from './world'

/** Holographic projector ring that powers on beside each project tower. */
function ProjectorRing({ holdId }: { holdId: SpecialId }) {
  const h = holdById(holdId)
  const ring = useRef<THREE.Mesh>(null!)
  const beam = useRef<THREE.Mesh>(null!)
  const pos = useMemo(() => new THREE.Vector3(-h.side * 1, h.target.y - 4, h.target.z - 20), [h])
  useFrame((st) => {
    const on = rt.map.holdId === holdId && rt.map.holdW > 0.6 && rt.mode === 'scroll'
    ring.current.rotation.z = st.clock.elapsedTime * 0.5
    const s = THREE.MathUtils.lerp(ring.current.scale.x, on ? 1 : 0.001, 0.08)
    ring.current.scale.setScalar(s)
    beam.current.scale.set(s, s, s)
    ;(beam.current.material as THREE.MeshBasicMaterial).opacity = 0.1 * s
  })
  return (
    <group position={pos}>
      <mesh ref={ring} rotation-x={Math.PI / 2}>
        <torusGeometry args={[3.2, 0.07, 8, 64]} />
        <meshBasicMaterial color={[0.4, 2.4, 3]} toneMapped={false} />
      </mesh>
      <mesh ref={beam} position={[0, 7, 0]}>
        <cylinderGeometry args={[6, 3.2, 14, 32, 1, true]} />
        <meshBasicMaterial color={[0.3, 1.6, 2]} transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Glowing billboard frame on a building face for each case-study destination. */
function SignFrame({ i }: { i: number }) {
  const s = CASE_SIGNS[i]
  const color = useMemo(() => new THREE.Color(caseStudies[i].accent).multiplyScalar(2.6), [i])
  return (
    <group position={s.position} rotation-y={s.side > 0 ? -Math.PI / 2 : Math.PI / 2}>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[13, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.12} />
      </mesh>
      {[[0, 4], [0, -4]].map(([x, y], k) => (
        <mesh key={k} position={[x, y, 0]}>
          <boxGeometry args={[13, 0.12, 0.12]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
      {[[-6.5, 0], [6.5, 0]].map(([x, y], k) => (
        <mesh key={k} position={[x, y, 0]}>
          <boxGeometry args={[0.12, 8, 0.12]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

/** Projects every registered DOM anchor onto the screen each frame. */
function AnchorProjector() {
  const { camera, size } = useThree()
  const v = useMemo(() => new THREE.Vector3(), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    camera.getWorldDirection(dir)
    anchors.forEach((a) => {
      v.copy(a.pos).sub(camera.position)
      const dist = v.length()
      const inFront = v.dot(dir) > 0
      v.copy(a.pos).project(camera)
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      const onScreen = inFront && x > -400 && x < size.width + 400 && y > -300 && y < size.height + 300
      const fade = 1 - THREE.MathUtils.smoothstep(dist, a.fadeFrom, a.fadeTo)
      const scale = THREE.MathUtils.clamp(a.refDist / dist, a.minScale, a.maxScale)
      a.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`
      a.el.style.visibility = onScreen && fade > 0.02 ? 'visible' : 'hidden'
      a.el.style.setProperty('--fade', fade.toFixed(3))
      a.el.style.zIndex = String(Math.round(10000 - dist))
    })
  })
  return null
}

export function Landmarks() {
  return (
    <group>
      <ProjectorRing holdId="project-portal" />
      <ProjectorRing holdId="project-commerce" />
      {CASE_SIGNS.map((s) => <SignFrame key={s.index} i={s.index} />)}
      <AnchorProjector />
    </group>
  )
}
