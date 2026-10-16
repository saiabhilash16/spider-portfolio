import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile } from '../data/content'
import { SCENE1 } from './scene1.config'
import { frag, vert } from './shader'

gsap.registerPlugin(ScrollTrigger)

/* =====================================================================================
 *  SCENE 1 — cinematic introduction (fan-tribute theme). Route: #/
 *  Artwork-agnostic: every image comes from an asset slot (see scene1.config.ts).
 *  Empty slots render a LABELLED TEST CARD — never a fake character.
 * ===================================================================================== */

const reduced = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const isMobile = () => innerWidth < 768
const SCREENS = 3
const DIR = import.meta.env.VITE_FLAT === '1' ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}assets/tribute/scene1/`

type Img = HTMLImageElement | HTMLCanvasElement
const load = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })

/* ---------- labelled test cards for empty slots (verification only) ---------- */
function card(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  draw(c.getContext('2d')!); return c
}
function label(g: CanvasRenderingContext2D, x: number, y: number, lines: string[], size = 44) {
  g.textAlign = 'center'
  lines.forEach((l, i) => { g.font = `${i ? 400 : 700} ${i ? size * .55 : size}px monospace`; g.fillStyle = i ? 'rgba(255,255,255,.7)' : '#ff3b4f'; g.fillText(l, x, y + i * size * 1.1) })
}
const testSkyline = () => card(2560, 1440, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 1440); gr.addColorStop(0, '#0a0d16'); gr.addColorStop(1, '#2a3346'); g.fillStyle = gr; g.fillRect(0, 0, 2560, 1440)
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2
  for (let i = -20; i <= 20; i++) { g.beginPath(); g.moveTo(1280, 760); g.lineTo(1280 + i * 160, 1440); g.stroke() }   // perspective floor
  for (let k = 1; k < 12; k++) { const y = 760 + Math.pow(k / 12, 2) * 680; g.beginPath(); g.moveTo(0, y); g.lineTo(2560, y); g.stroke() }
  for (let x = 0; x <= 2560; x += 160) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 760); g.globalAlpha = .4; g.stroke(); g.globalAlpha = 1 }
  label(g, 1280, 420, ['SLOT · skyline.jpg', 'New York skyline/street at night · ≥ 3840×2160', 'public/assets/tribute/scene1/'])
})
const testHero = () => card(1500, 2000, (g) => {
  g.setLineDash([24, 16]); g.lineWidth = 6; g.strokeStyle = '#ff3b4f'; g.strokeRect(40, 40, 1420, 1920)
  const fx = SCENE1.composition.eye.x * 1500, fy = SCENE1.composition.eye.y * 2000
  g.setLineDash([]); g.lineWidth = 4; g.beginPath(); g.arc(fx, fy, 120, 0, 6.283); g.moveTo(fx - 200, fy); g.lineTo(fx + 200, fy); g.moveTo(fx, fy - 200); g.lineTo(fx, fy + 200); g.stroke()
  g.fillStyle = 'rgba(255,59,79,.07)'; g.fillRect(40, 40, 1420, 1920)
  label(g, 750, 1100, ['SLOT · hero.png', 'transparent cut-out · ≥ 2400×3200', 'crosshair = eye point (config)'], 64)
})
const testMask = () => card(2560, 1440, (g) => {
  const gr = g.createRadialGradient(1280, 720, 50, 1280, 720, 1400); gr.addColorStop(0, '#3a0d14'); gr.addColorStop(1, '#07080c'); g.fillStyle = gr; g.fillRect(0, 0, 2560, 1440)
  g.strokeStyle = '#ff3b4f'; g.lineWidth = 6; g.setLineDash([24, 16]); g.beginPath(); g.ellipse(1280, 720, 760, 400, -.15, 0, 6.283); g.stroke()
  label(g, 1280, 700, ['SLOT · eye-closeup.jpg', 'extreme close-up of the eye lens · ≥ 3840×2160'])
})

/** The city / name / eye unit of the story (scenes 3 + 4). `first` = it opens the story (café disabled). */
export function Scene1({ first = true, preview = false }: { first?: boolean; preview?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const U = useRef<Record<string, { value: any }> | null>(null)
  const [ready, setReady] = useState(false)
  const [missing, setMissing] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  const active = useRef(true)

  /* ---------------- WebGL ---------------- */
  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ canvas: canvas.current!, antialias: false, powerPreference: 'high-performance' })
    const dpr = Math.min(devicePixelRatio, isMobile() ? 1.5 : 2)
    renderer.setPixelRatio(dpr)
    const blank = new THREE.Texture()
    const v2 = (x = 1, y = 1) => ({ value: new THREE.Vector2(x, y) })
    const u: Record<string, { value: any }> = {
      uRes: v2(), uTime: { value: 0 }, uMouse: v2(0, 0), uDpr: { value: dpr },
      tSky: { value: blank }, uSkySize: v2(16, 9), tSkyD: { value: blank }, uHasSkyD: { value: 0 }, uSkyFocus: v2(SCENE1.composition.skylineFocus.x, SCENE1.composition.skylineFocus.y),
      tHero: { value: blank }, uHeroSize: v2(3, 4), tHeroD: { value: blank }, uHasHeroD: { value: 0 },
      tMask: { value: blank }, uHasMask: { value: 0 }, uCrop: { value: new THREE.Vector4(...SCENE1.composition.closeupCrop) }, tLens: { value: blank }, uHasLens: { value: 0 }, uLensC: v2(SCENE1.composition.lensInCrop.x, SCENE1.composition.lensInCrop.y), tRefl: { value: blank }, uReflSize: v2(16, 9), uReflect: { value: 0 }, tFg: { value: blank }, uFgSize: v2(16, 9), uHasFg: { value: 0 }, uTraffic: { value: 0 }, uTrafficY: { value: SCENE1.composition.trafficY }, uSynthTraffic: { value: SCENE1.composition.syntheticTraffic ? 1 : 0 }, uMaxZoom: { value: 5 },
      uReveal: { value: 0 }, uHeroIn: { value: 0 }, uPush: { value: 0 }, uMaskMix: { value: 0 }, uGlitch: { value: 0 }, uStrips: { value: 0 }, uSweep: { value: 0 },
      uMono: { value: SCENE1.look.backgroundMono }, uHalftone: { value: SCENE1.look.halftone }, uGrain: { value: SCENE1.look.grain },
      uHeroX: { value: 0 }, uHeroH: { value: 0 }, uFace: v2(SCENE1.composition.eye.x, SCENE1.composition.eye.y), uPortal: { value: 0 },
    }
    U.current = u
    const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: u })
    const scene = new THREE.Scene(); scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const resize = () => {
      renderer.setSize(innerWidth, innerHeight, false)
      u.uRes.value.set(innerWidth * dpr, innerHeight * dpr)
      const m = isMobile(), c = SCENE1.composition
      u.uHeroX.value = m ? c.heroXMobile : c.heroX
      u.uHeroH.value = m ? c.heroHeightMobile : c.heroHeight
      // zoom so the lens ends at lensFill of the screen height, without overflowing the width
      const H = u.uHeroH.value, aspect = u.uHeroSize.value.x / u.uHeroSize.value.y
      u.uMaxZoom.value = Math.min(c.lensFill / (c.lens.h * H), (c.lensFill * innerWidth) / (c.lens.w * aspect * H * innerHeight))
    }
    resize(); addEventListener('resize', resize)

    const tex = (img: Img, size?: string) => {
      const t = img instanceof HTMLCanvasElement ? new THREE.CanvasTexture(img) : new THREE.Texture(img)
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.needsUpdate = true
      if (size) u[size].value.set(img.width, img.height)
      return t
    }
    const miss: string[] = []
    const slot = (file: string, fallback: (() => Img) | null) => load((window as any).__slots?.[file] ?? DIR + file).catch(() => { if (fallback) miss.push(file); return fallback ? fallback() : null })
    let dead = false
    const A = SCENE1.assets
    Promise.all([slot(A.skyline, testSkyline), slot(A.skylineDepth, null), slot(A.hero, testHero), slot(A.heroDepth, null), slot(A.eye, testMask), slot(A.foreground, null), slot(A.lensMatte, null), slot(A.reflection, null)])
      .then(([sky, skyD, hero, heroD, mask, fg, lens, refl]) => {
        if (dead) return
        u.tSky.value = tex(sky!, 'uSkySize')
        if (skyD) { const t = tex(skyD); t.colorSpace = THREE.NoColorSpace; u.tSkyD.value = t; u.uHasSkyD.value = 1 }
        u.tHero.value = tex(hero!, 'uHeroSize')
        if (heroD) { const t = tex(heroD); t.colorSpace = THREE.NoColorSpace; u.tHeroD.value = t; u.uHasHeroD.value = 1 }
        u.tMask.value = tex(mask!); u.uHasMask.value = miss.includes(A.eye) ? 0 : 1
        if (lens) { const t = tex(lens); t.colorSpace = THREE.NoColorSpace; u.tLens.value = t; u.uHasLens.value = 1 }
        u.tRefl.value = refl ? tex(refl, 'uReflSize') : u.tSky.value; if (!refl) u.uReflSize.value.copy(u.uSkySize.value)
        resize()
        if (fg) { u.tFg.value = tex(fg, 'uFgSize'); u.uHasFg.value = 1 }
        setMissing(miss); setReady(true)
      })

    const mouse = new THREE.Vector2(), target = new THREE.Vector2()
    const onMove = (e: PointerEvent) => target.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1)
    if (!reduced) addEventListener('pointermove', onMove)
    let raf = 0, last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, .05); last = now
      u.uTime.value += dt
      mouse.lerp(target, 1 - Math.exp(-4 * dt)); u.uMouse.value.copy(mouse)
      // only while this scene's scroll track overlaps the screen
      const tr = track.current?.getBoundingClientRect()
      const on = !!tr && tr.bottom > 0 && tr.top < innerHeight
      if (on !== active.current) { active.current = on; if (root.current) root.current.style.visibility = on ? 'visible' : 'hidden' }
      if (on) renderer.render(scene, cam)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    ;(window as any).__s1 = u
    return () => { dead = true; cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', onMove); renderer.dispose(); mat.dispose() }
  }, [])

  /* ---------------- timelines ---------------- */
  useLayoutEffect(() => {
    if (!ready || !U.current) return
    const u = U.current, G = reduced ? 0 : 1
    const ctx = gsap.context(() => {
      // opening: darkness, distant traffic fades in, UI chrome appears. Everything else is scroll-driven.
      gsap.timeline()
        .to(u.uTraffic, { value: 1, duration: reduced ? .01 : 2.4, ease: 'power2.out' })
        .to(u.uReveal, { value: .12, duration: 2 }, 0)
          .from('.t1-begin-in', { opacity: 0, y: 10, duration: 1 }, 1.2)

      // a deliberate glitch hit (used at chosen beats, never random during the scroll)
      const hit = (power: number) => {
        if (reduced) return
        gsap.timeline().to(u.uGlitch, { value: power, duration: .04 }).to(u.uStrips, { value: Math.min(1, u.uStrips.value + .4), duration: .05 }, 0)
          .to(u.uGlitch, { value: 0, duration: .35, ease: 'power2.out' }).to(u.uStrips, { value: .2, duration: .5 }, .08)
      }
      let fired = { a: false, b: false }

      /* SCROLL = THE CAMERA. 0–20 city · 20–40 hero · 40–60 push · 60–80 type + glitch · 80–100 eye */
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: track.current, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : 1.2,
          onUpdate: (s) => {
            setProgress(s.progress)
            if (s.progress > .2 && !fired.a) { fired.a = true; hit(.8) }        // hero entrance
            if (s.progress > .62 && !fired.b) { fired.b = true; hit(.6) }       // title hit
            if (s.progress < .15) fired.a = false
            if (s.progress < .55) fired.b = false
          },
        },
      })
        // 0–20 %: the city emerges from darkness; light sweeps across it
        .to(u.uReveal, { value: 1, duration: .2, ease: 'power1.in' }, 0)
        .to(u.uSweep, { value: .45, duration: .2 }, 0)
        // 20–40 %: Spider-Man is revealed (rises into frame, colour against the B&W city)
        .to(u.uHeroIn, { value: 1, duration: .2, ease: 'power2.out' }, .2)
        .to(u.uStrips, { value: .2 * G, duration: .05 }, .2)
        // 40–60 %: slow cinematic push
        .to(u.uPush, { value: reduced ? .1 : .32, duration: .2, ease: 'sine.inOut' }, .4)
        .to(u.uSweep, { value: .8, duration: .2 }, .4)
        // 60–80 %: typography — name, roles — revealed by the scroll
        .fromTo('.t1-over', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .04 }, .6)
        .fromTo('.t1-a .ch', { yPercent: 115 }, { yPercent: 0, stagger: .004, duration: .06, ease: 'power3.out' }, .61)
        .fromTo('.t1-b .ch', { yPercent: 115 }, { yPercent: 0, stagger: .005, duration: .07, ease: 'power3.out' }, .63)
        .fromTo('.t1-role', { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: .015, duration: .04 }, .68)
        .to(u.uPush, { value: reduced ? .12 : .4, duration: .2 }, .6)
        // 80–100 %: type clears, camera flies to the eye, the lens fills the screen
        .to('.t1-text', { opacity: 0, y: -40, duration: .05, ease: 'power2.in' }, .8)
        .to(u.uPush, { value: reduced ? .2 : 1, duration: .17, ease: 'power2.in' }, .8)
        .to(u.uMaskMix, { value: 1, duration: .1, ease: 'sine.inOut' }, .82)   // sharper close-up pixels, aligned — no image swap
        .to(u.uGlitch, { value: .5 * G, duration: .02 }, .9)
        .to(u.uReflect, { value: .7, duration: .05, ease: 'sine.out' }, .88)   // the lens reflects the city…
        .to(u.uPortal, { value: 1, duration: .11, ease: 'power1.in' }, .89)   // …which distorts, fractures and becomes a portal
        .to(u.uGlitch, { value: 0, duration: .04 }, .95)
        .to(u.uStrips, { value: 0, duration: .04 }, .95)
    }, root)
    return () => ctx.revert()
  }, [ready])


  const [n0, ...rest] = profile.name.split(' ')
  const a = [n0, rest[0]].join(' ')
  const b = rest.slice(1).join(' ')
  return (
    <div ref={root} className="t1 text-white">
      <canvas ref={canvas} className="pointer-events-none fixed inset-0 h-full w-full" aria-label="Spider-Man above New York; the camera pushes into his eye" role="img" />

      {/* typography */}
      <section className="t1-text pointer-events-none fixed z-10 left-6 right-6 bottom-[10vh] sm:left-12 sm:right-auto sm:max-w-[60vw]" aria-label="Introduction">
        <div className="t1-over mb-3 font-mono text-[10px] tracking-[0.32em] text-white/70 sm:text-[11px]">{SCENE1.copy.overline}</div>
        <h1 className="t1-display leading-[0.84]">
          <span className="t1-a block overflow-hidden whitespace-nowrap text-[clamp(34px,5vw,72px)] text-white t1-chroma">{[...a].map((c, i) => <span key={i} className="ch inline-block">{c === ' ' ? ' ' : c}</span>)}</span>
          <span className="t1-b block overflow-hidden whitespace-nowrap text-[clamp(70px,12vw,190px)] text-[#e8202f] t1-chroma-strong">{[...b].map((c, i) => <span key={i} className="ch inline-block">{c}</span>)}</span>
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[clamp(12px,1.1vw,15px)] font-semibold tracking-[0.2em]">
          {SCENE1.copy.roles.map((r, i) => <span key={r} className="t1-role">{i > 0 && <span className="mr-3 text-[#2f6bff]">|</span>}{r}</span>)}
        </div>
      </section>
      <div className="t1-begin pointer-events-none fixed inset-x-0 top-1/2 z-10 -translate-y-1/2 text-center transition-opacity duration-500" style={{ opacity: progress < .02 && first ? 1 : 0 }}>
        <div className="t1-begin-in"><div className="font-mono text-[11px] tracking-[0.5em] text-white/70">SCROLL TO BEGIN</div>
        <div className="mx-auto mt-4 h-10 w-px animate-pulse bg-gradient-to-b from-white/70 to-transparent" /></div>
      </div>
      {/* asset status (only while slots are empty) */}
      {preview && missing.length > 0 && (
        <div className="fixed right-4 top-20 z-30 max-w-[300px] sm:bottom-14 sm:top-auto border border-[#e8202f]/60 bg-black/80 p-3 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-white/80 sm:right-8">
          <div className="mb-1 text-[#ff4a5a]">ASSET SLOTS EMPTY — TEST CARDS SHOWN</div>
          {missing.map((m) => <div key={m}>· {m}</div>)}
          <div className="mt-1 text-white/50">→ public/assets/tribute/scene1/</div>
        </div>
      )}
      {!ready && <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-black font-mono text-[11px] tracking-[0.4em] text-white/60">LOADING</div>}
      <div ref={track} data-scene-marker="rooftop" className="relative" style={{ height: `${(SCREENS + 1) * 100}vh` }} aria-hidden>
        {/* the eye scene starts at 80 % of this track */}
        <div data-scene-marker="eye" className="absolute inset-x-0" style={{ top: `${0.8 * SCREENS * 100}vh` }} />
      </div>
    </div>
  )
}
