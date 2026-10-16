import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useState } from 'react'
import { City } from './City'
import { CameraRig } from './CameraRig'
import { Hero } from './Hero'
import { Landmarks } from './Landmarks'
import { isLowDetail } from './runtime'

export function Scene() {
  // drop the glow pass automatically if the device struggles
  const q = typeof location !== 'undefined' ? location.search : ''
  const [fx, setFx] = useState(q.includes('fx') ? true : q.includes('nofx') ? false : !isLowDetail)
  return (
    <Canvas
      className="!fixed inset-0"
      dpr={isLowDetail ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: !isLowDetail, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.3, far: 2600, position: [-6, 118, 236] }}
      aria-label="Animated 3D city with an original web-swinging hero"
      role="img"
    >
      <color attach="background" args={['#05070d']} />
      <fogExp2 attach="fog" args={['#0a0e1c', 0.0042]} />
      <hemisphereLight args={['#6b7cff', '#0b0d14', 0.55]} />
      <directionalLight position={[-200, 300, -400]} intensity={1.6} color="#a9b8ff" />
      <ambientLight intensity={0.15} />

      <CameraRig />
      <City />
      <Hero />
      <Landmarks />

      <PerformanceMonitor onDecline={() => !q.includes('fx') && setFx(false)} />
      <AdaptiveDpr pixelated={false} />
      {fx ? (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.85} luminanceSmoothing={0.2} />
          <Vignette offset={0.25} darkness={0.75} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : null}
    </Canvas>
  )
}
