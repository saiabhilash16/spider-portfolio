import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildings, city, isLowDetail } from './runtime'
import { AVENUE_HALF, CITY_END, CITY_START } from './world'

const SHORE = CITY_END - 14 // where Manhattan ends and the river begins

/* ---------------- Buildings: ONE instanced mesh, windows drawn by a shader ---------------- */
const buildingVert = /* glsl */ `
  attribute vec3 aSize;
  attribute float aSeed;
  attribute vec3 aAccent;
  varying vec3 vLocal;      // position in "meters" inside the building
  varying vec3 vNormalW;
  varying vec3 vWorld;
  varying float vSeed;
  varying vec3 vAccent;
  varying vec3 vSize;
  #include <fog_pars_vertex>
  void main() {
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vLocal = (position + vec3(0.5, 0.0, 0.5)) * aSize;
    vNormalW = normalize(mat3(modelMatrix * instanceMatrix) * normal);
    vSeed = aSeed; vAccent = aAccent; vSize = aSize;
    vec4 mvPosition = viewMatrix * world;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const buildingFrag = /* glsl */ `
  uniform vec3 uMoonDir;
  uniform float uTime;
  varying vec3 vLocal;
  varying vec3 vNormalW;
  varying vec3 vWorld;
  varying float vSeed;
  varying vec3 vAccent;
  varying vec3 vSize;
  #include <fog_pars_fragment>
  float hash(vec2 p) {            // sin-free hash: stable on every GPU
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 base = mix(vec3(0.010, 0.012, 0.022), vec3(0.018, 0.022, 0.036), vSeed);
    float moon = max(dot(n, normalize(uMoonDir)), 0.0);
    vec3 col = base * (0.6 + 1.1 * moon) + vec3(0.004, 0.006, 0.014) * (n.y * 0.5 + 0.5);

    if (abs(n.y) < 0.5) {
      float u = abs(n.x) > 0.5 ? vLocal.z : vLocal.x;
      vec2 cell = vec2(u / 2.4, vLocal.y / 3.2);
      vec2 id = floor(cell);
      vec2 f = fract(cell);
      // fade the window grid into an average glow when it gets tiny on screen (anti-aliasing)
      float fw = max(fwidth(cell.x), fwidth(cell.y));
      float far = smoothstep(0.18, 0.7, fw);
      float win = step(0.18, f.x) * step(f.x, 0.82) * step(0.22, f.y) * step(f.y, 0.72);
      float r = hash(id + vec2(vSeed * 97.0, vSeed * 41.0));
      float on = step(0.80 - vSeed * 0.1, r);
      float flicker = 0.9 + 0.1 * sin(uTime * 1.7 + r * 30.0);
      vec3 warm = vec3(1.0, 0.52, 0.18);
      vec3 cool = vec3(0.35, 0.78, 1.0);
      vec3 wc = mix(warm, cool, step(0.84, hash(id + 7.3))) * (0.55 + r * 0.8) * flicker;
      vec3 glass = vec3(0.008, 0.012, 0.022);
      vec3 near = mix(col, glass, win * 0.7) + win * on * wc * 1.35;
      vec3 avg = col * 0.8 + vec3(0.9, 0.5, 0.22) * 0.075;
      col = mix(near, avg, far);
      col *= 0.92 + 0.08 * step(0.08, fract(u / 7.2));
      float crown = step(vSize.y - 0.9, vLocal.y) * step(vLocal.y, vSize.y - 0.55);
      col += vAccent * crown * 2.6;
    } else if (n.y > 0.5) {
      col = vec3(0.014, 0.016, 0.022) * (0.8 + 0.4 * moon);
    }
    col += vec3(0.30, 0.16, 0.06) * exp(-vWorld.y * 0.09) * 0.25;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

function Buildings() {
  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1)
    geo.translate(0, 0.5, 0)
    const n = buildings.length
    const size = new Float32Array(n * 3)
    const seed = new Float32Array(n)
    const accent = new Float32Array(n * 3)
    buildings.forEach((b, i) => {
      size.set([b.w, b.h, b.d], i * 3)
      seed[i] = b.seed
      accent.set(b.accent, i * 3)
    })
    geo.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 3))
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 1))
    geo.setAttribute('aAccent', new THREE.InstancedBufferAttribute(accent, 3))
    const mat = new THREE.ShaderMaterial({
      vertexShader: buildingVert,
      fragmentShader: buildingFrag,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        { uMoonDir: { value: new THREE.Vector3(-0.4, 0.6, -0.7) }, uTime: { value: 0 } },
      ]),
    })
    const m = new THREE.InstancedMesh(geo, mat, n)
    const o = new THREE.Object3D()
    buildings.forEach((b, i) => {
      o.position.set(b.x, 0, b.z)
      o.scale.set(b.w, b.h, b.d)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.frustumCulled = false
    return m
  }, [])
  useFrame((_, dt) => {
    ;(mesh.material as THREE.ShaderMaterial).uniforms.uTime.value += dt
  })
  return <primitive object={mesh} />
}

/* ---------------- Street: ground, lane markings, lamps + fake light pools ---------------- */
function Street() {
  const length = CITY_START + 100 - SHORE
  const midZ = (CITY_START + 100 + SHORE) / 2
  const lamps = useMemo(() => {
    const arr: [number, number][] = []
    for (let z = CITY_START; z > CITY_END; z -= 32) arr.push([-AVENUE_HALF + 1, z], [AVENUE_HALF - 1, z - 16])
    return arr
  }, [])
  const poolTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grd.addColorStop(0, 'rgba(255,170,90,0.55)')
    grd.addColorStop(1, 'rgba(255,170,90,0)')
    g.fillStyle = grd
    g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
  const dashes = useMemo(() => {
    const arr: number[] = []
    for (let z = CITY_START; z > CITY_END; z -= 12) arr.push(z)
    return arr
  }, [])
  const lampRef = useRef<THREE.InstancedMesh>(null!)
  const poleRef = useRef<THREE.InstancedMesh>(null!)
  const poolRef = useRef<THREE.InstancedMesh>(null!)
  const dashRef = useRef<THREE.InstancedMesh>(null!)
  useEffect(() => {
    const o = new THREE.Object3D()
    lamps.forEach(([x, z], i) => {
      o.position.set(x, 9, z); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); o.updateMatrix()
      lampRef.current.setMatrixAt(i, o.matrix)
      o.position.set(x, 4.5, z); o.updateMatrix()
      poleRef.current.setMatrixAt(i, o.matrix)
      o.position.set(x * 0.8, 0.05, z); o.rotation.set(-Math.PI / 2, 0, 0); o.updateMatrix()
      poolRef.current.setMatrixAt(i, o.matrix)
    })
    dashes.forEach((z, i) => {
      o.position.set(0, 0.03, z); o.rotation.set(-Math.PI / 2, 0, 0); o.updateMatrix()
      dashRef.current.setMatrixAt(i, o.matrix)
    })
    ;[lampRef, poleRef, poolRef, dashRef].forEach((r) => (r.current.instanceMatrix.needsUpdate = true))
  }, [lamps, dashes])
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, midZ]}>
        <planeGeometry args={[700, length]} />
        <meshStandardMaterial color="#05070c" roughness={0.85} metalness={0.15} />
      </mesh>
      <instancedMesh ref={lampRef} args={[undefined, undefined, lamps.length]} frustumCulled={false}>
        <sphereGeometry args={[0.5, 10, 10]} />
        <meshBasicMaterial color={[3.2, 2.0, 1.1]} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={poleRef} args={[undefined, undefined, lamps.length]} frustumCulled={false}>
        <boxGeometry args={[0.25, 9, 0.25]} />
        <meshStandardMaterial color="#141826" />
      </instancedMesh>
      <instancedMesh ref={poolRef} args={[undefined, undefined, lamps.length]} frustumCulled={false}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial map={poolTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      <instancedMesh ref={dashRef} args={[undefined, undefined, dashes.length]} frustumCulled={false}>
        <planeGeometry args={[0.3, 4]} />
        <meshBasicMaterial color="#6b7280" />
      </instancedMesh>
    </group>
  )
}

/* ---------------- Traffic: instanced cars with head/tail lights ---------------- */
function Traffic() {
  const count = isLowDetail ? 50 : 130
  const cars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const lane = [-11, -6, 6, 11][i % 4]
        const dir = lane < 0 ? 1 : -1
        return { x: lane, z: CITY_END + Math.random() * (CITY_START - CITY_END), dir, speed: 14 + Math.random() * 12 }
      }),
    [count],
  )
  const body = useRef<THREE.InstancedMesh>(null!)
  const head = useRef<THREE.InstancedMesh>(null!)
  const tail = useRef<THREE.InstancedMesh>(null!)
  const o = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    // ~55% yellow cabs, the rest dark sedans
    const yellow = new THREE.Color('#F2B705'), dark = new THREE.Color('#141824')
    cars.forEach((_, i) => body.current.setColorAt(i, (i * 7919) % 100 < 55 ? yellow : dark))
    body.current.instanceColor!.needsUpdate = true
  }, [cars])
  useFrame((_, dt) => {
    const span = CITY_START - CITY_END
    cars.forEach((c, i) => {
      c.z += c.dir * c.speed * Math.min(dt, 0.05)
      if (c.z > CITY_START) c.z -= span
      if (c.z < CITY_END) c.z += span
      o.position.set(c.x, 0.75, c.z); o.updateMatrix(); body.current.setMatrixAt(i, o.matrix)
      o.position.set(c.x, 0.7, c.z + c.dir * 2.25); o.updateMatrix(); head.current.setMatrixAt(i, o.matrix)
      o.position.set(c.x, 0.8, c.z - c.dir * 2.25); o.updateMatrix(); tail.current.setMatrixAt(i, o.matrix)
    })
    body.current.instanceMatrix.needsUpdate = true
    head.current.instanceMatrix.needsUpdate = true
    tail.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group>
      <instancedMesh ref={body} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[2, 1.2, 4.4]} />
        <meshStandardMaterial color="#ffffff" metalness={0.55} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={head} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[1.7, 0.25, 0.1]} />
        <meshBasicMaterial color={[4, 3.6, 3]} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={tail} args={[undefined, undefined, count]} frustumCulled={false}>
        <boxGeometry args={[1.7, 0.25, 0.1]} />
        <meshBasicMaterial color={[3.5, 0.15, 0.2]} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}

/* ---------------- Sky dome + moon ---------------- */
function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `
          varying vec3 vDir;
          float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
          void main(){
            float h = clamp(vDir.y, -0.1, 1.0);
            vec3 top = vec3(0.012, 0.016, 0.04);
            vec3 mid = vec3(0.05, 0.065, 0.14);
            vec3 glow = vec3(0.22, 0.12, 0.1);
            vec3 col = mix(mid, top, smoothstep(0.0, 0.55, h));
            col += glow * exp(-max(h,0.0) * 14.0) * 0.8;
            vec3 g = floor(vDir * 420.0);
            float s = step(0.9975, hash(g)) * smoothstep(0.1, 0.5, h);
            col += vec3(s) * 0.9;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [],
  )
  const dome = useRef<THREE.Mesh>(null!)
  // the sky dome travels with the camera so it is never clipped by the far plane
  useFrame(({ camera }) => dome.current.position.copy(camera.position))
  return (
    <group>
      <mesh ref={dome} material={mat} frustumCulled={false}>
        <sphereGeometry args={[2000, 32, 16]} />
      </mesh>
      <mesh position={[-420, 380, -1500]}>
        <sphereGeometry args={[46, 32, 32]} />
        <meshBasicMaterial color={[2.2, 2.3, 2.6]} toneMapped={false} fog={false} />
      </mesh>
    </group>
  )
}


/* ---------------- NYC rooftops: water towers + landmark spires with aircraft lights ---------------- */
function Rooftops() {
  const { waterTowers, spires } = city
  const tank = useRef<THREE.InstancedMesh>(null!)
  const cap = useRef<THREE.InstancedMesh>(null!)
  const legs = useRef<THREE.InstancedMesh>(null!)
  const beacon = useRef<THREE.InstancedMesh>(null!)
  useEffect(() => {
    const o = new THREE.Object3D()
    waterTowers.forEach((w, i) => {
      o.scale.set(w.r, w.r, w.r)
      o.position.set(w.x, w.y + 3.2 * w.r, w.z); o.updateMatrix(); tank.current.setMatrixAt(i, o.matrix)
      o.position.set(w.x, w.y + 4.9 * w.r, w.z); o.updateMatrix(); cap.current.setMatrixAt(i, o.matrix)
      o.position.set(w.x, w.y + 1.1 * w.r, w.z); o.updateMatrix(); legs.current.setMatrixAt(i, o.matrix)
    })
    spires.forEach((sp, i) => {
      o.scale.set(1, 1, 1); o.position.set(sp.x, sp.y + sp.h, sp.z); o.updateMatrix(); beacon.current.setMatrixAt(i, o.matrix)
    })
    ;[tank, cap, legs, beacon].forEach((r) => (r.current.instanceMatrix.needsUpdate = true))
  }, [waterTowers, spires])
  const beaconMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.2, 0.15), toneMapped: false }), [])
  useFrame(({ clock }) => {
    const on = Math.sin(clock.elapsedTime * 3) > 0.2
    beaconMat.color.setRGB(on ? 4 : 0.4, on ? 0.2 : 0.02, on ? 0.15 : 0.02)
  })
  const n = Math.max(waterTowers.length, 1)
  return (
    <group>
      <instancedMesh ref={tank} args={[undefined, undefined, n]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 3.2, 14]} />
        <meshStandardMaterial color="#3a2a20" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={cap} args={[undefined, undefined, n]} frustumCulled={false}>
        <coneGeometry args={[1.1, 1.3, 14]} />
        <meshStandardMaterial color="#1d1714" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={legs} args={[undefined, undefined, n]} frustumCulled={false}>
        <cylinderGeometry args={[0.75, 0.9, 2.2, 6, 1, true]} />
        <meshStandardMaterial color="#141519" wireframe />
      </instancedMesh>
      {spires.map((sp, i) => (
        <mesh key={i} position={[sp.x, sp.y + sp.h / 2, sp.z]}>
          <coneGeometry args={[sp.r, sp.h, 8]} />
          <meshStandardMaterial color="#8d97ab" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      <instancedMesh ref={beacon} args={[undefined, undefined, Math.max(spires.length, 1)]} material={beaconMat} frustumCulled={false}>
        <sphereGeometry args={[0.9, 10, 10]} />
      </instancedMesh>
    </group>
  )
}

/* ---------------- Crosswalk stripes at every intersection ---------------- */
function Crosswalks() {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const stripes = useMemo(() => {
    const out: [number, number][] = []
    for (const c of [150, -110, -380, -620, -840, -1180]) for (const zz of [c + 11, c - 11]) for (let x = -14; x <= 14; x += 2.4) out.push([x, zz])
    return out
  }, [])
  useEffect(() => {
    const o = new THREE.Object3D()
    stripes.forEach(([x, z], i) => { o.position.set(x, 0.04, z); o.rotation.set(-Math.PI / 2, 0, 0); o.updateMatrix(); ref.current.setMatrixAt(i, o.matrix) })
    ref.current.instanceMatrix.needsUpdate = true
  }, [stripes])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, stripes.length]} frustumCulled={false}>
      <planeGeometry args={[1.2, 5]} />
      <meshBasicMaterial color="#9ca3af" />
    </instancedMesh>
  )
}

/* ---------------- The river, moonlight on the water, and a lit suspension bridge ---------------- */
function RiverAndBridge() {
  const bridgeZ = -1640
  const span = 330 // distance between the two towers
  const deckY = 42
  const towerH = 128
  const cable = useMemo(() => {
    // main cable: anchor → tower → sag → tower → anchor
    const pts: THREE.Vector3[] = []
    const xs = [-700, -span / 2, span / 2, 700]
    const ys = [deckY + 2, towerH, towerH, deckY + 2]
    for (let seg = 0; seg < 3; seg++) {
      for (let i = 0; i <= 30; i++) {
        const t = i / 30
        const x = xs[seg] + (xs[seg + 1] - xs[seg]) * t
        let y = ys[seg] + (ys[seg + 1] - ys[seg]) * t
        if (seg === 1) y = towerH - (towerH - deckY - 6) * 4 * t * (1 - t) // parabolic sag
        else y -= 18 * 4 * t * (1 - t) * 0.5
        pts.push(new THREE.Vector3(x, y, 0))
      }
    }
    return new THREE.CatmullRomCurve3(pts)
  }, [])
  const lights = useRef<THREE.InstancedMesh>(null!)
  const nLights = 120
  useEffect(() => {
    const o = new THREE.Object3D()
    for (let i = 0; i < nLights; i++) {
      const p = cable.getPoint(i / (nLights - 1))
      for (const side of [0, 1]) {
        o.position.set(p.x, p.y, side ? -9 : 9); o.updateMatrix()
        lights.current.setMatrixAt(i * 2 + side, o.matrix)
      }
    }
    lights.current.instanceMatrix.needsUpdate = true
  }, [cable])
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2b2f3a', roughness: 0.9, fog: false }), [])
  return (
    <group>
      {/* water */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.5, SHORE - 900]}>
        <planeGeometry args={[4000, 1800]} />
        <meshStandardMaterial color="#060b16" roughness={0.18} metalness={0.6} />
      </mesh>
      {/* moonlight streak on the water */}
      <mesh rotation-x={-Math.PI / 2} position={[-300, -1.2, SHORE - 650]} rotation-z={0.35}>
        <planeGeometry args={[40, 1200]} />
        <meshBasicMaterial color={[0.35, 0.42, 0.6]} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </mesh>
      {/* the bridge (fog off so it reads as a silhouette across the river) */}
      <group position={[0, 0, bridgeZ]}>
        <mesh material={stone} position={[0, deckY, 0]}><boxGeometry args={[1500, 4, 20]} /></mesh>
        {[-span / 2, span / 2].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[-8, 8].map((z) => (
              <mesh key={z} material={stone} position={[0, towerH / 2, z]}><boxGeometry args={[10, towerH, 5]} /></mesh>
            ))}
            {[deckY + 22, towerH - 18, towerH - 2].map((y) => (
              <mesh key={y} material={stone} position={[0, y, 0]}><boxGeometry args={[10, 8, 21]} /></mesh>
            ))}
          </group>
        ))}
        {[-9, 9].map((z) => (
          <mesh key={z} position={[0, 0, z]}>
            <tubeGeometry args={[cable, 200, 0.5, 6, false]} />
            <meshBasicMaterial color="#3b4252" fog={false} />
          </mesh>
        ))}
        <instancedMesh ref={lights} args={[undefined, undefined, nLights * 2]} frustumCulled={false}>
          <sphereGeometry args={[0.9, 8, 8]} />
          <meshBasicMaterial color={[3.2, 2.6, 1.6]} toneMapped={false} fog={false} />
        </instancedMesh>
      </group>
    </group>
  )
}

export function City() {
  return (
    <group>
      <Sky />
      <Buildings />
      <Street />
      <Traffic />
      <Rooftops />
      <Crosswalks />
      <RiverAndBridge />
    </group>
  )
}
